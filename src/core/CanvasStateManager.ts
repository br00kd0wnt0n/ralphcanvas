import { v4 as uuidv4 } from 'uuid';
import { CanvasState, CanvasElement, CanvasOperation, OperationType } from '../types/canvas';
import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class CanvasStateManager extends EventEmitter {
  private state: CanvasState;
  private pendingOperations: CanvasOperation[] = [];
  private operationTimeout: NodeJS.Timeout | null = null;
  private readonly OPERATION_BATCH_INTERVAL = 1000; // 1 second
  private canvasId: string;

  constructor(canvasId: string = 'default-canvas') {
    super();
    this.canvasId = canvasId;
    this.state = {
      elements: {},
      version: 0,
      lastModified: new Date(),
      metadata: {
        name: 'Untitled Canvas',
        createdBy: 'system',
        createdAt: new Date(),
        lastModifiedBy: 'system'
      }
    };
  }

  async initialize(): Promise<void> {
    try {
      const { data: currentState, error } = await supabase
        .from('canvas_states')
        .select('*')
        .eq('canvas_id', this.canvasId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (currentState) {
        this.state = currentState.state;
        if (typeof this.state.lastModified === 'string') {
          this.state.lastModified = new Date(this.state.lastModified);
        }
        if (this.state.metadata) {
          if (typeof this.state.metadata.createdAt === 'string') {
            this.state.metadata.createdAt = new Date(this.state.metadata.createdAt);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize canvas state:', error);
      throw error;
    }
  }

  getState(): CanvasState {
    return { ...this.state };
  }

  getElement(elementId: string): CanvasElement | undefined {
    return this.state.elements[elementId];
  }

  async applyOperation(operation: CanvasOperation): Promise<void> {
    // Validate operation
    if (!this.validateOperation(operation)) {
      throw new Error('Invalid operation');
    }

    // Apply operation to local state
    this.applyOperationToState(operation);

    // Add to pending operations
    this.pendingOperations.push(operation);

    // Schedule batch save if not already scheduled
    if (!this.operationTimeout) {
      this.operationTimeout = setTimeout(() => this.savePendingOperations(), this.OPERATION_BATCH_INTERVAL);
    }

    // Emit state change event
    this.emit('stateChange', this.state);
  }

  private validateOperation(operation: CanvasOperation): boolean {
    switch (operation.type) {
      case OperationType.ADD:
        return !this.state.elements[operation.elementId];
      case OperationType.UPDATE:
        return !!this.state.elements[operation.elementId];
      case OperationType.DELETE:
        return !!this.state.elements[operation.elementId];
      default:
        return false;
    }
  }

  private applyOperationToState(operation: CanvasOperation): void {
    switch (operation.type) {
      case OperationType.ADD:
      case OperationType.UPDATE:
        if (operation.element) {
          this.state.elements[operation.elementId] = operation.element;
        }
        break;
      case OperationType.DELETE:
        delete this.state.elements[operation.elementId];
        break;
    }
    this.state.version++;
    this.state.lastModified = new Date();
  }

  private async savePendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    try {
      const { error } = await supabase
        .from('canvas_operations')
        .insert(
          this.pendingOperations.map(op => ({
            canvas_id: this.canvasId,
            operation_type: op.type,
            element_id: op.elementId,
            element: op.element,
            timestamp: op.timestamp.toISOString()
          }))
        );

      if (error) throw error;
      this.pendingOperations = [];
    } catch (error) {
      console.error('Failed to save operations:', error);
      // Implement retry logic or error handling as needed
    } finally {
      this.operationTimeout = null;
    }
  }

  async createElement(type: string, properties: any): Promise<CanvasElement> {
    const elementId = uuidv4();
    const element: CanvasElement = {
      id: elementId,
      type,
      properties,
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    const operation: CanvasOperation = {
      type: OperationType.ADD,
      elementId,
      element,
      timestamp: new Date()
    };

    await this.applyOperation(operation);
    return element;
  }

  async updateElement(elementId: string, properties: any): Promise<void> {
    const existingElement = this.state.elements[elementId];
    if (!existingElement) {
      throw new Error(`Element ${elementId} not found`);
    }

    const updatedElement: CanvasElement = {
      ...existingElement,
      properties: { ...existingElement.properties, ...properties },
      modifiedAt: new Date()
    };

    const operation: CanvasOperation = {
      type: OperationType.UPDATE,
      elementId,
      element: updatedElement,
      timestamp: new Date()
    };

    await this.applyOperation(operation);
  }

  async deleteElement(elementId: string): Promise<void> {
    if (!this.state.elements[elementId]) {
      throw new Error(`Element ${elementId} not found`);
    }

    const operation: CanvasOperation = {
      type: OperationType.DELETE,
      elementId,
      timestamp: new Date()
    };

    await this.applyOperation(operation);
  }

  async evolveState(userId: string): Promise<CanvasState> {
    try {
      // Get pending operations
      const { data: operations, error: opsError } = await supabase
        .from('canvas_operations')
        .select('*')
        .eq('canvas_id', this.canvasId)
        .gt('timestamp', this.state.lastModified.toISOString())
        .order('timestamp', { ascending: true });

      if (opsError) throw opsError;

      // Apply operations to evolve state
      for (const op of operations || []) {
        const operation = op as CanvasOperation;
        switch (operation.type) {
          case OperationType.ADD:
          case OperationType.UPDATE:
            if (operation.element) {
              this.state.elements[operation.elementId] = operation.element;
            }
            break;
          case OperationType.DELETE:
            delete this.state.elements[operation.elementId];
            break;
        }
      }

      // Update state version and timestamp
      this.state.version++;
      this.state.lastModified = new Date();
      this.state.metadata.lastModifiedBy = userId;

      // Save evolved state
      const { error: saveError } = await supabase
        .from('canvas_states')
        .insert({
          canvas_id: this.canvasId,
          version: this.state.version,
          state: this.state,
          created_by: userId,
          created_at: new Date().toISOString()
        });

      if (saveError) throw saveError;

      this.emit('stateChange', this.state);
      return this.getState();
    } catch (error) {
      console.error('Failed to evolve state:', error);
      throw error;
    }
  }

  // Cleanup method to be called when shutting down
  async cleanup(): Promise<void> {
    if (this.operationTimeout) {
      clearTimeout(this.operationTimeout);
    }
    await this.savePendingOperations();
  }
} 
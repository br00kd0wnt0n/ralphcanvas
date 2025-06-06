import { v4 as uuidv4 } from 'uuid';
import { CanvasState, CanvasElement, CanvasOperation, OperationType } from '../types/canvas';
import { DatabaseManager } from '../database/DatabaseManager';
import { EventEmitter } from 'events';

export class CanvasStateManager extends EventEmitter {
  private state: CanvasState;
  private databaseManager: DatabaseManager;
  private pendingOperations: CanvasOperation[] = [];
  private operationTimeout: NodeJS.Timeout | null = null;
  private readonly OPERATION_BATCH_INTERVAL = 1000; // 1 second

  constructor(databaseManager: DatabaseManager) {
    super();
    this.databaseManager = databaseManager;
    this.state = {
      elements: new Map(),
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

  async initialize(canvasId?: string): Promise<void> {
    if (canvasId) {
      const savedState = await this.databaseManager.loadCanvasState(canvasId);
      if (savedState) {
        this.state = savedState;
      }
    }
  }

  getState(): CanvasState {
    return { ...this.state };
  }

  getElement(elementId: string): CanvasElement | undefined {
    return this.state.elements.get(elementId);
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
        return !this.state.elements.has(operation.elementId);
      case OperationType.UPDATE:
        return this.state.elements.has(operation.elementId);
      case OperationType.DELETE:
        return this.state.elements.has(operation.elementId);
      default:
        return false;
    }
  }

  private applyOperationToState(operation: CanvasOperation): void {
    switch (operation.type) {
      case OperationType.ADD:
        this.state.elements.set(operation.elementId, operation.element);
        break;
      case OperationType.UPDATE:
        if (operation.element) {
          this.state.elements.set(operation.elementId, operation.element);
        }
        break;
      case OperationType.DELETE:
        this.state.elements.delete(operation.elementId);
        break;
    }
    this.state.version++;
    this.state.lastModified = new Date();
  }

  private async savePendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    try {
      await this.databaseManager.saveOperations(this.pendingOperations);
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
    const existingElement = this.state.elements.get(elementId);
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
    if (!this.state.elements.has(elementId)) {
      throw new Error(`Element ${elementId} not found`);
    }

    const operation: CanvasOperation = {
      type: OperationType.DELETE,
      elementId,
      timestamp: new Date()
    };

    await this.applyOperation(operation);
  }

  // Cleanup method to be called when shutting down
  async cleanup(): Promise<void> {
    if (this.operationTimeout) {
      clearTimeout(this.operationTimeout);
    }
    await this.savePendingOperations();
  }
} 
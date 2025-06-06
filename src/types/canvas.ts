export enum OperationType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export interface CanvasElement {
  id: string;
  type: string;
  properties: Record<string, any>;
  createdAt: Date;
  modifiedAt: Date;
}

export interface CanvasOperation {
  type: OperationType;
  elementId: string;
  element?: CanvasElement;
  timestamp: Date;
}

export interface CanvasMetadata {
  name: string;
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
}

export interface CanvasState {
  elements: Map<string, CanvasElement>;
  version: number;
  lastModified: Date;
  metadata: CanvasMetadata;
}

export interface CanvasSnapshot {
  id: string;
  state: CanvasState;
  createdAt: Date;
  createdBy: string;
}

export interface CanvasCollaborationSession {
  id: string;
  canvasId: string;
  userId: string;
  joinedAt: Date;
  lastActive: Date;
  cursor?: {
    x: number;
    y: number;
    userId: string;
  };
} 
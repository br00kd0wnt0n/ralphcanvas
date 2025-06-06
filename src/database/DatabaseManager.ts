import { DataSource, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CanvasState, CanvasOperation, CanvasSnapshot, CanvasCollaborationSession } from '../types/canvas';

@Entity()
class CanvasEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  state: CanvasState;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdBy: string;

  @Column()
  lastModifiedBy: string;
}

@Entity()
class OperationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  canvasId: string;

  @Column('jsonb')
  operation: CanvasOperation;

  @CreateDateColumn()
  timestamp: Date;
}

@Entity()
class SnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  canvasId: string;

  @Column('jsonb')
  state: CanvasState;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: string;
}

@Entity()
class CollaborationSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  canvasId: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  lastActive: Date;

  @Column('jsonb', { nullable: true })
  cursor: { x: number; y: number; userId: string } | null;
}

export class DatabaseManager {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'ralph_canvas',
      entities: [CanvasEntity, OperationEntity, SnapshotEntity, CollaborationSessionEntity],
      synchronize: process.env.NODE_ENV !== 'production', // Be careful with this in production
      logging: process.env.NODE_ENV !== 'production'
    });
  }

  async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  async loadCanvasState(canvasId: string): Promise<CanvasState | null> {
    const canvas = await this.dataSource
      .getRepository(CanvasEntity)
      .findOne({ where: { id: canvasId } });

    return canvas?.state || null;
  }

  async saveOperations(operations: CanvasOperation[]): Promise<void> {
    const operationEntities = operations.map(op => ({
      canvasId: op.elementId, // You might want to adjust this based on your needs
      operation: op,
      timestamp: op.timestamp
    }));

    await this.dataSource
      .getRepository(OperationEntity)
      .save(operationEntities);
  }

  async createSnapshot(canvasId: string, state: CanvasState, userId: string): Promise<CanvasSnapshot> {
    const snapshot = await this.dataSource
      .getRepository(SnapshotEntity)
      .save({
        canvasId,
        state,
        createdBy: userId
      });

    return {
      id: snapshot.id,
      state: snapshot.state,
      createdAt: snapshot.createdAt,
      createdBy: snapshot.createdBy
    };
  }

  async getSnapshots(canvasId: string): Promise<CanvasSnapshot[]> {
    const snapshots = await this.dataSource
      .getRepository(SnapshotEntity)
      .find({
        where: { canvasId },
        order: { createdAt: 'DESC' }
      });

    return snapshots.map(snapshot => ({
      id: snapshot.id,
      state: snapshot.state,
      createdAt: snapshot.createdAt,
      createdBy: snapshot.createdBy
    }));
  }

  async createCollaborationSession(
    canvasId: string,
    userId: string
  ): Promise<CanvasCollaborationSession> {
    const session = await this.dataSource
      .getRepository(CollaborationSessionEntity)
      .save({
        canvasId,
        userId,
        joinedAt: new Date(),
        lastActive: new Date()
      });

    return {
      id: session.id,
      canvasId: session.canvasId,
      userId: session.userId,
      joinedAt: session.joinedAt,
      lastActive: session.lastActive,
      cursor: session.cursor || undefined
    };
  }

  async updateCollaborationSession(
    sessionId: string,
    updates: Partial<CanvasCollaborationSession>
  ): Promise<void> {
    await this.dataSource
      .getRepository(CollaborationSessionEntity)
      .update(sessionId, {
        ...updates,
        lastActive: new Date()
      });
  }

  async getActiveCollaborators(canvasId: string): Promise<CanvasCollaborationSession[]> {
    const sessions = await this.dataSource
      .getRepository(CollaborationSessionEntity)
      .find({
        where: { canvasId },
        order: { lastActive: 'DESC' }
      });

    return sessions.map(session => ({
      id: session.id,
      canvasId: session.canvasId,
      userId: session.userId,
      joinedAt: session.joinedAt,
      lastActive: session.lastActive,
      cursor: session.cursor || undefined
    }));
  }

  async cleanup(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
} 
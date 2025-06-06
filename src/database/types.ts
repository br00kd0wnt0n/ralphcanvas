import { CanvasState } from '../types/canvas';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      canvas_states: {
        Row: {
          id: string
          canvas_id: string | null
          state: CanvasState
          created_at: string
          updated_at: string
          version: number
          created_by: string | null
        }
        Insert: {
          id?: string
          canvas_id?: string | null
          state: CanvasState
          created_at?: string
          updated_at?: string
          version?: number
          created_by?: string | null
        }
        Update: {
          id?: string
          canvas_id?: string | null
          state?: CanvasState
          created_at?: string
          updated_at?: string
          version?: number
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
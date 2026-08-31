export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          action_description: string
          assignee_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          risk_finding_id: string
          status: string
          updated_at: string
        }
        Insert: {
          action_description: string
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          risk_finding_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          action_description?: string
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          risk_finding_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_risk_finding_id_fkey"
            columns: ["risk_finding_id"]
            isOneToOne: false
            referencedRelation: "risk_findings"
            referencedColumns: ["id"]
          },
        ]
      }
      action_status_logs: {
        Row: {
          action_item_id: string
          changed_at: string
          changed_by: string | null
          comment: string | null
          from_status: string | null
          id: string
          to_status: string
        }
        Insert: {
          action_item_id: string
          changed_at?: string
          changed_by?: string | null
          comment?: string | null
          from_status?: string | null
          id?: string
          to_status: string
        }
        Update: {
          action_item_id?: string
          changed_at?: string
          changed_by?: string | null
          comment?: string | null
          from_status?: string | null
          id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_status_logs_action_item_id_fkey"
            columns: ["action_item_id"]
            isOneToOne: false
            referencedRelation: "action_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_status_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoint_types: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      photos: {
        Row: {
          ai_status: string
          checkpoint_type_id: string | null
          created_at: string
          file_path: string
          id: string
          sequence_no: number
          taken_at: string | null
          thumbnail_path: string | null
          uploaded_by: string | null
          visit_id: string
        }
        Insert: {
          ai_status?: string
          checkpoint_type_id?: string | null
          created_at?: string
          file_path: string
          id?: string
          sequence_no: number
          taken_at?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          visit_id: string
        }
        Update: {
          ai_status?: string
          checkpoint_type_id?: string | null
          created_at?: string
          file_path?: string
          id?: string
          sequence_no?: number
          taken_at?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_checkpoint_type_id_fkey"
            columns: ["checkpoint_type_id"]
            isOneToOne: false
            referencedRelation: "checkpoint_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      risk_findings: {
        Row: {
          ai_generated: boolean
          ai_raw_response: Json | null
          category: string
          created_at: string
          description: string
          id: string
          photo_id: string
          regulation_ref: string | null
          severity: string
          status: string
          updated_at: string
          visit_id: string
        }
        Insert: {
          ai_generated?: boolean
          ai_raw_response?: Json | null
          category: string
          created_at?: string
          description: string
          id?: string
          photo_id: string
          regulation_ref?: string | null
          severity?: string
          status?: string
          updated_at?: string
          visit_id: string
        }
        Update: {
          ai_generated?: boolean
          ai_raw_response?: Json | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          photo_id?: string
          regulation_ref?: string | null
          severity?: string
          status?: string
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_findings_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_findings_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      slaughterhouse_members: {
        Row: {
          created_at: string
          id: string
          role: string
          slaughterhouse_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          slaughterhouse_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          slaughterhouse_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slaughterhouse_members_slaughterhouse_id_fkey"
            columns: ["slaughterhouse_id"]
            isOneToOne: false
            referencedRelation: "slaughterhouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slaughterhouse_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      slaughterhouses: {
        Row: {
          address: string | null
          animal_type: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          region: string | null
        }
        Insert: {
          address?: string | null
          animal_type?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          region?: string | null
        }
        Update: {
          address?: string | null
          animal_type?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          region?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slaughterhouses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          created_at: string
          id: string
          inspector_id: string | null
          slaughterhouse_id: string
          status: string
          updated_at: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          inspector_id?: string | null
          slaughterhouse_id: string
          status?: string
          updated_at?: string
          visit_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          inspector_id?: string | null
          slaughterhouse_id?: string
          status?: string
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_slaughterhouse_id_fkey"
            columns: ["slaughterhouse_id"]
            isOneToOne: false
            referencedRelation: "slaughterhouses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_slaughterhouse: { Args: { target_id: string }; Returns: boolean }
      has_slaughterhouse_access: {
        Args: { target_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]

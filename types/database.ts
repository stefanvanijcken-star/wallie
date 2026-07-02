export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      savings_jars: {
        Row: {
          balance: number
          color: string
          created_at: string
          goal: number | null
          icon: string
          id: string
          name: string
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          color: string
          created_at?: string
          goal?: number | null
          icon: string
          id?: string
          name: string
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          color?: string
          created_at?: string
          goal?: number | null
          icon?: string
          id?: string
          name?: string
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_rules: {
        Row: {
          active: boolean
          amount: number
          created_at: string
          frequency: Database["public"]["Enums"]["savings_rule_frequency"]
          id: string
          jar_id: string
          name: string
          schedule_day: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          created_at?: string
          frequency: Database["public"]["Enums"]["savings_rule_frequency"]
          id?: string
          jar_id: string
          name: string
          schedule_day: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string
          frequency?: Database["public"]["Enums"]["savings_rule_frequency"]
          id?: string
          jar_id?: string
          name?: string
          schedule_day?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_rules_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "savings_jars"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          id: string
          jar_id: string | null
          metadata: Json
          source_jar_id: string | null
          target_jar_id: string | null
          title: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          jar_id?: string | null
          metadata?: Json
          source_jar_id?: string | null
          target_jar_id?: string | null
          title: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          jar_id?: string | null
          metadata?: Json
          source_jar_id?: string | null
          target_jar_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "savings_jars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_jar_id_fkey"
            columns: ["source_jar_id"]
            isOneToOne: false
            referencedRelation: "savings_jars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_target_jar_id_fkey"
            columns: ["target_jar_id"]
            isOneToOne: false
            referencedRelation: "savings_jars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      savings_rule_frequency: "weekly" | "monthly"
      transaction_type:
        | "jar_created"
        | "jar_updated"
        | "jar_deleted"
        | "money_moved"
        | "account_updated"
        | "rule_created"
        | "rule_updated"
        | "rule_deleted"
    }
    CompositeTypes: Record<string, never>
  }
}

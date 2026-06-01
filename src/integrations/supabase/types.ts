export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bus_lines: {
        Row: {
          cor: string
          created_at: string
          directions: string[]
          id: number
          nome: string
          numero: string
          sonda_codigo_veiculo: string | null
          sonda_id_linha: string | null
          updated_at: string
          via: string | null
        }
        Insert: {
          cor?: string
          created_at?: string
          directions?: string[]
          id?: number
          nome: string
          numero: string
          sonda_codigo_veiculo?: string | null
          sonda_id_linha?: string | null
          updated_at?: string
          via?: string | null
        }
        Update: {
          cor?: string
          created_at?: string
          directions?: string[]
          id?: number
          nome?: string
          numero?: string
          sonda_codigo_veiculo?: string | null
          sonda_id_linha?: string | null
          updated_at?: string
          via?: string | null
        }
        Relationships: []
      }
      bus_schedules: {
        Row: {
          bus_line_id: number
          created_at: string
          day_type: string
          direction: string
          hora: string
          id: string
          obs: string | null
          updated_at: string
        }
        Insert: {
          bus_line_id: number
          created_at?: string
          day_type: string
          direction: string
          hora: string
          id?: string
          obs?: string | null
          updated_at?: string
        }
        Update: {
          bus_line_id?: number
          created_at?: string
          day_type?: string
          direction?: string
          hora?: string
          id?: string
          obs?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_schedules_bus_line_id_fkey"
            columns: ["bus_line_id"]
            isOneToOne: false
            referencedRelation: "bus_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_schedule_changes: {
        Row: {
          applied_at: string | null
          bus_line_id: number
          change_type: string
          created_at: string
          day_type: string | null
          direction: string | null
          id: string
          new_hora: string | null
          new_obs: string | null
          payload: Json | null
          scheduled_for: string
          target_hora: string | null
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          bus_line_id: number
          change_type: string
          created_at?: string
          day_type?: string | null
          direction?: string | null
          id?: string
          new_hora?: string | null
          new_obs?: string | null
          payload?: Json | null
          scheduled_for: string
          target_hora?: string | null
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          bus_line_id?: number
          change_type?: string
          created_at?: string
          day_type?: string | null
          direction?: string | null
          id?: string
          new_hora?: string | null
          new_obs?: string | null
          payload?: Json | null
          scheduled_for?: string
          target_hora?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_schedule_changes_bus_line_id_fkey"
            columns: ["bus_line_id"]
            isOneToOne: false
            referencedRelation: "bus_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      sonda_credentials: {
        Row: {
          created_at: string
          id: string
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      special_date_line_overrides: {
        Row: {
          bus_line_id: number
          created_at: string
          id: string
          override: string
          special_date_id: string
        }
        Insert: {
          bus_line_id: number
          created_at?: string
          id?: string
          override: string
          special_date_id: string
        }
        Update: {
          bus_line_id?: number
          created_at?: string
          id?: string
          override?: string
          special_date_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_date_line_overrides_bus_line_id_fkey"
            columns: ["bus_line_id"]
            isOneToOne: false
            referencedRelation: "bus_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_date_line_overrides_special_date_id_fkey"
            columns: ["special_date_id"]
            isOneToOne: false
            referencedRelation: "special_dates"
            referencedColumns: ["id"]
          },
        ]
      }
      special_dates: {
        Row: {
          created_at: string
          date: string
          default_override: string | null
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          default_override?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          default_override?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      setup_first_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessment_results: {
        Row: {
          completed_at: string | null
          created_at: string | null
          department_scores: Json
          experience_level: string
          id: string
          interests: string[]
          recommended_courses: string[]
          time_taken_seconds: number | null
          total_score: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          department_scores: Json
          experience_level: string
          id?: string
          interests: string[]
          recommended_courses: string[]
          time_taken_seconds?: number | null
          total_score: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          department_scores?: Json
          experience_level?: string
          id?: string
          interests?: string[]
          recommended_courses?: string[]
          time_taken_seconds?: number | null
          total_score?: number
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credits: number
          department_id: string
          description: string | null
          duration: string | null
          id: string
          is_locked: boolean
          is_published: boolean
          level: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credits?: number
          department_id: string
          description?: string | null
          duration?: string | null
          id?: string
          is_locked?: boolean
          is_published?: boolean
          level?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number
          department_id?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_locked?: boolean
          is_published?: boolean
          level?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_code: string
          created_at: string
          enrolled_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_code: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_code?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          module_id: string
          sort_order: number
          title: string
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          module_id: string
          sort_order?: number
          title: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          module_id?: string
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          camera_gear: string | null
          display_name: string | null
          enrolled_at: string
          id: string
          instagram_url: string | null
          location: string | null
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          camera_gear?: string | null
          display_name?: string | null
          enrolled_at?: string
          id?: string
          instagram_url?: string | null
          location?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          camera_gear?: string | null
          display_name?: string | null
          enrolled_at?: string
          id?: string
          instagram_url?: string | null
          location?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          attempt_number: number | null
          course_code: string
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          attempt_number?: number | null
          course_code: string
          created_at?: string
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          time_taken_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          attempt_number?: number | null
          course_code?: string
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_code: string
          created_at: string
          credits_earned: number
          id: string
          lesson_id: string | null
          updated_at: string
          user_id: string
          video_duration_seconds: number | null
          watch_percentage: number | null
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_code: string
          created_at?: string
          credits_earned?: number
          id?: string
          lesson_id?: string | null
          updated_at?: string
          user_id: string
          video_duration_seconds?: number | null
          watch_percentage?: number | null
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_code?: string
          created_at?: string
          credits_earned?: number
          id?: string
          lesson_id?: string | null
          updated_at?: string
          user_id?: string
          video_duration_seconds?: number | null
          watch_percentage?: number | null
          watched_seconds?: number | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      can_enroll: { Args: { _user_id: string }; Returns: boolean }
      get_active_enrollment_count: {
        Args: { _user_id: string }
        Returns: number
      }
      get_quiz_attempt_count: {
        Args: { _quiz_id: string; _user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "student"
      membership_tier: "freshman" | "sophomore" | "graduate"
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
      app_role: ["admin", "moderator", "student"],
      membership_tier: ["freshman", "sophomore", "graduate"],
    },
  },
} as const

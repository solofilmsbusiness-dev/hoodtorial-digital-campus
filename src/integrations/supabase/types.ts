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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          actionable_suggestion: string | null
          content: string
          created_at: string
          id: string
          is_highlighted: boolean
          is_instructor_comment: boolean
          media_urls: string[] | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
          what_could_improve: string | null
          what_works: string | null
        }
        Insert: {
          actionable_suggestion?: string | null
          content: string
          created_at?: string
          id?: string
          is_highlighted?: boolean
          is_instructor_comment?: boolean
          media_urls?: string[] | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
          what_could_improve?: string | null
          what_works?: string | null
        }
        Update: {
          actionable_suggestion?: string | null
          content?: string
          created_at?: string
          id?: string
          is_highlighted?: boolean
          is_instructor_comment?: boolean
          media_urls?: string[] | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
          what_could_improve?: string | null
          what_works?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: Database["public"]["Enums"]["post_category"]
          content: string
          course_code: string | null
          created_at: string
          id: string
          is_highlighted: boolean
          is_pinned: boolean
          is_project_post: boolean
          media_urls: string[] | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["post_category"]
          content: string
          course_code?: string | null
          created_at?: string
          id?: string
          is_highlighted?: boolean
          is_pinned?: boolean
          is_project_post?: boolean
          media_urls?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["post_category"]
          content?: string
          course_code?: string | null
          created_at?: string
          id?: string
          is_highlighted?: boolean
          is_pinned?: boolean
          is_project_post?: boolean
          media_urls?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
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
      notifications: {
        Row: {
          content_preview: string | null
          created_at: string
          id: string
          is_read: boolean
          post_id: string | null
          reference_id: string
          reference_type: string
          sender_id: string
          type: string
          user_id: string
        }
        Insert: {
          content_preview?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          reference_id: string
          reference_type: string
          sender_id: string
          type?: string
          user_id: string
        }
        Update: {
          content_preview?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          reference_id?: string
          reference_type?: string
          sender_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_follows: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_follows_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_border_style: string | null
          avatar_url: string | null
          bio: string | null
          camera_gear: string | null
          cover_banner_url: string | null
          current_project: string | null
          display_name: string | null
          enrolled_at: string
          favorite_films: string[] | null
          filmmaking_style: string | null
          id: string
          imdb_url: string | null
          influences: string | null
          instagram_url: string | null
          location: string | null
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          portfolio_url: string | null
          profile_accent_color: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          tiktok_url: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          vimeo_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_border_style?: string | null
          avatar_url?: string | null
          bio?: string | null
          camera_gear?: string | null
          cover_banner_url?: string | null
          current_project?: string | null
          display_name?: string | null
          enrolled_at?: string
          favorite_films?: string[] | null
          filmmaking_style?: string | null
          id?: string
          imdb_url?: string | null
          influences?: string | null
          instagram_url?: string | null
          location?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          portfolio_url?: string | null
          profile_accent_color?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          vimeo_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_border_style?: string | null
          avatar_url?: string | null
          bio?: string | null
          camera_gear?: string | null
          cover_banner_url?: string | null
          current_project?: string | null
          display_name?: string | null
          enrolled_at?: string
          favorite_films?: string[] | null
          filmmaking_style?: string | null
          id?: string
          imdb_url?: string | null
          influences?: string | null
          instagram_url?: string | null
          location?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          portfolio_url?: string | null
          profile_accent_color?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          vimeo_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          quiz_result_id: string
          selected_answer: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          quiz_result_id: string
          selected_answer: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          quiz_result_id?: string
          selected_answer?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_quiz_result_id_fkey"
            columns: ["quiz_result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          },
        ]
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
      profiles_public: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_paid_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_enrolled_student: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "student"
      membership_tier: "freshman" | "sophomore" | "graduate"
      post_category:
        | "general"
        | "course_discussion"
        | "project_submission"
        | "feedback_critique"
        | "announcement"
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
      post_category: [
        "general",
        "course_discussion",
        "project_submission",
        "feedback_critique",
        "announcement",
      ],
    },
  },
} as const

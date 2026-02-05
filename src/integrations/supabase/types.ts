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
      challenge_submissions: {
        Row: {
          awarded_at: string | null
          challenge_id: string
          created_at: string
          credits_awarded: number | null
          id: string
          is_demo: boolean
          post_id: string | null
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          challenge_id: string
          created_at?: string
          credits_awarded?: number | null
          id?: string
          is_demo?: boolean
          post_id?: string | null
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          challenge_id?: string
          created_at?: string
          credits_awarded?: number | null
          id?: string
          is_demo?: boolean
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          is_demo: boolean
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          is_demo?: boolean
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          is_demo?: boolean
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
          is_demo: boolean
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
          is_demo?: boolean
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
          is_demo?: boolean
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
          challenge_id: string | null
          content: string
          course_code: string | null
          created_at: string
          id: string
          is_demo: boolean
          is_highlighted: boolean
          is_pinned: boolean
          is_project_post: boolean
          media_urls: string[] | null
          target_profile_id: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["post_category"]
          challenge_id?: string | null
          content: string
          course_code?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          is_highlighted?: boolean
          is_pinned?: boolean
          is_project_post?: boolean
          media_urls?: string[] | null
          target_profile_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["post_category"]
          challenge_id?: string | null
          content?: string
          course_code?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          is_highlighted?: boolean
          is_pinned?: boolean
          is_project_post?: boolean
          media_urls?: string[] | null
          target_profile_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
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
          intro_video_url: string | null
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
          intro_video_url?: string | null
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
          intro_video_url?: string | null
          is_locked?: boolean
          is_published?: boolean
          level?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          active_date: string
          category: string
          created_at: string
          created_by: string | null
          credits_reward: number
          description: string
          difficulty: string
          id: string
          is_active: boolean
          prompt: string
          title: string
          updated_at: string
        }
        Insert: {
          active_date: string
          category?: string
          created_at?: string
          created_by?: string | null
          credits_reward?: number
          description: string
          difficulty?: string
          id?: string
          is_active?: boolean
          prompt: string
          title: string
          updated_at?: string
        }
        Update: {
          active_date?: string
          category?: string
          created_at?: string
          created_by?: string | null
          credits_reward?: number
          description?: string
          difficulty?: string
          id?: string
          is_active?: boolean
          prompt?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_settings: {
        Row: {
          demo_comment_count: number
          demo_post_count: number
          demo_user_count: number
          id: string
          is_active: boolean
          last_generated_at: string | null
          show_demo_data: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          demo_comment_count?: number
          demo_post_count?: number
          demo_user_count?: number
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          show_demo_data?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          demo_comment_count?: number
          demo_post_count?: number
          demo_user_count?: number
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          show_demo_data?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          contact_card_data: Json | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          sender_id: string
        }
        Insert: {
          contact_card_data?: Json | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id: string
        }
        Update: {
          contact_card_data?: Json | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_code: string
          created_at: string
          dropped_at: string | null
          enrolled_at: string
          id: string
          is_demo: boolean
          status: string
          swaps_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_code: string
          created_at?: string
          dropped_at?: string | null
          enrolled_at?: string
          id?: string
          is_demo?: boolean
          status?: string
          swaps_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_code?: string
          created_at?: string
          dropped_at?: string | null
          enrolled_at?: string
          id?: string
          is_demo?: boolean
          status?: string
          swaps_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          document_url: string | null
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
          document_url?: string | null
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
          document_url?: string | null
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
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
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
          is_demo: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
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
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          bio: string | null
          camera_gear: string | null
          certificate_department: string | null
          cover_banner_url: string | null
          current_project: string | null
          degree_path: string | null
          display_name: string | null
          enrolled_at: string
          favorite_films: string[] | null
          filmmaking_style: string | null
          id: string
          imdb_url: string | null
          influences: string | null
          instagram_url: string | null
          is_banned: boolean
          is_demo: boolean
          location: string | null
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          onboarding_completed: boolean | null
          portfolio_gallery: string[] | null
          portfolio_url: string | null
          profile_accent_color: string | null
          recommended_degree_path: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          terms_accepted_at: string | null
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
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          camera_gear?: string | null
          certificate_department?: string | null
          cover_banner_url?: string | null
          current_project?: string | null
          degree_path?: string | null
          display_name?: string | null
          enrolled_at?: string
          favorite_films?: string[] | null
          filmmaking_style?: string | null
          id?: string
          imdb_url?: string | null
          influences?: string | null
          instagram_url?: string | null
          is_banned?: boolean
          is_demo?: boolean
          location?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          onboarding_completed?: boolean | null
          portfolio_gallery?: string[] | null
          portfolio_url?: string | null
          profile_accent_color?: string | null
          recommended_degree_path?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
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
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          camera_gear?: string | null
          certificate_department?: string | null
          cover_banner_url?: string | null
          current_project?: string | null
          degree_path?: string | null
          display_name?: string | null
          enrolled_at?: string
          favorite_films?: string[] | null
          filmmaking_style?: string | null
          id?: string
          imdb_url?: string | null
          influences?: string | null
          instagram_url?: string | null
          is_banned?: boolean
          is_demo?: boolean
          location?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          onboarding_completed?: boolean | null
          portfolio_gallery?: string[] | null
          portfolio_url?: string | null
          profile_accent_color?: string | null
          recommended_degree_path?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
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
      quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string
          explanation: string | null
          id: string
          options: Json
          question: string
          quiz_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question: string
          quiz_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          quiz_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
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
          is_demo: boolean
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
          is_demo?: boolean
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
          is_demo?: boolean
          passed?: boolean
          quiz_id?: string
          score?: number
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          is_final_exam: boolean
          module_id: string | null
          passing_score: number
          per_question_seconds: number | null
          sort_order: number
          time_limit_minutes: number | null
          title: string
          updated_at: string
          use_per_question_timer: boolean
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_final_exam?: boolean
          module_id?: string | null
          passing_score?: number
          per_question_seconds?: number | null
          sort_order?: number
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
          use_per_question_timer?: boolean
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_final_exam?: boolean
          module_id?: string | null
          passing_score?: number
          per_question_seconds?: number | null
          sort_order?: number
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
          use_per_question_timer?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin: boolean
          sender_id: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin?: boolean
          sender_id: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
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
          is_demo: boolean
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
          is_demo?: boolean
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
          is_demo?: boolean
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
          avatar_border_style: string | null
          avatar_url: string | null
          bio: string | null
          camera_gear: string | null
          cover_banner_url: string | null
          current_project: string | null
          display_name: string | null
          favorite_films: string[] | null
          filmmaking_style: string | null
          imdb_url: string | null
          influences: string | null
          instagram_url: string | null
          portfolio_gallery: string[] | null
          portfolio_url: string | null
          profile_accent_color: string | null
          tiktok_url: string | null
          twitter_url: string | null
          user_id: string | null
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
          favorite_films?: string[] | null
          filmmaking_style?: string | null
          imdb_url?: string | null
          influences?: string | null
          instagram_url?: string | null
          portfolio_gallery?: string[] | null
          portfolio_url?: string | null
          profile_accent_color?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          user_id?: string | null
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
          favorite_films?: string[] | null
          filmmaking_style?: string | null
          imdb_url?: string | null
          influences?: string | null
          instagram_url?: string | null
          portfolio_gallery?: string[] | null
          portfolio_url?: string | null
          profile_accent_color?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          user_id?: string | null
          vimeo_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      quiz_questions_public: {
        Row: {
          created_at: string | null
          id: string | null
          options: Json | null
          question: string | null
          quiz_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          options?: Json | null
          question?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          options?: Json | null
          question?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      are_friends: {
        Args: { _user1_id: string; _user2_id: string }
        Returns: boolean
      }
      can_enroll: { Args: { _user_id: string }; Returns: boolean }
      check_quiz_answer: {
        Args: { _question_id: string; _selected_answer: number }
        Returns: Json
      }
      get_active_enrollment_count: {
        Args: { _user_id: string }
        Returns: number
      }
      get_or_create_conversation: {
        Args: { _user1_id: string; _user2_id: string }
        Returns: string
      }
      get_pending_friend_request_count: {
        Args: { _user_id: string }
        Returns: number
      }
      get_quiz_attempt_count: {
        Args: { _quiz_id: string; _user_id: string }
        Returns: number
      }
      get_unread_message_count: { Args: { _user_id: string }; Returns: number }
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
      app_role: "admin" | "moderator" | "student" | "professor" | "tester"
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
      app_role: ["admin", "moderator", "student", "professor", "tester"],
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

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alert_rules: {
        Row: {
          condition: string
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          notification_type: string | null
          teacher_id: string | null
          threshold: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          condition: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          notification_type?: string | null
          teacher_id?: string | null
          threshold?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          notification_type?: string | null
          teacher_id?: string | null
          threshold?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          student_id: string | null
          teacher_id: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          student_id?: string | null
          teacher_id?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          student_id?: string | null
          teacher_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      attempts: {
        Row: {
          correct: boolean
          created_at: string | null
          id: string
          item_id: string
          response: string | null
          time_ms: number | null
          user_id: string
        }
        Insert: {
          correct: boolean
          created_at?: string | null
          id?: string
          item_id: string
          response?: string | null
          time_ms?: number | null
          user_id: string
        }
        Update: {
          correct?: boolean
          created_at?: string | null
          id?: string
          item_id?: string
          response?: string | null
          time_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "exam_questions_full"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "attempts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "questions_with_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string | null
          id: string
          joined_at: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          id?: string
          joined_at?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          id?: string
          joined_at?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answered_at: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          session_id: string
          time_spent: number | null
          user_answer: string | null
        }
        Insert: {
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          session_id: string
          time_spent?: number | null
          user_answer?: string | null
        }
        Update: {
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          session_id?: string
          time_spent?: number | null
          user_answer?: string | null
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          created_at: string | null
          exam_set_id: string
          id: string
          order_index: number
          question_id: string
        }
        Insert: {
          created_at?: string | null
          exam_set_id: string
          id?: string
          order_index?: number
          question_id: string
        }
        Update: {
          created_at?: string | null
          exam_set_id?: string
          id?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: false
            referencedRelation: "exam_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions_full"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_with_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          created_at: string | null
          exam_set_id: string | null
          id: string
          results: Json | null
          score: number
          started_at: string | null
          status: string
          time_spent: number
          total_questions: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number
          created_at?: string | null
          exam_set_id?: string | null
          id?: string
          results?: Json | null
          score?: number
          started_at?: string | null
          status?: string
          time_spent?: number
          total_questions?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          created_at?: string | null
          exam_set_id?: string | null
          id?: string
          results?: Json | null
          score?: number
          started_at?: string | null
          status?: string
          time_spent?: number
          total_questions?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: false
            referencedRelation: "exam_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_sets: {
        Row: {
          allow_multiple_attempts: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          is_active: boolean | null
          max_attempts: number | null
          question_count: number | null
          time_limit: number | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          allow_multiple_attempts?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty: string
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          question_count?: number | null
          time_limit?: number | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          allow_multiple_attempts?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          question_count?: number | null
          time_limit?: number | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exam_statistics: {
        Row: {
          average_score: number | null
          average_time_spent: number | null
          completion_rate: number | null
          difficulty_distribution: Json | null
          exam_set_id: string
          id: string
          part_performance: Json | null
          total_attempts: number | null
          updated_at: string | null
        }
        Insert: {
          average_score?: number | null
          average_time_spent?: number | null
          completion_rate?: number | null
          difficulty_distribution?: Json | null
          exam_set_id: string
          id?: string
          part_performance?: Json | null
          total_attempts?: number | null
          updated_at?: string | null
        }
        Update: {
          average_score?: number | null
          average_time_spent?: number | null
          completion_rate?: number | null
          difficulty_distribution?: Json | null
          exam_set_id?: string
          id?: string
          part_performance?: Json | null
          total_attempts?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_statistics_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: true
            referencedRelation: "exam_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      passages: {
        Row: {
          assets: Json | null
          audio_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          meta: Json | null
          part: number
          passage_type: string
          texts: Json
          updated_at: string | null
        }
        Insert: {
          assets?: Json | null
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          meta?: Json | null
          part: number
          passage_type: string
          texts: Json
          updated_at?: string | null
        }
        Update: {
          assets?: Json | null
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          meta?: Json | null
          part?: number
          passage_type?: string
          texts?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          focus: string[] | null
          id: string
          locales: string | null
          name: string | null
          role: string
          target_score: number | null
          test_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          focus?: string[] | null
          id?: string
          locales?: string | null
          name?: string | null
          role?: string
          target_score?: number | null
          test_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          focus?: string[] | null
          id?: string
          locales?: string | null
          name?: string | null
          role?: string
          target_score?: number | null
          test_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      question_drafts: {
        Row: {
          created_at: string | null
          form_data: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          form_data: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          form_data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          audio_url: string | null
          blank_index: number | null
          choices: Json
          correct_choice: string
          created_at: string | null
          created_by: string | null
          difficulty: string
          explain_en: string
          explain_vi: string
          id: string
          image_url: string | null
          part: number
          passage_id: string | null
          prompt_text: string
          status: string
          tags: Json | null
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          blank_index?: number | null
          choices: Json
          correct_choice: string
          created_at?: string | null
          created_by?: string | null
          difficulty: string
          explain_en: string
          explain_vi: string
          id?: string
          image_url?: string | null
          part: number
          passage_id?: string | null
          prompt_text: string
          status?: string
          tags?: Json | null
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          blank_index?: number | null
          choices?: Json
          correct_choice?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string
          explain_en?: string
          explain_vi?: string
          id?: string
          image_url?: string | null
          part?: number
          passage_id?: string | null
          prompt_text?: string
          status?: string
          tags?: Json | null
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "passages"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          due_at: string
          ease_factor: number | null
          id: string
          interval_days: number | null
          item_id: string
          repetitions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          due_at: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          item_id: string
          repetitions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          due_at?: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          item_id?: string
          repetitions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "exam_questions_full"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "questions_with_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_students: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string | null
          student_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          student_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          student_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      exam_questions_full: {
        Row: {
          blank_index: number | null
          choices: Json | null
          correct_choice: string | null
          difficulty: string | null
          exam_question_id: string | null
          exam_set_id: string | null
          explain_en: string | null
          explain_vi: string | null
          order_index: number | null
          part_number: number | null
          passage_audio_url: string | null
          passage_id: string | null
          passage_texts: Json | null
          passage_type: string | null
          prompt_text: string | null
          question_id: string | null
          status: string | null
          tags: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: false
            referencedRelation: "exam_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "passages"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_with_passages: {
        Row: {
          blank_index: number | null
          choices: Json | null
          correct_choice: string | null
          created_at: string | null
          created_by: string | null
          difficulty: string | null
          explain_en: string | null
          explain_vi: string | null
          id: string | null
          part: number | null
          passage_assets: Json | null
          passage_audio_url: string | null
          passage_id: string | null
          passage_texts: Json | null
          passage_type: string | null
          prompt_text: string | null
          status: string | null
          tags: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "passages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_student_to_teacher: {
        Args: { student_email: string; teacher_email?: string }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      drop_table_if_exists: {
        Args: { target_table_name: string }
        Returns: string
      }
      get_all_profiles_with_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          user_id: string
        }[]
      }
      get_exam_result: {
        Args: { session_uuid: string }
        Returns: {
          completed_at: string
          correct_answers: number
          exam_set_name: string
          questions: Json
          score: number
          session_id: string
          time_spent: number
          total_questions: number
        }[]
      }
      get_foreign_keys: {
        Args: { target_table_name: string }
        Returns: {
          column_name: string
          constraint_name: string
          foreign_column_name: string
          foreign_table_name: string
          table_name: string
        }[]
      }
      get_questions_with_passages: {
        Args: { question_ids: string[] }
        Returns: {
          blank_index: number
          choices: Json
          correct_choice: string
          difficulty: string
          explain_en: string
          explain_vi: string
          part: number
          passage_audio_url: string
          passage_id: string
          passage_texts: Json
          passage_type: string
          prompt_text: string
          question_id: string
          status: string
          tags: Json
        }[]
      }
      get_student_exam_stats: {
        Args: { teacher_uuid: string }
        Returns: {
          average_score: number
          best_score: number
          latest_exam_date: string
          student_id: string
          student_name: string
          total_exams: number
        }[]
      }
      get_student_teacher: {
        Args: { student_uuid: string }
        Returns: {
          assigned_at: string
          teacher_email: string
          teacher_id: string
          teacher_name: string
        }[]
      }
      get_teacher_students: {
        Args: { teacher_uuid: string }
        Returns: {
          accuracy_percentage: number
          assigned_at: string
          notes: string
          status: string
          student_email: string
          student_id: string
          student_name: string
          total_attempts: number
        }[]
      }
      get_user_email: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_user_completed_exam: {
        Args: { exam_set_uuid: string; user_uuid: string }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_student: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_teacher: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      reassign_student: {
        Args: { new_teacher_uuid: string; student_uuid: string }
        Returns: boolean
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_exam_statistics: {
        Args: { exam_set_uuid: string }
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role: "user" | "admin" | "student" | "teacher"
      color_source:
        | "99COLORS_NET"
        | "ART_PAINTS_YG07S"
        | "BYRNE"
        | "CRAYOLA"
        | "CMYK_COLOR_MODEL"
        | "COLORCODE_IS"
        | "COLORHEXA"
        | "COLORXS"
        | "CORNELL_UNIVERSITY"
        | "COLUMBIA_UNIVERSITY"
        | "DUKE_UNIVERSITY"
        | "ENCYCOLORPEDIA_COM"
        | "ETON_COLLEGE"
        | "FANTETTI_AND_PETRACCHI"
        | "FINDTHEDATA_COM"
        | "FERRARIO_1919"
        | "FEDERAL_STANDARD_595"
        | "FLAG_OF_INDIA"
        | "FLAG_OF_SOUTH_AFRICA"
        | "GLAZEBROOK_AND_BALDRY"
        | "GOOGLE"
        | "HEXCOLOR_CO"
        | "ISCC_NBS"
        | "KELLY_MOORE"
        | "MATTEL"
        | "MAERZ_AND_PAUL"
        | "MILK_PAINT"
        | "MUNSELL_COLOR_WHEEL"
        | "NATURAL_COLOR_SYSTEM"
        | "PANTONE"
        | "PLOCHERE"
        | "POURPRE_COM"
        | "RAL"
        | "RESENE"
        | "RGB_COLOR_MODEL"
        | "THOM_POOLE"
        | "UNIVERSITY_OF_ALABAMA"
        | "UNIVERSITY_OF_CALIFORNIA_DAVIS"
        | "UNIVERSITY_OF_CAMBRIDGE"
        | "UNIVERSITY_OF_NORTH_CAROLINA"
        | "UNIVERSITY_OF_TEXAS_AT_AUSTIN"
        | "X11_WEB"
        | "XONA_COM"
      difficulty: "easy" | "medium" | "hard"
      drill_type: "vocab" | "grammar" | "listening" | "reading" | "mix"
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
      app_role: ["user", "admin", "student", "teacher"],
      color_source: [
        "99COLORS_NET",
        "ART_PAINTS_YG07S",
        "BYRNE",
        "CRAYOLA",
        "CMYK_COLOR_MODEL",
        "COLORCODE_IS",
        "COLORHEXA",
        "COLORXS",
        "CORNELL_UNIVERSITY",
        "COLUMBIA_UNIVERSITY",
        "DUKE_UNIVERSITY",
        "ENCYCOLORPEDIA_COM",
        "ETON_COLLEGE",
        "FANTETTI_AND_PETRACCHI",
        "FINDTHEDATA_COM",
        "FERRARIO_1919",
        "FEDERAL_STANDARD_595",
        "FLAG_OF_INDIA",
        "FLAG_OF_SOUTH_AFRICA",
        "GLAZEBROOK_AND_BALDRY",
        "GOOGLE",
        "HEXCOLOR_CO",
        "ISCC_NBS",
        "KELLY_MOORE",
        "MATTEL",
        "MAERZ_AND_PAUL",
        "MILK_PAINT",
        "MUNSELL_COLOR_WHEEL",
        "NATURAL_COLOR_SYSTEM",
        "PANTONE",
        "PLOCHERE",
        "POURPRE_COM",
        "RAL",
        "RESENE",
        "RGB_COLOR_MODEL",
        "THOM_POOLE",
        "UNIVERSITY_OF_ALABAMA",
        "UNIVERSITY_OF_CALIFORNIA_DAVIS",
        "UNIVERSITY_OF_CAMBRIDGE",
        "UNIVERSITY_OF_NORTH_CAROLINA",
        "UNIVERSITY_OF_TEXAS_AT_AUSTIN",
        "X11_WEB",
        "XONA_COM",
      ],
      difficulty: ["easy", "medium", "hard"],
      drill_type: ["vocab", "grammar", "listening", "reading", "mix"],
    },
  },
} as const
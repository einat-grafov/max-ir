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
      customer_contacts: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          action_items: string | null
          assigned_sales_rep: string | null
          attachment_name: string | null
          attachment_url: string | null
          company: string | null
          contact_person: string | null
          content: string
          created_at: string
          customer_feedback: string | null
          customer_id: string
          customer_name: string | null
          date_of_interaction: string
          follow_up_details: string | null
          follow_up_required: boolean
          id: string
          interaction_type: string | null
          interaction_type_other: string | null
          next_follow_up_date: string | null
          sales_representative: string | null
          sales_stage: string | null
          sales_stage_other: string | null
          summary: string | null
        }
        Insert: {
          action_items?: string | null
          assigned_sales_rep?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          company?: string | null
          contact_person?: string | null
          content: string
          created_at?: string
          customer_feedback?: string | null
          customer_id: string
          customer_name?: string | null
          date_of_interaction?: string
          follow_up_details?: string | null
          follow_up_required?: boolean
          id?: string
          interaction_type?: string | null
          interaction_type_other?: string | null
          next_follow_up_date?: string | null
          sales_representative?: string | null
          sales_stage?: string | null
          sales_stage_other?: string | null
          summary?: string | null
        }
        Update: {
          action_items?: string | null
          assigned_sales_rep?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          company?: string | null
          contact_person?: string | null
          content?: string
          created_at?: string
          customer_feedback?: string | null
          customer_id?: string
          customer_name?: string | null
          date_of_interaction?: string
          follow_up_details?: string | null
          follow_up_required?: boolean
          id?: string
          interaction_type?: string | null
          interaction_type_other?: string | null
          next_follow_up_date?: string | null
          sales_representative?: string | null
          sales_stage?: string | null
          sales_stage_other?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          accepts_marketing: boolean
          address: string | null
          apartment: string | null
          city: string | null
          company: string | null
          country: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          language: string
          last_name: string | null
          phone: string | null
          postal_code: string | null
          status: string
          tax_exempt: boolean
          updated_at: string
        }
        Insert: {
          accepts_marketing?: boolean
          address?: string | null
          apartment?: string | null
          city?: string | null
          company?: string | null
          country?: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          language?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          status?: string
          tax_exempt?: boolean
          updated_at?: string
        }
        Update: {
          accepts_marketing?: boolean
          address?: string | null
          apartment?: string | null
          city?: string | null
          company?: string | null
          country?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          language?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          status?: string
          tax_exempt?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          company_name: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          message: string
          name: string
          phone: string | null
          product_id: string | null
          product_name: string
          read: boolean
        }
        Insert: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          message: string
          name: string
          phone?: string | null
          product_id?: string | null
          product_name: string
          read?: boolean
        }
        Update: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string
          name?: string
          phone?: string | null
          product_id?: string | null
          product_name?: string
          read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price?: number
          product_id?: string | null
          product_name: string
          quantity?: number
          total?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          discount_amount: number
          fulfillment_status: string
          id: string
          notes: string | null
          order_number: number
          payment_due_later: boolean
          payment_status: string
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          discount_amount?: number
          fulfillment_status?: string
          id?: string
          notes?: string | null
          order_number?: number
          payment_due_later?: boolean
          payment_status?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          discount_amount?: number
          fulfillment_status?: string
          id?: string
          notes?: string | null
          order_number?: number
          payment_due_later?: boolean
          payment_status?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          cta_add_to_cart: boolean
          cta_request_quote: boolean
          description: string | null
          id: string
          image_url: string | null
          images: Json | null
          name: string
          overview: string | null
          price: number
          requires_shipping: boolean
          sku: string | null
          specifications: Json | null
          status: string
          stock: number
          tax_exempt: boolean
          updated_at: string
          variants: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          cta_add_to_cart?: boolean
          cta_request_quote?: boolean
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          name: string
          overview?: string | null
          price?: number
          requires_shipping?: boolean
          sku?: string | null
          specifications?: Json | null
          status?: string
          stock?: number
          tax_exempt?: boolean
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string
          cta_add_to_cart?: boolean
          cta_request_quote?: boolean
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          name?: string
          overview?: string | null
          price?: number
          requires_shipping?: boolean
          sku?: string | null
          specifications?: Json | null
          status?: string
          stock?: number
          tax_exempt?: boolean
          updated_at?: string
          variants?: Json | null
        }
        Relationships: []
      }
      stock_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          product_id: string | null
          variant_name: string
          variant_sku: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          product_id?: string | null
          variant_name: string
          variant_sku?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          product_id?: string | null
          variant_name?: string
          variant_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          page: string
          section_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          page: string
          section_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          page?: string
          section_key?: string
          sort_order?: number
          updated_at?: string
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

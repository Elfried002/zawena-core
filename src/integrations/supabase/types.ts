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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          duration_minutes: number | null
          entity_id: string
          entity_type: string
          id: string
          occurred_at: string
          owner_id: string | null
          subject: string | null
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          entity_id: string
          entity_type: string
          id?: string
          occurred_at?: string
          owner_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          occurred_at?: string
          owner_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_name: string
          id: string
          path: string | null
          props: Json
          referrer: string | null
          session_hash: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_name: string
          id?: string
          path?: string | null
          props?: Json
          referrer?: string | null
          session_hash?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_name?: string
          id?: string
          path?: string | null
          props?: Json
          referrer?: string | null
          session_hash?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          ip_address: unknown
          module: string
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown
          module: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown
          module?: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: Json
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          id: string
          og_image_url: string | null
          published_at: string | null
          reading_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          updated_by: string | null
          view_count: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          view_count?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          industry: string | null
          legal_name: string | null
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          size_range: string | null
          updated_at: string
          updated_by: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          size_range?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          size_range?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          first_name: string
          id: string
          is_primary: boolean
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sequences: {
        Row: {
          current_value: number
          key: string
          prefix: string
          updated_at: string
        }
        Insert: {
          current_value?: number
          key: string
          prefix: string
          updated_at?: string
        }
        Update: {
          current_value?: number
          key?: string
          prefix?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          question: string
          service_id: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          question: string
          service_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          question?: string
          service_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_published_services"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          key: string
          result: Json | null
          scope: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          key: string
          result?: Json | null
          scope: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          key?: string
          result?: Json | null
          scope?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number | null
          quantity: number
          sort_order: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total?: number | null
          quantity?: number
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number | null
          quantity?: number
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_outstanding_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          due_date: string | null
          id: string
          issue_date: string
          lock_version: number
          notes: string | null
          number: string
          owner_id: string | null
          pdf_media_id: string | null
          quote_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount_paid?: number
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          issue_date?: string
          lock_version?: number
          notes?: string | null
          number?: string
          owner_id?: string | null
          pdf_media_id?: string | null
          quote_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount_paid?: number
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          issue_date?: string
          lock_version?: number
          notes?: string | null
          number?: string
          owner_id?: string | null
          pdf_media_id?: string | null
          quote_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_pdf_media_id_fkey"
            columns: ["pdf_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company_name: string | null
          converted_company_id: string | null
          converted_contact_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          owner_id: string | null
          phone: string | null
          score: number
          service_id: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          updated_by: string | null
          utm: Json
        }
        Insert: {
          company_name?: string | null
          converted_company_id?: string | null
          converted_contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number
          service_id?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          updated_by?: string | null
          utm?: Json
        }
        Update: {
          company_name?: string | null
          converted_company_id?: string | null
          converted_contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number
          service_id?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          updated_by?: string | null
          utm?: Json
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_company_id_fkey"
            columns: ["converted_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_contact_id_fkey"
            columns: ["converted_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_published_services"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          alt_text: string | null
          bucket_id: string
          caption: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          file_name: string
          folder: string
          height: number | null
          id: string
          is_public: boolean
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          updated_at: string
          updated_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket_id: string
          caption?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_name: string
          folder?: string
          height?: number | null
          id?: string
          is_public?: boolean
          media_type?: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket_id?: string
          caption?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_name?: string
          folder?: string
          height?: number | null
          id?: string
          is_public?: boolean
          media_type?: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          created_by: string | null
          icon: string | null
          id: string
          is_visible: boolean
          label: string
          menu_id: string
          open_in_new_tab: boolean
          page_id: string | null
          parent_id: string | null
          sort_order: number
          updated_at: string
          updated_by: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          label: string
          menu_id: string
          open_in_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          label?: string
          menu_id?: string
          open_in_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "v_published_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key: string
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key: string
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key?: string
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_pinned: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_pinned?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_pinned?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event: Database["public"]["Enums"]["notification_event"]
          id: string
          link: string | null
          payload: Json
          read_at: string | null
          sent_at: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event: Database["public"]["Enums"]["notification_event"]
          id?: string
          link?: string | null
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event?: Database["public"]["Enums"]["notification_event"]
          id?: string
          link?: string | null
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          amount: number
          closed_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          loss_reason: string | null
          owner_id: string | null
          stage_id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount?: number
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          loss_reason?: string | null
          owner_id?: string | null
          stage_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          loss_reason?: string | null
          owner_id?: string | null
          stage_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "v_pipeline_overview"
            referencedColumns: ["stage_id"]
          },
        ]
      }
      opportunity_stage_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_stage_id: string | null
          id: string
          note: string | null
          opportunity_id: string
          to_stage_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_stage_id?: string | null
          id?: string
          note?: string | null
          opportunity_id: string
          to_stage_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_stage_id?: string | null
          id?: string
          note?: string | null
          opportunity_id?: string
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "v_pipeline_overview"
            referencedColumns: ["stage_id"]
          },
          {
            foreignKeyName: "opportunity_stage_history_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "v_pipeline_overview"
            referencedColumns: ["stage_id"]
          },
        ]
      }
      pages: {
        Row: {
          content: Json
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          id: string
          noindex: boolean
          og_image_url: string | null
          published_at: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string
          reference: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          reference?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          reference?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_outstanding_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          created_at: string
          id: string
          is_lost: boolean
          is_won: boolean
          key: string
          name: string
          probability: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          key: string
          name: string
          probability?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          key?: string
          name?: string
          probability?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          locale: string
          phone: string | null
          status: Database["public"]["Enums"]["user_account_status"]
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          job_title?: string | null
          locale?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_account_status"]
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          locale?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_account_status"]
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_technologies: {
        Row: {
          created_at: string
          project_id: string
          technology_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          technology_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_technologies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_published_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          content: Json
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          delivered_at: string | null
          external_url: string | null
          id: string
          industry: string | null
          is_featured: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_name?: string | null
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          external_url?: string | null
          id?: string
          industry?: string | null
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_name?: string | null
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          external_url?: string | null
          id?: string
          industry?: string | null
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          id: string
          line_total: number | null
          quantity: number
          quote_id: string
          service_id: string | null
          sort_order: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_percent?: number
          id?: string
          line_total?: number | null
          quantity?: number
          quote_id: string
          service_id?: string | null
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number
          id?: string
          line_total?: number | null
          quantity?: number
          quote_id?: string
          service_id?: string | null
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_published_services"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget_range: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          email: string
          full_name: string
          id: string
          lead_id: string | null
          owner_id: string | null
          phone: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["quote_request_status"]
          timeline: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          budget_range?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          email: string
          full_name: string
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          phone?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["quote_request_status"]
          timeline?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          budget_range?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          email?: string
          full_name?: string
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          phone?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["quote_request_status"]
          timeline?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_published_services"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          decision_reason: string | null
          deleted_at: string | null
          discount_amount: number
          expired_at: string | null
          id: string
          lock_version: number
          notes: string | null
          number: string
          opportunity_id: string | null
          owner_id: string | null
          quote_request_id: string | null
          rejected_at: string | null
          revision_of: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          terms: string | null
          title: string
          total: number
          updated_at: string
          updated_by: string | null
          valid_until: string | null
          version: number
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          decision_reason?: string | null
          deleted_at?: string | null
          discount_amount?: number
          expired_at?: string | null
          id?: string
          lock_version?: number
          notes?: string | null
          number?: string
          opportunity_id?: string | null
          owner_id?: string | null
          quote_request_id?: string | null
          rejected_at?: string | null
          revision_of?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          title: string
          total?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          version?: number
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          decision_reason?: string | null
          deleted_at?: string | null
          discount_amount?: number
          expired_at?: string | null
          id?: string
          lock_version?: number
          notes?: string | null
          number?: string
          opportunity_id?: string | null
          owner_id?: string | null
          quote_request_id?: string | null
          rejected_at?: string | null
          revision_of?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          title?: string
          total?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          version?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_revision_of_fkey"
            columns: ["revision_of"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_hits: {
        Row: {
          created_at: string
          id: string
          identifier: string
          scope: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          scope: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          scope?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      service_technologies: {
        Row: {
          created_at: string
          service_id: string
          technology_id: string
        }
        Insert: {
          created_at?: string
          service_id: string
          technology_id: string
        }
        Update: {
          created_at?: string
          service_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_technologies_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_technologies_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_published_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          content: Json
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          icon: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          group_key: string
          id: string
          is_public: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_key: string
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_key?: string
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      technologies: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          logo_media_id: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_media_id?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_media_id?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technologies_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          is_internal: boolean
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_open_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assignee_id: string | null
          category_id: string | null
          closed_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          first_response_at: string | null
          id: string
          number: string
          priority: Database["public"]["Enums"]["priority_level"]
          requester_email: string | null
          requester_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignee_id?: string | null
          category_id?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          number?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          requester_email?: string | null
          requester_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignee_id?: string | null
          category_id?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          number?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          requester_email?: string | null
          requester_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
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
      v_open_tickets: {
        Row: {
          assignee_id: string | null
          category_name: string | null
          company_name: string | null
          created_at: string | null
          first_response_at: string | null
          id: string | null
          number: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          reply_count: number | null
          requester_email: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string | null
        }
        Relationships: []
      }
      v_outstanding_invoices: {
        Row: {
          amount_paid: number | null
          balance_due: number | null
          company_name: string | null
          currency: string | null
          due_date: string | null
          id: string | null
          is_overdue: boolean | null
          issue_date: string | null
          number: string | null
          owner_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          total: number | null
        }
        Relationships: []
      }
      v_pipeline_overview: {
        Row: {
          is_lost: boolean | null
          is_won: boolean | null
          opportunity_count: number | null
          probability: number | null
          sort_order: number | null
          stage_id: string | null
          stage_key: string | null
          stage_name: string | null
          total_amount: number | null
          weighted_amount: number | null
        }
        Relationships: []
      }
      v_published_faqs: {
        Row: {
          answer: string | null
          category: string | null
          id: string | null
          question: string | null
          service_id: string | null
          sort_order: number | null
        }
        Insert: {
          answer?: string | null
          category?: string | null
          id?: string | null
          question?: string | null
          service_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answer?: string | null
          category?: string | null
          id?: string | null
          question?: string | null
          service_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_published_services"
            referencedColumns: ["id"]
          },
        ]
      }
      v_published_pages: {
        Row: {
          content: Json | null
          cover_media_id: string | null
          excerpt: string | null
          id: string | null
          noindex: boolean | null
          og_image_url: string | null
          published_at: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          content?: Json | null
          cover_media_id?: string | null
          excerpt?: string | null
          id?: string | null
          noindex?: boolean | null
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          content?: Json | null
          cover_media_id?: string | null
          excerpt?: string | null
          id?: string | null
          noindex?: boolean | null
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      v_published_posts: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          category_name: string | null
          category_slug: string | null
          content: Json | null
          cover_media_id: string | null
          excerpt: string | null
          id: string | null
          og_image_url: string | null
          published_at: string | null
          reading_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          tags: Json | null
          title: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      v_published_projects: {
        Row: {
          client_name: string | null
          content: Json | null
          cover_media_id: string | null
          delivered_at: string | null
          external_url: string | null
          id: string | null
          industry: string | null
          is_featured: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          sort_order: number | null
          summary: string | null
          technologies: Json | null
          title: string | null
        }
        Insert: {
          client_name?: string | null
          content?: Json | null
          cover_media_id?: string | null
          delivered_at?: string | null
          external_url?: string | null
          id?: string | null
          industry?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number | null
          summary?: string | null
          technologies?: never
          title?: string | null
        }
        Update: {
          client_name?: string | null
          content?: Json | null
          cover_media_id?: string | null
          delivered_at?: string | null
          external_url?: string | null
          id?: string | null
          industry?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number | null
          summary?: string | null
          technologies?: never
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      v_published_services: {
        Row: {
          content: Json | null
          cover_media_id: string | null
          icon: string | null
          id: string | null
          is_featured: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          sort_order: number | null
          summary: string | null
          title: string | null
        }
        Insert: {
          content?: Json | null
          cover_media_id?: string | null
          icon?: string | null
          id?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number | null
          summary?: string | null
          title?: string | null
        }
        Update: {
          content?: Json | null
          cover_media_id?: string | null
          icon?: string | null
          id?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number | null
          summary?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_edit_content: { Args: never; Returns: boolean }
      check_rate_limit: {
        Args: {
          _identifier: string
          _max_hits: number
          _scope: string
          _window_seconds: number
        }
        Returns: boolean
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invoice_balance_due: { Args: { _invoice_id: string }; Returns: number }
      is_account_active: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      my_permissions: {
        Args: never
        Returns: {
          permission: string
        }[]
      }
      next_document_number: { Args: { _key: string }; Returns: string }
    }
    Enums: {
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "demo"
        | "note"
        | "other"
        | "task"
        | "follow_up"
      app_role:
        | "admin"
        | "editor"
        | "sales"
        | "support"
        | "client"
        | "super_admin"
        | "finance"
        | "viewer"
      audit_action:
        | "insert"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "sensitive_change"
      content_status:
        | "draft"
        | "scheduled"
        | "published"
        | "archived"
        | "review"
      invoice_status:
        | "draft"
        | "sent"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "void"
        | "issued"
        | "cancelled"
      lead_source:
        | "website"
        | "referral"
        | "linkedin"
        | "email"
        | "event"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "unqualified"
        | "converted"
      media_type: "image" | "document" | "video" | "audio" | "other"
      notification_channel:
        | "dashboard"
        | "email"
        | "sms"
        | "whatsapp"
        | "webhook"
      notification_event:
        | "lead_created"
        | "quote_request_created"
        | "ticket_created"
        | "ticket_replied"
        | "ticket_assigned"
        | "quote_sent"
        | "quote_accepted"
        | "invoice_sent"
        | "payment_recorded"
        | "task_assigned"
      payment_method:
        | "bank_transfer"
        | "card"
        | "cash"
        | "paypal"
        | "stripe"
        | "other"
      priority_level: "low" | "medium" | "high" | "urgent"
      quote_request_status:
        | "new"
        | "reviewing"
        | "quoted"
        | "declined"
        | "archived"
        | "qualified"
        | "quote_created"
      quote_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "viewed"
        | "cancelled"
      task_status: "todo" | "in_progress" | "done" | "cancelled"
      ticket_status:
        | "open"
        | "pending"
        | "in_progress"
        | "resolved"
        | "closed"
        | "assigned"
        | "waiting_customer"
      user_account_status: "invited" | "active" | "suspended" | "deactivated"
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
      activity_type: [
        "call",
        "email",
        "meeting",
        "demo",
        "note",
        "other",
        "task",
        "follow_up",
      ],
      app_role: [
        "admin",
        "editor",
        "sales",
        "support",
        "client",
        "super_admin",
        "finance",
        "viewer",
      ],
      audit_action: [
        "insert",
        "update",
        "delete",
        "login",
        "logout",
        "sensitive_change",
      ],
      content_status: ["draft", "scheduled", "published", "archived", "review"],
      invoice_status: [
        "draft",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "void",
        "issued",
        "cancelled",
      ],
      lead_source: [
        "website",
        "referral",
        "linkedin",
        "email",
        "event",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "unqualified",
        "converted",
      ],
      media_type: ["image", "document", "video", "audio", "other"],
      notification_channel: [
        "dashboard",
        "email",
        "sms",
        "whatsapp",
        "webhook",
      ],
      notification_event: [
        "lead_created",
        "quote_request_created",
        "ticket_created",
        "ticket_replied",
        "ticket_assigned",
        "quote_sent",
        "quote_accepted",
        "invoice_sent",
        "payment_recorded",
        "task_assigned",
      ],
      payment_method: [
        "bank_transfer",
        "card",
        "cash",
        "paypal",
        "stripe",
        "other",
      ],
      priority_level: ["low", "medium", "high", "urgent"],
      quote_request_status: [
        "new",
        "reviewing",
        "quoted",
        "declined",
        "archived",
        "qualified",
        "quote_created",
      ],
      quote_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "viewed",
        "cancelled",
      ],
      task_status: ["todo", "in_progress", "done", "cancelled"],
      ticket_status: [
        "open",
        "pending",
        "in_progress",
        "resolved",
        "closed",
        "assigned",
        "waiting_customer",
      ],
      user_account_status: ["invited", "active", "suspended", "deactivated"],
    },
  },
} as const

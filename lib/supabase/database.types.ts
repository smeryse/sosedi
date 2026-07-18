// This file is generated from the database schema
// Run: npx supabase gen types typescript --project-id <your-project-ref> > lib/supabase/database.types.ts
// For now, using manual types based on migration 202607180001_initial_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          age: number | null;
          job_title: string | null;
          bio: string | null;
          city: string;
          avatar_path: string | null;
          budget_min: number | null;
          budget_max: number | null;
          move_in_date: string | null;
          lease_months: number | null;
          is_public: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          age?: number | null;
          job_title?: string | null;
          bio?: string | null;
          city?: string;
          avatar_path?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          move_in_date?: string | null;
          lease_months?: number | null;
          is_public?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
          notification_settings?: {
            email_notifications: boolean;
            push_notifications: boolean;
            new_messages: boolean;
            new_applications: boolean;
            application_updates: boolean;
            group_invites: boolean;
            marketing_emails: boolean;
          } | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          age?: number | null;
          job_title?: string | null;
          bio?: string | null;
          city?: string;
          avatar_path?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          move_in_date?: string | null;
          lease_months?: number | null;
          is_public?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
          notification_settings?: {
            email_notifications: boolean;
            push_notifications: boolean;
            new_messages: boolean;
            new_applications: boolean;
            application_updates: boolean;
            group_invites: boolean;
            marketing_emails: boolean;
          } | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: "tenant" | "owner" | "admin";
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: "tenant" | "owner" | "admin";
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: "tenant" | "owner" | "admin";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_preferences: {
        Row: {
          profile_id: string;
          districts: string[];
          smoking: "no" | "sometimes" | "yes" | "indifferent";
          pets: "no" | "cat" | "dog" | "other" | "indifferent";
          sleep_schedule: "early" | "late" | "flexible";
          noise_tolerance: number | null;
          guests_frequency: "never" | "rarely" | "sometimes" | "often";
          remote_work: "never" | "sometimes" | "often";
          cleanliness: number | null;
          sociability: number | null;
          private_space: number | null;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          districts?: string[];
          smoking?: "no" | "sometimes" | "yes" | "indifferent";
          pets?: "no" | "cat" | "dog" | "other" | "indifferent";
          sleep_schedule?: "early" | "late" | "flexible";
          noise_tolerance?: number | null;
          guests_frequency?: "never" | "rarely" | "sometimes" | "often";
          remote_work?: "never" | "sometimes" | "often";
          cleanliness?: number | null;
          sociability?: number | null;
          private_space?: number | null;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          districts?: string[];
          smoking?: "no" | "sometimes" | "yes" | "indifferent";
          pets?: "no" | "cat" | "dog" | "other" | "indifferent";
          sleep_schedule?: "early" | "late" | "flexible";
          noise_tolerance?: number | null;
          guests_frequency?: "never" | "rarely" | "sometimes" | "often";
          remote_work?: "never" | "sometimes" | "often";
          cleanliness?: number | null;
          sociability?: number | null;
          private_space?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_preferences_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lifestyle_answers: {
        Row: {
          id: string;
          profile_id: string;
          question_key: string;
          answer: Json;
          importance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          question_key: string;
          answer: Json;
          importance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          question_key?: string;
          answer?: Json;
          importance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lifestyle_answers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      compatibility_weights: {
        Row: {
          profile_id: string;
          criterion: string;
          weight: number;
        };
        Insert: {
          profile_id: string;
          criterion: string;
          weight: number;
        };
        Update: {
          profile_id?: string;
          criterion?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "compatibility_weights_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          city: string;
          district: string;
          address: string | null;
          monthly_rent: number;
          deposit: number;
          rooms: number;
          area: number;
          floor: number | null;
          total_floors: number | null;
          available_from: string | null;
          lease_months_min: number;
          pets_allowed: boolean;
          smoking_allowed: boolean;
          status: "draft" | "published" | "paused" | "archived";
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          city?: string;
          district: string;
          address?: string | null;
          monthly_rent: number;
          deposit?: number;
          rooms: number;
          area: number;
          floor?: number | null;
          total_floors?: number | null;
          available_from?: string | null;
          lease_months_min?: number;
          pets_allowed?: boolean;
          smoking_allowed?: boolean;
          status?: "draft" | "published" | "paused" | "archived";
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          city?: string;
          district?: string;
          address?: string | null;
          monthly_rent?: number;
          deposit?: number;
          rooms?: number;
          area?: number;
          floor?: number | null;
          total_floors?: number | null;
          available_from?: string | null;
          lease_months_min?: number;
          pets_allowed?: boolean;
          smoking_allowed?: boolean;
          status?: "draft" | "published" | "paused" | "archived";
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          storage_path?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"],
          },
        ];
      };
      property_amenities: {
        Row: {
          property_id: string;
          amenity: string;
        };
        Insert: {
          property_id: string;
          amenity: string;
        };
        Update: {
          property_id?: string;
          amenity?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_amenities_property_id_fkey";
            columns: ["property_id"],
            isOneToOne: false,
            referencedRelation: "properties",
            referencedColumns: ["id"],
          },
        ];
      };
      property_rules: {
        Row: {
          property_id: string;
          rule_key: string;
          rule_value: string;
        };
        Insert: {
          property_id: string;
          rule_key: string;
          rule_value: string;
        };
        Update: {
          property_id?: string;
          rule_key?: string;
          rule_value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_rules_property_id_fkey";
            columns: ["property_id"],
            isOneToOne: false,
            referencedRelation: "properties",
            referencedColumns: ["id"],
          },
        ];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          target_type: "profile" | "property" | "group";
          target_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "profile" | "property" | "group";
          target_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_type?: "profile" | "property" | "group";
          target_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      groups: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          status: "forming" | "ready" | "application_sent" | "under_review" | "needs_response" | "approved" | "rejected" | "settled";
          target_budget: number | null;
          move_in_date: string | null;
          lease_months: number | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          name: string;
          status?: "forming" | "ready" | "application_sent" | "under_review" | "needs_response" | "approved" | "rejected" | "settled";
          target_budget?: number | null;
          move_in_date?: string | null;
          lease_months?: number | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          name?: string;
          status?: "forming" | "ready" | "application_sent" | "under_review" | "needs_response" | "approved" | "rejected" | "settled";
          target_budget?: number | null;
          move_in_date?: string | null;
          lease_months?: number | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          profile_id: string;
          role: "admin" | "member";
          status: "invited" | "active" | "declined" | "left" | "removed";
          joined_at: string | null;
          created_at: string;
        };
        Insert: {
          group_id: string;
          profile_id: string;
          role?: "admin" | "member";
          status?: "invited" | "active" | "declined" | "left" | "removed";
          joined_at?: string | null;
          created_at?: string;
        };
        Update: {
          group_id?: string;
          profile_id?: string;
          role?: "admin" | "member";
          status?: "invited" | "active" | "declined" | "left" | "removed";
          joined_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"],
            isOneToOne: false,
            referencedRelation: "groups";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "group_members_profile_id_fkey";
            columns: ["profile_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      group_invites: {
        Row: {
          id: string;
          group_id: string;
          inviter_id: string;
          invitee_id: string;
          status: "pending" | "accepted" | "declined" | "expired";
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          inviter_id: string;
          invitee_id: string;
          status?: "pending" | "accepted" | "declined" | "expired";
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          inviter_id?: string;
          invitee_id?: string;
          status?: "pending" | "accepted" | "declined" | "expired";
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_invites_group_id_fkey";
            columns: ["group_id"],
            isOneToOne: false,
            referencedRelation: "groups";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "group_invites_inviter_id_fkey";
            columns: ["inviter_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "group_invites_invitee_id_fkey";
            columns: ["invitee_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      applications: {
        Row: {
          id: string;
          group_id: string;
          property_id: string;
          created_by: string;
          status: "draft" | "submitted" | "reviewing" | "needs_response" | "approved" | "rejected" | "contract_agreed" | "settled";
          total_budget: number;
          move_in_date: string | null;
          lease_months: number | null;
          owner_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          property_id: string;
          created_by: string;
          status?: "draft" | "submitted" | "reviewing" | "needs_response" | "approved" | "rejected" | "contract_agreed" | "settled";
          total_budget: number;
          move_in_date?: string | null;
          lease_months?: number | null;
          owner_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          property_id?: string;
          created_by?: string;
          status?: "draft" | "submitted" | "reviewing" | "needs_response" | "approved" | "rejected" | "contract_agreed" | "settled";
          total_budget?: number;
          move_in_date?: string | null;
          lease_months?: number | null;
          owner_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_group_id_fkey";
            columns: ["group_id"],
            isOneToOne: false,
            referencedRelation: "groups";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "applications_property_id_fkey";
            columns: ["property_id"],
            isOneToOne: false,
            referencedRelation: "properties";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "applications_created_by_fkey";
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      application_members: {
        Row: {
          application_id: string;
          profile_id: string;
          rent_share: number;
          confirmed_at: string | null;
        };
        Insert: {
          application_id: string;
          profile_id: string;
          rent_share: number;
          confirmed_at?: string | null;
        };
        Update: {
          application_id?: string;
          profile_id?: string;
          rent_share?: number;
          confirmed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_members_application_id_fkey";
            columns: ["application_id"],
            isOneToOne: false,
            referencedRelation: "applications";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "application_members_profile_id_fkey";
            columns: ["profile_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      application_events: {
        Row: {
          id: string;
          application_id: string;
          actor_id: string | null;
          from_status: string | null;
          to_status: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          actor_id?: string | null;
          from_status?: string | null;
          to_status: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          actor_id?: string | null;
          from_status?: string | null;
          to_status?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey";
            columns: ["application_id"],
            isOneToOne: false,
            referencedRelation: "applications";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "application_events_actor_id_fkey";
            columns: ["actor_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          type: "direct" | "group" | "owner_group" | "system";
          property_id: string | null;
          application_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: "direct" | "group" | "owner_group" | "system";
          property_id?: string | null;
          application_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: "direct" | "group" | "owner_group" | "system";
          property_id?: string | null;
          application_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey";
            columns: ["property_id"],
            isOneToOne: false,
            referencedRelation: "properties";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "conversations_application_id_fkey";
            columns: ["application_id"],
            isOneToOne: false,
            referencedRelation: "applications";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "conversations_created_by_fkey";
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          profile_id: string;
          last_read_at: string | null;
          joined_at: string;
        };
        Insert: {
          conversation_id: string;
          profile_id: string;
          last_read_at?: string | null;
          joined_at?: string;
        };
        Update: {
          conversation_id?: string;
          profile_id?: string;
          last_read_at?: string | null;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey";
            columns: ["conversation_id"],
            isOneToOne: false,
            referencedRelation: "conversations";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "conversation_members_profile_id_fkey";
            columns: ["profile_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          system_type: string | null;
          sent_at: string;
          edited_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          system_type?: string | null;
          sent_at?: string;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          system_type?: string | null;
          sent_at?: string;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"],
            isOneToOne: false,
            referencedRelation: "conversations",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      message_attachments: {
        Row: {
          id: string;
          message_id: string;
          storage_path: string;
          mime_type: string;
          byte_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          storage_path: string;
          mime_type: string;
          byte_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          storage_path?: string;
          mime_type?: string;
          byte_size?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey";
            columns: ["message_id"],
            isOneToOne: false,
            referencedRelation: "messages",
            referencedColumns: ["id"],
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          title: string;
          body: string;
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          title: string;
          body: string;
          href?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: string;
          title?: string;
          body?: string;
          href?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles";
            referencedColumns: ["id"],
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          category: "rent" | "utilities" | "deposit" | "household" | "other";
          description: string;
          amount: number;
          occurred_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          category: "rent" | "utilities" | "deposit" | "household" | "other";
          description: string;
          amount: number;
          occurred_on?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          category?: "rent" | "utilities" | "deposit" | "household" | "other";
          description?: string;
          amount?: number;
          occurred_on?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey";
            columns: ["group_id"],
            isOneToOne: false,
            referencedRelation: "groups",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "expenses_created_by_fkey";
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
        ];
      };
      expense_members: {
        Row: {
          expense_id: string;
          profile_id: string;
          share: number;
          paid_at: string | null;
        };
        Insert: {
          expense_id: string;
          profile_id: string;
          share: number;
          paid_at?: string | null;
        };
        Update: {
          expense_id?: string;
          profile_id?: string;
          share?: number;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expense_members_expense_id_fkey";
            columns: ["expense_id"],
            isOneToOne: false,
            referencedRelation: "expenses",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "expense_members_profile_id_fkey";
            columns: ["profile_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
        ];
      };
      chores: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          assignee_id: string | null;
          title: string;
          zone: string | null;
          due_at: string | null;
          recurrence: string | null;
          status: "open" | "done" | "skipped";
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          assignee_id?: string | null;
          title: string;
          zone?: string | null;
          due_at?: string | null;
          recurrence?: string | null;
          status?: "open" | "done" | "skipped";
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          assignee_id?: string | null;
          title?: string;
          zone?: string | null;
          due_at?: string | null;
          recurrence?: string | null;
          status?: "open" | "done" | "skipped";
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chores_group_id_fkey";
            columns: ["group_id"],
            isOneToOne: false,
            referencedRelation: "groups",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "chores_created_by_fkey";
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "chores_assignee_id_fkey";
            columns: ["assignee_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
        ];
      };
      verification_statuses: {
        Row: {
          id: string;
          subject_type: "profile" | "property";
          subject_id: string;
          status: "unverified" | "pending" | "verified" | "rejected";
          provider: string | null;
          note: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_type: "profile" | "property";
          subject_id: string;
          status: "unverified" | "pending" | "verified" | "rejected";
          provider?: string | null;
          note?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_type?: "profile" | "property";
          subject_id?: string;
          status?: "unverified" | "pending" | "verified" | "rejected";
          provider?: string | null;
          note?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          provider: "mock" | "groq" | "openrouter";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider?: "mock" | "groq" | "openrouter";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: "mock" | "groq" | "openrouter";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey";
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
        ];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: "user" | "assistant" | "system";
          body: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey";
            columns: ["conversation_id"],
            isOneToOne: false,
            referencedRelation: "ai_conversations",
            referencedColumns: ["id"],
          },
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          properties: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_name: string;
          properties?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_name?: string;
          properties?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"],
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_group_member: {
        Args: { target_group: string };
        Returns: boolean;
      };
      is_group_admin: {
        Args: { target_group: string };
        Returns: boolean;
      };
      is_conversation_member: {
        Args: { target_conversation: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      user_role: "tenant" | "owner" | "admin";
      profile_preference_smoking: "no" | "sometimes" | "yes" | "indifferent";
      profile_preference_pets: "no" | "cat" | "dog" | "other" | "indifferent";
      profile_preference_sleep_schedule: "early" | "late" | "flexible";
      profile_preference_guests_frequency: "never" | "rarely" | "sometimes" | "often";
      profile_preference_remote_work: "never" | "sometimes" | "often";
      property_status: "draft" | "published" | "paused" | "archived";
      group_status: "forming" | "ready" | "application_sent" | "under_review" | "needs_response" | "approved" | "rejected" | "settled";
      group_member_status: "invited" | "active" | "declined" | "left" | "removed";
      group_invite_status: "pending" | "accepted" | "declined" | "expired";
      application_status: "draft" | "submitted" | "reviewing" | "needs_response" | "approved" | "rejected" | "contract_agreed" | "settled";
      conversation_type: "direct" | "group" | "owner_group" | "system";
      message_system_type: "property_card" | "viewing_request" | "poll" | "expense_split" | "ai_bot" | "system_notice";
      expense_category: "rent" | "utilities" | "deposit" | "household" | "other";
      chore_status: "open" | "done" | "skipped";
      verification_status: "unverified" | "pending" | "verified" | "rejected";
      ai_provider: "mock" | "groq" | "openrouter";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions]
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof (Database["public"]["CompositeTypes"])
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
  ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
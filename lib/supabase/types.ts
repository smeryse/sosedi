export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_path: string | null
          phone: string | null
          is_public: boolean
          age: number | null
          job_title: string | null
          budget_min: number | null
          budget_max: number | null
          city: string | null
          move_in_date: string | null
          lease_months: number | null
          created_at: string
          updated_at: string
        }
      }
      profile_preferences: {
        Row: {
          profile_id: string
          districts: string[] | null
          smoking: string | null
          pets: string | null
          sleep_schedule: string | null
          noise_tolerance: number | null
          guests_frequency: string | null
          remote_work: string | null
          cleanliness: number | null
          private_space: number | null
          sociability: number | null
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string | null
          title: string
          description: string | null
          address: string
          city: string | null
          district: string
          monthly_rent: number
          deposit_amount: number | null
          rooms: number | null
          area: number | null
          floor: string | null
          total_floors: string | null
          status: string
          archived_at: string | null
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          target_budget: number | null
          status: string | null
          created_by: string | null
          move_in_date: string | null
        }
      }
      applications: {
        Row: {
          id: string
          property_id: string | null
          group_id: string | null
          status: string | null
          tenant_message: string | null
          created_at: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          sender_id: string | null
          body: string
          system_type: string | null
          sent_at: string
          deleted_at: string | null
        }
      }
      chores: {
        Row: {
          id: string
          title: string
          assignee_id: string | null
          status: string | null
          due_at: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          description: string | null
          amount: number
          created_at: string
        }
      }
      expense_members: {
        Row: {
          expense_id: string
          profile_id: string
          share: number
          paid_at: string | null
        }
      }
    }
  }
}

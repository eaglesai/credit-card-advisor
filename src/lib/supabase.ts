import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface CreditCard {
  id: string
  card_name: string
  issuer: string
  annual_fee: string
  rewards_rate: string
  bonus_categories: string
  minimum_income: string
  pdf_source: string
  last_updated: string
}

export interface UserConversation {
  id?: string
  user_name: string
  user_email: string
  user_ip: string
  consent_given: boolean
  conversation_data: Record<string, string>
  recommended_card_name?: string
  recommendation_reason?: string
  created_at?: string
}
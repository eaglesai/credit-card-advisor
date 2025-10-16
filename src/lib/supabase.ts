import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

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
```

---

## **4. Verify Vercel Environment Variables**

**CRITICAL - Check these are set in Vercel:**

1. Go to: https://vercel.com/dashboard
2. Click your project → Settings → Environment Variables
3. **Verify BOTH exist:**
```
   NEXT_PUBLIC_SUPABASE_URL = https://cdnrzmgmtutudaiiqyeb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnJ6bWdtdHV0dWRhaWlxeWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDc5OTYsImV4cCI6MjA3NjEyMzk5Nn0.JEOpags0zt7nlT7sKNuLnwzRyOLj9_lSI1X7Q1S1IX8
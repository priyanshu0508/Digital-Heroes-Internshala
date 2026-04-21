export type SubStatus = 'active' | 'cancelled' | 'lapsed' | 'trialing' | 'past_due'
export type PaymentStatus = 'pending' | 'paid' | 'rejected'
export type DrawStatus = 'simulation' | 'published'
export type LogicType = 'random' | 'algorithmic'
export type MatchTier = 3 | 4 | 5

export interface Profile {
  id: string
  email: string
  full_name: string | null
  sub_status: SubStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  charity_id: string | null
  charity_pct: number
  is_admin: boolean
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string | null
  website_url: string | null
  events: string | null
  contribution_total: number
  created_at: string
}

export interface Draw {
  id: string
  month_year: string
  winning_numbers: number[]
  logic_type: LogicType
  status: DrawStatus
  prize_pool: number
  created_at: string
}

export interface Winner {
  id: string
  user_id: string
  draw_id: string
  match_tier: MatchTier
  prize_amount: number
  proof_url: string | null
  payment_status: PaymentStatus
  created_at: string
  profiles?: Profile
  draws?: Draw
}

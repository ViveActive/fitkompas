export type Role = 'admin' | 'coach' | 'respondent'

export type Profile = {
  id: string
  email: string
  role: Role
  full_name: string | null
  coach_id: string | null
  coach_code: string | null
  created_at: string
}

export type Plan = 'bundle_10' | 'bundle_30' | 'subscription_monthly' | 'subscription_yearly'

export type CoachSubscription = {
  id: string
  coach_id: string
  plan: Plan
  credits: number | null
  credits_expire_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  active: boolean
  created_at: string
}

export type SurveySession = {
  id: string
  coachee_id: string
  coach_id: string
  language: 'nl' | 'en'
  completed_at: string | null
  x_score: number | null
  y_score: number | null
  quadrant: 'active_motivated' | 'active_unmotivated' | 'inactive_motivated' | 'inactive_unmotivated' | null
  created_at: string
}

export type Answer = {
  id: string
  session_id: string
  question_id: number
  value: number
}

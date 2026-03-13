export interface Battle {
  id: string;
  title: string;
  option_a: string;
  option_b: string;
  image_a: string | null;
  image_b: string | null;
  description: string | null;
  location: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'ended' | 'scheduled';
  votes_a: number;
  votes_b: number;
  created_at: string;
}

export interface Vote {
  id: string;
  battle_id: string;
  selected: 'a' | 'b';
  session_id: string;
  city: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  restaurant_name: string;
  title: string;
  description: string | null;
  area: string | null;
  expiration: string | null;
  phone: string | null;
  address: string | null;
  link: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface AnalyticsEvent {
  event_name: string;
  session_id?: string;
  battle_id?: string;
  deal_id?: string;
  metadata?: Record<string, unknown>;
}

export type VoteSelection = 'a' | 'b' | null;

export interface StreakData {
  current: number;
  longest: number;
  lastVoteDate: string | null; // YYYY-MM-DD
  lifetimeVotes: number;
  milestonesReached: number[]; // e.g. [3, 7]
}

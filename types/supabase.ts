// types/supabase.ts
export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;             // auth.uid()
          email: string | null;
          stripe_customer_id: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          stripe_customer_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          price_id: string | null;
          plan: "month" | "year" | null;
          status: string | null; // Stripe status
          current_period_end: string | null; // ISO string
          cancel_at_period_end: boolean | null;
          is_pro: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          price_id?: string | null;
          plan?: "month" | "year" | null;
          status?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          is_pro?: boolean | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

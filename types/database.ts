// types/database.ts
export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;                 // auth.users.id (uuid)
          email: string | null;
          stripe_customer_id: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          stripe_customer_id?: string | null;
        };
        Update: Partial<profiles["Row"]>;
      };
      subscriptions: {
        Row: {
          user_id: string;                      // primary key (auth.users.id)
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          price_id: string | null;
          plan: "month" | "year" | null;
          status: string | null;                // "active" | "trialing" | ...
          current_period_end: string | null;    // ISO string
          cancel_at_period_end: boolean | null;
          is_pro: boolean | null;
          updated_at: string | null;
        };
        Insert: { user_id: string } & Partial<subscriptions["Row"]>;
        Update: Partial<subscriptions["Row"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
type profiles = Database["public"]["Tables"]["profiles"];
type subscriptions = Database["public"]["Tables"]["subscriptions"];

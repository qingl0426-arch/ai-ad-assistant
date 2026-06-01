export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      ad_traffic: {
        Row: AdTrafficRow;
        Insert: AdTrafficInsert;
        Update: Partial<AdTrafficInsert>;
      };
      upload_batches: {
        Row: UploadBatch;
        Insert: Omit<UploadBatch, "id" | "created_at">;
        Update: Partial<Omit<UploadBatch, "id">>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id">>;
      };
      alipay_orders: {
        Row: AlipayOrder;
        Insert: Omit<AlipayOrder, "id" | "created_at">;
        Update: Partial<Omit<AlipayOrder, "id" | "created_at">>;
      };
      payment_logs: {
        Row: PaymentLog;
        Insert: Omit<PaymentLog, "id" | "created_at">;
        Update: Partial<Omit<PaymentLog, "id" | "created_at">>;
      };
    };
  };
}

export interface AdTrafficRow {
  id: string;
  user_id: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  gmv: number;
  orders: number;
  roi: number;
  platform: string;
  campaign: string;
  batch_id: string | null;
  created_at: string;
}

export interface AdTrafficInsert {
  user_id?: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  gmv: number;
  orders: number;
  roi: number;
  platform?: string;
  campaign?: string;
  batch_id?: string;
}

export interface UploadBatch {
  id: string;
  user_id: string;
  filename: string;
  row_count: number;
  status: "success" | "partial" | "failed";
  errors: Json[] | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  plan: string;
  plan_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AlipayOrderStatus = "pending" | "paid" | "refunding" | "refunded" | "closed";

export interface AlipayOrder {
  id: string;
  out_trade_no: string;
  user_id: string;
  plan: string;
  amount: number;
  status: AlipayOrderStatus;
  trade_no: string | null;
  refund_no: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
}

export type PaymentEventType =
  | "checkout_create"
  | "checkout_error"
  | "payment_notify"
  | "payment_verify_fail"
  | "payment_success"
  | "refund_create"
  | "refund_success"
  | "refund_error"
  | "order_query"
  | "order_sync";

export interface PaymentLog {
  id: string;
  event: PaymentEventType;
  out_trade_no: string | null;
  user_id: string | null;
  plan: string | null;
  amount: number | null;
  payload: Json | null;
  result: string | null;
  error: string | null;
  created_at: string;
}

export interface CSVParsedRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  gmv: number;
  orders: number;
  roi: number;
  platform?: string;
  campaign?: string;
}

export interface UploadResult {
  batchId: string;
  filename: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: UploadError[];
}

export interface UploadError {
  row: number;
  message: string;
  data?: Record<string, string>;
}
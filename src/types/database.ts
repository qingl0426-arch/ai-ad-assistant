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

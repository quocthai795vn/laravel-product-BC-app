// Migration Types
import { StoreConnection } from './store';

export interface MigrationResults {
  created: number;
  updated: number;
  deleted?: number;
  skipped: number;
  failed: number;
}

export interface MigrationDetail {
  status: 'created' | 'updated' | 'deleted' | 'skipped' | 'failed';
  category_id?: number;
  old_category_id?: number;
  new_category_id?: number;
  category_name: string;
  error?: string;
  parent_id?: number;
  updated_fields?: string[];
  reason?: string;
}

export interface MigrationLog {
  id: number;
  source_store?: StoreConnection;
  target_store?: StoreConnection;
  categories_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
  duration?: number;
  duration_formatted?: string;
  results?: MigrationResults;
  details?: MigrationDetail[];
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MigrationProgress {
  current: number;
  total: number;
  percentage: number;
  results: MigrationResults;
  current_category?: string;
  error?: string;
}

export type MigrationOperation = 'create' | 'update' | 'delete' | 'all';

export interface MigrateCategoriesRequest {
  source_store_id: number;
  target_store_id: number;
  operation: MigrationOperation;
  categories: any[] | {
    missing?: any[];
    updated?: any[];
    deleted?: any[];
  };
}

export interface MigrateCategoriesResponse {
  success: boolean;
  message: string;
  migration_log: MigrationLog;
  results: MigrationResults & {
    details: MigrationDetail[];
  };
}

export interface MigrationLogsResponse {
  success: boolean;
  logs: MigrationLog[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MigrationLogResponse {
  success: boolean;
  log: MigrationLog;
}

export type MigrationStatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';

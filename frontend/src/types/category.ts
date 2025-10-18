// Category Types
export interface Category {
  id: number;
  name: string;
  path: string;
  parent_id: number;
  custom_url: string;
  is_visible: boolean;
  description?: string;
  page_title?: string;
  meta_description?: string;
  sort_order?: number;
}

export interface CategoryChange {
  field: string;
  source_value: any;
  target_value: any;
}

export interface UpdatedCategory {
  source_id: number;
  target_id: number;
  name: string;
  path: string;
  status: 'updated';
  changes: CategoryChange[];
  source_data: Category;
  target_data: Category;
}

export interface CategoryWithStatus extends Category {
  status: 'missing' | 'deleted' | 'unchanged';
}

export interface ComparisonSummary {
  total_source_categories: number;
  total_target_categories: number;
  missing_count: number;
  deleted_count: number;
  updated_count: number;
  unchanged_count: number;
}

export interface CategoryComparison {
  summary: ComparisonSummary;
  missing: CategoryWithStatus[];
  deleted: CategoryWithStatus[];
  updated: UpdatedCategory[];
  unchanged: CategoryWithStatus[];
}

export interface CompareCategoriesRequest {
  source_store_id: number;
  target_store_id: number;
}

export interface CompareCategoriesResponse {
  success: boolean;
  source_store: {
    id: number;
    name: string;
  };
  target_store: {
    id: number;
    name: string;
    tree_id?: number;
  };
  comparison: CategoryComparison;
}

export interface CategoriesResponse {
  success: boolean;
  store: {
    id: number;
    name: string;
    tree_id?: number;
  };
  categories: any[];
  count: number;
}

export type CategoryStatus = 'all' | 'missing' | 'deleted' | 'updated' | 'unchanged';

export type CategoryFilterStatus = CategoryStatus;

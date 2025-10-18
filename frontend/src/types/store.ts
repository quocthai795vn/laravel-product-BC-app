// Store Connection Types
export interface StoreConnection {
  id: number;
  name: string;
  store_hash: string;
  type: 'source' | 'target';
  tree_id?: number;
  tree_name?: string;
  is_active: boolean;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreConnectionForm {
  name: string;
  store_hash: string;
  access_token: string;
  type: 'source' | 'target';
  tree_id?: number;
  tree_name?: string;
}

export interface CategoryTree {
  id: number;
  name: string;
  channels: number[];
}

export interface StoreInfo {
  success: boolean;
  store_name: string;
  store_url: string;
  error?: string;
}

export interface ConnectStoreResponse {
  success: boolean;
  message: string;
  store: StoreConnection;
  store_info: StoreInfo;
}

export interface StoresListResponse {
  success: boolean;
  stores: StoreConnection[];
}

export interface CategoryTreesResponse {
  success: boolean;
  trees: CategoryTree[];
}

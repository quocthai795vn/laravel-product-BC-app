import axiosInstance from '@/lib/axios';
import {
  MigrateCategoriesRequest,
  MigrateCategoriesResponse,
  MigrationLogsResponse,
  MigrationLogResponse,
  MigrationStatusFilter,
} from '@/types/migration';
import { PaginationParams } from '@/types/api';

/**
 * Migration Management API
 */
export const migrationApi = {
  /**
   * Migrate categories from source to target
   */
  async migrateCategories(
    data: MigrateCategoriesRequest
  ): Promise<MigrateCategoriesResponse> {
    const response = await axiosInstance.post<MigrateCategoriesResponse>(
      '/categories/migrate',
      data
    );
    return response.data;
  },

  /**
   * Get migration logs with optional filters
   */
  async getLogs(params?: {
    status?: MigrationStatusFilter;
    source_store_id?: number;
    target_store_id?: number;
  } & PaginationParams): Promise<MigrationLogsResponse> {
    const response = await axiosInstance.get<MigrationLogsResponse>(
      '/categories/logs',
      { params }
    );
    return response.data;
  },

  /**
   * Get a single migration log by ID
   */
  async getLog(id: number): Promise<MigrationLogResponse> {
    const response = await axiosInstance.get<MigrationLogResponse>(
      `/categories/logs/${id}`
    );
    return response.data;
  },
};

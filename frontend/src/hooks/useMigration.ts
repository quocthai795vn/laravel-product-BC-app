import { useState } from 'react';
import { message } from 'antd';
import { migrationApi } from '@/services/api';
import {
  MigrateCategoriesRequest,
  MigrationLog,
  MigrationStatusFilter,
} from '@/types/migration';
import { PaginationParams } from '@/types/api';

/**
 * Hook for managing migration operations
 */
export const useMigration = () => {
  const [currentMigration, setCurrentMigration] = useState<MigrationLog | null>(null);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  /**
   * Migrate categories
   */
  const migrateCategories = async (data: MigrateCategoriesRequest) => {
    setMigrating(true);
    setError(null);

    try {
      const response = await migrationApi.migrateCategories(data);
      setCurrentMigration(response.migration_log);

      if (response.success) {
        message.success(response.message || 'Migration completed successfully');
      }

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Migration failed';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setMigrating(false);
    }
  };

  /**
   * Get migration logs
   */
  const fetchLogs = async (params?: {
    status?: MigrationStatusFilter;
    source_store_id?: number;
    target_store_id?: number;
  } & PaginationParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await migrationApi.getLogs(params);
      setLogs(response.logs);
      setPagination(response.pagination);
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch migration logs';
      setError(errorMessage);
      message.error(errorMessage);
      return { logs: [], pagination };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a single migration log
   */
  const fetchLog = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await migrationApi.getLog(id);
      setCurrentMigration(response.log);
      return response.log;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch migration log';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset migration state
   */
  const resetMigration = () => {
    setCurrentMigration(null);
    setError(null);
  };

  return {
    currentMigration,
    logs,
    pagination,
    loading,
    migrating,
    error,
    migrateCategories,
    fetchLogs,
    fetchLog,
    resetMigration,
  };
};

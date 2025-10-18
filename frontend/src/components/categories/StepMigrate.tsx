'use client';

import React, { useState } from 'react';
import { Typography, Button, Space, Divider, Result, Alert } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import MigrationProgress from './MigrationProgress';
import { useMigration } from '@/hooks';
import { MigrationOperation } from '@/types/migration';

const { Title, Text } = Typography;

interface StepMigrateProps {
  data: {
    sourceStoreId: number;
    targetStoreId: number;
    comparison: any;
    selectedCategories: any[];
  };
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function StepMigrate({ data, onNext, onPrevious }: StepMigrateProps) {
  const { currentMigration, migrateCategories, migrating } = useMigration();
  const [migrationStarted, setMigrationStarted] = useState(false);

  const handleMigrate = async () => {
    setMigrationStarted(true);

    // Determine operation type based on selected categories
    // Group categories by their status
    const missingCategories = data.selectedCategories.filter(cat => cat.status === 'missing');
    const updatedCategories = data.selectedCategories.filter(cat => cat.status === 'updated');
    const deletedCategories = data.selectedCategories.filter(cat => cat.status === 'deleted');

    // Determine which operation to use
    let operation: MigrationOperation;
    let categories: any = data.selectedCategories;

    if (missingCategories.length > 0 && updatedCategories.length === 0 && deletedCategories.length === 0) {
      operation = 'create';
    } else if (updatedCategories.length > 0 && missingCategories.length === 0 && deletedCategories.length === 0) {
      operation = 'update';
    } else if (deletedCategories.length > 0 && missingCategories.length === 0 && updatedCategories.length === 0) {
      operation = 'delete';
    } else {
      // Mixed operations - use 'all' operation
      operation = 'all';
      categories = {
        missing: missingCategories,
        updated: updatedCategories,
        deleted: deletedCategories,
      };
    }

    try {
      await migrateCategories({
        source_store_id: data.sourceStoreId,
        target_store_id: data.targetStoreId,
        operation,
        categories,
      });
    } catch {
      // Error handled in hook
    }
  };

  const isCompleted = currentMigration?.status === 'completed';
  const isFailed = currentMigration?.status === 'failed';

  return (
    <div>
      <Title level={3}>Migrate Categories</Title>
      <Text type="secondary">
        Execute the migration process to sync categories from source to target store.
      </Text>

      <Divider />

      {!migrationStarted && (
        <div>
          <Alert
            message="Ready to Migrate"
            description={`You are about to migrate ${data.selectedCategories.length} categories. This operation cannot be undone.`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              size="large"
              onClick={onPrevious}
            >
              Previous
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={handleMigrate}
              loading={migrating}
            >
              Start Migration
            </Button>
          </div>
        </div>
      )}

      {migrationStarted && currentMigration && (
        <MigrationProgress
          progress={
            currentMigration.results
              ? Math.round(
                  ((currentMigration.results.created +
                    currentMigration.results.updated +
                    (currentMigration.results.deleted || 0) +
                    currentMigration.results.skipped +
                    currentMigration.results.failed) /
                    data.selectedCategories.length) *
                    100
                )
              : 0
          }
          results={
            currentMigration.results || {
              created: 0,
              updated: 0,
              skipped: 0,
              failed: 0,
            }
          }
          details={currentMigration.details}
          status={currentMigration.status}
        />
      )}

      {isCompleted && (
        <div style={{ marginTop: 24 }}>
          <Result
            status="success"
            title="Migration Completed Successfully!"
            subTitle={`Successfully migrated ${currentMigration.results?.created || 0} categories.`}
            extra={[
              <Button type="primary" key="next" onClick={onNext}>
                View Logs
              </Button>,
            ]}
          />
        </div>
      )}

      {isFailed && (
        <div style={{ marginTop: 24 }}>
          <Result
            status="error"
            title="Migration Failed"
            subTitle={currentMigration.error_message || 'An error occurred during migration.'}
            extra={[
              <Button key="retry" onClick={handleMigrate} loading={migrating}>
                Retry Migration
              </Button>,
            ]}
          />
        </div>
      )}
    </div>
  );
}

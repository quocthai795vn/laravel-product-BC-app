'use client';

import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Divider, Button, Alert } from 'antd';
import StoreConnectionForm from './StoreConnectionForm';
import { useStores } from '@/hooks';

const { Title, Text } = Typography;

interface StepConnectProps {
  onNext?: () => void;
}

export default function StepConnect({ onNext }: StepConnectProps) {
  const { stores, fetchStores } = useStores();

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sourceStores = stores.filter(s => s.type === 'source');
  const targetStores = stores.filter(s => s.type === 'target');

  const handleSuccess = () => {
    fetchStores();
  };

  const canProceed = sourceStores.length > 0 && targetStores.length > 0;

  return (
    <div>
      <Title level={3}>Connect Your Stores</Title>
      <Text type="secondary">
        Connect both source and target BigCommerce stores to begin category migration.
      </Text>

      <Divider />

      {!canProceed && (
        <Alert
          message="Connect Both Stores"
          description="Please connect both a source store and a target store to proceed to the next step."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <StoreConnectionForm type="source" onSuccess={handleSuccess} />

          {sourceStores.length > 0 && (
            <Card style={{ marginTop: 16 }} size="small">
              <Text strong>Connected Source Stores:</Text>
              <ul>
                {sourceStores.map(store => (
                  <li key={store.id}>
                    {store.name} ({store.store_hash})
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={12}>
          <StoreConnectionForm type="target" onSuccess={handleSuccess} />

          {targetStores.length > 0 && (
            <Card style={{ marginTop: 16 }} size="small">
              <Text strong>Connected Target Stores:</Text>
              <ul>
                {targetStores.map(store => (
                  <li key={store.id}>
                    {store.name} ({store.store_hash}) - Tree: {store.tree_id}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Col>
      </Row>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button
          type="primary"
          size="large"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next: Compare Categories
        </Button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import {
  ExportOutlined,
  ImportOutlined,
  SyncOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface StepActionProps {
  onSelectAction: (action: 'export' | 'import' | 'migrate') => void;
}

export default function StepAction({ onSelectAction }: StepActionProps) {
  return (
    <div>
      <Title level={3}>Choose Action</Title>
      <Paragraph type="secondary" style={{ marginBottom: 32 }}>
        Select what you would like to do with your categories
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* Export Option */}
        <Col xs={24} lg={8}>
          <Card
            hoverable
            style={{
              height: '100%',
              textAlign: 'center',
              border: '1px solid #d9d9d9',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: 40 }}
            className="action-card"
          >
            <ExportOutlined
              style={{
                fontSize: 64,
                color: '#52c41a',
                marginBottom: 24
              }}
            />
            <Title level={4}>Export Categories</Title>
            <Paragraph type="secondary" style={{ minHeight: 80 }}>
              Export categories from a store to CSV/JSON format for backup,
              analysis, or migration to another system.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => onSelectAction('export')}
              style={{ marginTop: 16 }}
            >
              Export Categories
            </Button>
          </Card>
        </Col>

        {/* Import Option */}
        <Col xs={24} lg={8}>
          <Card
            hoverable
            style={{
              height: '100%',
              textAlign: 'center',
              border: '1px solid #d9d9d9',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: 40 }}
            className="action-card"
          >
            <ImportOutlined
              style={{
                fontSize: 64,
                color: '#1890ff',
                marginBottom: 24
              }}
            />
            <Title level={4}>Import Categories</Title>
            <Paragraph type="secondary" style={{ minHeight: 80 }}>
              Import categories from CSV/JSON file into your store.
              The file must match the export format.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => onSelectAction('import')}
              style={{ marginTop: 16 }}
            >
              Import Categories
            </Button>
          </Card>
        </Col>

        {/* Migrate Option */}
        <Col xs={24} lg={8}>
          <Card
            hoverable
            style={{
              height: '100%',
              textAlign: 'center',
              border: '1px solid #d9d9d9',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: 40 }}
            className="action-card"
          >
            <SyncOutlined
              style={{
                fontSize: 64,
                color: '#722ed1',
                marginBottom: 24
              }}
            />
            <Title level={4}>Migrate Categories</Title>
            <Paragraph type="secondary" style={{ minHeight: 80 }}>
              Compare and migrate categories between stores with
              advanced comparison and synchronization.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => onSelectAction('migrate')}
              style={{ marginTop: 16 }}
            >
              Migrate Categories
            </Button>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        :global(.action-card:hover) {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}

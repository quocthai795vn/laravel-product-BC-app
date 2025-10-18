import React from 'react';
import { Spin, Space } from 'antd';

interface LoadingStateProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
}

export default function LoadingState({ tip = 'Loading...', size = 'large' }: LoadingStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Space direction="vertical" size="middle">
        <Spin size={size} />
        <div>{tip}</div>
      </Space>
    </div>
  );
}

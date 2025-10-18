'use client';

import { App, ConfigProvider } from 'antd';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 6,
        },
      }}
    >
      <App
        notification={{
          maxCount: 3,
          placement: 'top',
          top: 24,
        }}
      >
        {children}
      </App>
    </ConfigProvider>
  );
}

'use client';

import { App, ConfigProvider } from 'antd';
import { ReactNode } from 'react';
import AntdRegistry from '@/lib/AntdRegistry';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
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
    </AntdRegistry>
  );
}

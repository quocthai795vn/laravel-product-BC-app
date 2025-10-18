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
            colorPrimary: '#1890ff',
            borderRadius: 6,
            fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            fontSize: 14,
            colorText: 'rgba(0, 0, 0, 0.85)',
            colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
            colorBorder: '#f0f0f0',
            colorBgLayout: '#f0f2f5',
          },
          components: {
            Layout: {
              bodyBg: '#f0f2f5',
              headerBg: '#fff',
              siderBg: '#fff',
            },
            Menu: {
              itemSelectedBg: '#e6f7ff',
              itemSelectedColor: '#1890ff',
            },
            Card: {
              borderRadiusLG: 8,
            },
            Button: {
              fontWeight: 500,
            },
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

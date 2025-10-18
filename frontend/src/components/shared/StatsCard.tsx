import React from 'react';
import { Card, Statistic } from 'antd';

interface StatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  suffix?: string;
}

export default function StatsCard({ title, value, icon, color = '#1890ff', suffix }: StatsCardProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{ color }}
      />
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Steps, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import StepConnect from '@/components/categories/StepConnect';
import StepCompare from '@/components/categories/StepCompare';
import StepMigrate from '@/components/categories/StepMigrate';
import StepLogs from '@/components/categories/StepLogs';

const { Step } = Steps;

export default function CategoriesPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [migrationData, setMigrationData] = useState<any>(null);

  const steps = [
    {
      title: 'Connect Stores',
      description: 'Set up connection',
    },
    {
      title: 'Compare Categories',
      description: 'Find differences',
    },
    {
      title: 'Run Migration',
      description: 'Execute migration',
    },
    {
      title: 'View Logs',
      description: 'Migration history',
    },
  ];

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCompareNext = (data: any) => {
    setMigrationData(data);
    handleNext();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepConnect onNext={handleNext} />;
      case 1:
        return <StepCompare onNext={handleCompareNext} onPrevious={handlePrevious} />;
      case 2:
        return migrationData ? (
          <StepMigrate data={migrationData} onNext={handleNext} onPrevious={handlePrevious} />
        ) : (
          <div>No migration data available. Please go back and compare categories.</div>
        );
      case 3:
        return <StepLogs onPrevious={handlePrevious} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push('/dashboard')}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>

      <Card>
        <Steps
          current={currentStep}
          style={{ marginBottom: 32 }}
        >
          {steps.map((step) => (
            <Step
              key={step.title}
              title={step.title}
              description={step.description}
            />
          ))}
        </Steps>

        <div style={{ minHeight: 400 }}>{renderStepContent()}</div>
      </Card>
    </div>
  );
}

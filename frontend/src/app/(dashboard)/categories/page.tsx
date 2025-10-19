'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Steps, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import StepConnect from '@/components/categories/StepConnect';
import StepAction from '@/components/categories/StepAction';
import StepExport from '@/components/categories/StepExport';
import StepImport from '@/components/categories/StepImport';
import StepCompare from '@/components/categories/StepCompare';
import StepMigrate from '@/components/categories/StepMigrate';
import StepLogs from '@/components/categories/StepLogs';

const { Step } = Steps;

type ActionType = 'export' | 'import' | 'migrate' | null;

export default function CategoriesPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [migrationData, setMigrationData] = useState<any>(null);

  // Dynamic steps based on selected action
  const getSteps = () => {
    const baseSteps = [
      {
        title: 'Connect Stores',
        description: 'Set up connection',
      },
      {
        title: 'Choose Action',
        description: 'Export/Import/Migrate',
      },
    ];

    if (selectedAction === 'export') {
      return [
        ...baseSteps,
        {
          title: 'Export Categories',
          description: 'Download categories',
        },
      ];
    }

    if (selectedAction === 'import') {
      return [
        ...baseSteps,
        {
          title: 'Import Categories',
          description: 'Upload & import',
        },
      ];
    }

    if (selectedAction === 'migrate') {
      return [
        ...baseSteps,
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
    }

    return baseSteps;
  };

  const steps = getSteps();

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleActionSelect = (action: ActionType) => {
    setSelectedAction(action);
    handleNext();
  };

  const handleCompareNext = (data: any) => {
    setMigrationData(data);
    handleNext();
  };

  const renderStepContent = () => {
    // Step 0: Connect Stores
    if (currentStep === 0) {
      return <StepConnect onNext={handleNext} />;
    }

    // Step 1: Choose Action
    if (currentStep === 1) {
      return (
        <StepAction
          onSelectAction={handleActionSelect}
        />
      );
    }

    // Export Flow
    if (selectedAction === 'export' && currentStep === 2) {
      return (
        <StepExport
          onPrevious={handlePrevious}
        />
      );
    }

    // Import Flow
    if (selectedAction === 'import' && currentStep === 2) {
      return (
        <StepImport
          onPrevious={handlePrevious}
        />
      );
    }

    // Migration Flow
    if (selectedAction === 'migrate') {
      switch (currentStep) {
        case 2:
          return <StepCompare onNext={handleCompareNext} onPrevious={handlePrevious} />;
        case 3:
          return migrationData ? (
            <StepMigrate data={migrationData} onNext={handleNext} onPrevious={handlePrevious} />
          ) : (
            <div>No migration data available. Please go back and compare categories.</div>
          );
        case 4:
          return <StepLogs onPrevious={handlePrevious} />;
        default:
          return null;
      }
    }

    return null;
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

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { t } from '@/lib/i18n';

interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  validationErrors?: string[];
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  loading: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  children: React.ReactNode;
}

const WizardStep: React.FC<WizardStepProps> = ({
  currentStep,
  totalSteps,
  isValid,
  validationErrors = [],
  onNext,
  onPrevious,
  onComplete,
  loading,
  canGoNext,
  canGoPrevious,
  children
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <Card>
      <CardContent className="p-6">
        {/* Step Content */}
        <div className="mb-8">
          {children}
        </div>

        {/* Validation Errors */}
        {!isValid && validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Vui lòng sửa các lỗi sau:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            {canGoPrevious && (
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('wizard.buttons.previous')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button
                onClick={onNext}
                disabled={!isValid || loading}
                className="flex items-center gap-2"
              >
                {t('wizard.buttons.next')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                disabled={!isValid || loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {t('wizard.buttons.create')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>
      </CardContent>
    </Card>
  );
};

export default WizardStep;





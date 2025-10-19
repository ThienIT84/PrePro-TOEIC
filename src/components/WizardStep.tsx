import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
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
                Previous
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
                Next
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
                    Create Exam Set
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




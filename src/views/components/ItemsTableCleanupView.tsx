/**
 * ItemsTableCleanupView
 * Pure UI component cho Items Table Cleanup
 * Extracted từ ItemsTableCleanup.tsx
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Trash2, Database, AlertTriangle } from 'lucide-react';
import { CleanupResult } from '../controllers/cleanup/ItemsTableCleanupController';

export interface ItemsTableCleanupViewProps {
  // State
  cleaning: boolean;
  cleanupResult: CleanupResult | null;

  // Actions
  onPerformCleanup: (userId: string | null) => Promise<CleanupResult>;

  // Utility functions
  getCleanupProcessSteps: () => string[];
  getCleanupBenefits: () => string[];
  getCleanupWarnings: () => string[];
  getCleanupResult: () => CleanupResult | null;
  isCleaning: () => boolean;
  isCleanupSuccessful: () => boolean;
  clearCleanupResult: () => void;
  resetCleanupState: () => void;

  // Props
  className?: string;
}

const ItemsTableCleanupView: React.FC<ItemsTableCleanupViewProps> = ({
  cleaning,
  cleanupResult,
  onPerformCleanup,
  getCleanupProcessSteps,
  getCleanupBenefits,
  getCleanupWarnings,
  getCleanupResult,
  isCleaning,
  isCleanupSuccessful,
  clearCleanupResult,
  resetCleanupState,
  className = ''
}) => {
  const cleanupSteps = getCleanupProcessSteps();
  const cleanupBenefits = getCleanupBenefits();
  const cleanupWarnings = getCleanupWarnings();

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          Items Table Cleanup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              {cleanupWarnings.map((warning, index) => (
                <p key={index} className={index === 0 ? "font-medium text-red-800" : "text-red-700"}>
                  {warning}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">🧹 Cleanup Process:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 ml-4">
            {cleanupSteps.map((step, index) => (
              <li key={index}>{index + 1}. {step}</li>
            ))}
          </ol>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => onPerformCleanup('user-id')} 
            disabled={cleaning}
            variant="destructive"
            className="flex-1"
          >
            {cleaning ? "Đang cleanup..." : "🗑️ Cleanup Items Table"}
          </Button>
        </div>

        {cleanupResult && (
          <Alert className={cleanupResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {cleanupResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium">
                  {cleanupResult.success ? "✅ Cleanup thành công!" : "❌ Cleanup thất bại!"}
                </p>
                <p>{cleanupResult.message}</p>
                
                {cleanupResult.error && (
                  <div className="text-sm">
                    <p className="font-medium text-red-600">Lỗi:</p>
                    <p className="text-red-600">{cleanupResult.error}</p>
                  </div>
                )}

                {cleanupResult.success && cleanupResult.steps && (
                  <div className="space-y-2">
                    <p className="font-medium">📋 Chi tiết các bước:</p>
                    <div className="space-y-1">
                      {cleanupResult.steps.map((step: string, index: number) => (
                        <p key={index} className="text-sm text-gray-600">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Lợi ích sau khi cleanup:</strong></p>
          {cleanupBenefits.map((benefit, index) => (
            <p key={index}>{benefit}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsTableCleanupView;

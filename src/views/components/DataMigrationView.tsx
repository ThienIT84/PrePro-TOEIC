/**
 * DataMigrationView
 * Pure UI component cho Data Migration
 * Extracted từ DataMigration.tsx
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, ArrowRight } from 'lucide-react';
import { MigrationResult, DataStatistics } from '../controllers/migration/DataMigrationController';

export interface DataMigrationViewProps {
  // State
  migrating: boolean;
  migrationResult: MigrationResult | null;

  // Actions
  onMigrateData: (userId: string) => Promise<MigrationResult>;
  onCheckDataStatistics: () => Promise<{ success: boolean; statistics?: DataStatistics; error?: string }>;

  // Utility functions
  getMigrationProcessSteps: () => string[];
  getMigrationResult: () => MigrationResult | null;
  isMigrating: () => boolean;
  isMigrationSuccessful: () => boolean;
  getMigrationStatistics: () => { originalCount: number; migratedCount: number } | null;
  clearMigrationResult: () => void;
  resetMigrationState: () => void;

  // Props
  className?: string;
}

const DataMigrationView: React.FC<DataMigrationViewProps> = ({
  migrating,
  migrationResult,
  onMigrateData,
  onCheckDataStatistics,
  getMigrationProcessSteps,
  getMigrationResult,
  isMigrating,
  isMigrationSuccessful,
  getMigrationStatistics,
  clearMigrationResult,
  resetMigrationState,
  className = ''
}) => {
  const migrationSteps = getMigrationProcessSteps();

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration: Items → Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Migrate dữ liệu từ bảng <code>items</code> (cũ) sang bảng <code>questions</code> (mới).
        </p>

        <div className="flex gap-4">
          <Button 
            onClick={() => onCheckDataStatistics()} 
            variant="outline"
            className="flex-1"
          >
            📊 Kiểm tra dữ liệu
          </Button>
          
          <Button 
            onClick={() => onMigrateData('user-id')} 
            disabled={migrating}
            className="flex-1"
          >
            {migrating ? "Đang migrate..." : "🚀 Migrate Data"}
          </Button>
        </div>

        {migrationResult && (
          <Alert className={migrationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {migrationResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium">
                  {migrationResult.success ? "✅ Migration thành công!" : "❌ Migration thất bại!"}
                </p>
                <p>{migrationResult.message}</p>
                
                {migrationResult.error && (
                  <div className="text-sm">
                    <p className="font-medium text-red-600">Lỗi:</p>
                    <p className="text-red-600">{migrationResult.error}</p>
                  </div>
                )}

                {migrationResult.success && (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📊 Thống kê:</span>
                      <span>Items: {migrationResult.originalCount}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span>Questions: {migrationResult.migratedCount}</span>
                    </div>

                    <div>
                      <p className="font-medium">📥 Dữ liệu gốc (items):</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(migrationResult.originalData, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <p className="font-medium">✅ Dữ liệu sau migrate (questions):</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(migrationResult.migratedData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Migration Process:</strong></p>
          {migrationSteps.map((step, index) => (
            <p key={index}>{step}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataMigrationView;

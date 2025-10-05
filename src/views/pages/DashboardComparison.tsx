import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Eye, Layers, Settings } from 'lucide-react';

// Import both versions
import Dashboard from '@/pages/Dashboard'; // Original
import { DashboardMVC } from './DashboardMVC'; // MVC version

/**
 * Dashboard Comparison - So sánh Original vs MVC
 */
export const DashboardComparison = () => {
  const [activeTab, setActiveTab] = useState('original');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Dashboard Migration Demo</h1>
        <p className="text-muted-foreground">
          So sánh giữa Dashboard gốc và Dashboard đã migrate sang MVC pattern
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="original" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Original (592 dòng)
          </TabsTrigger>
          <TabsTrigger value="mvc" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            MVC Pattern
          </TabsTrigger>
        </TabsList>

        <TabsContent value="original" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Dashboard Original
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="destructive">592 dòng code</Badge>
                <Badge variant="outline">Business logic trộn với UI</Badge>
                <Badge variant="outline">Direct Supabase calls</Badge>
                <Badge variant="outline">Khó test và maintain</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Vấn đề:</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• 592 dòng code trong 1 file</li>
                    <li>• Business logic trộn với UI logic</li>
                    <li>• Direct Supabase calls trong component</li>
                    <li>• Complex state management (6+ useState)</li>
                    <li>• Khó test và maintain</li>
                    <li>• Không có separation of concerns</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg">
                  <Dashboard />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mvc" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Dashboard MVC
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="default">Tách thành 4 files</Badge>
                <Badge variant="outline">Separation of concerns</Badge>
                <Badge variant="outline">Service layer</Badge>
                <Badge variant="outline">Dễ test và maintain</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Cải thiện:</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• DashboardView.tsx - Pure UI (200 dòng)</li>
                    <li>• DashboardController.ts - Business logic (100 dòng)</li>
                    <li>• useDashboardController.ts - React hook (50 dòng)</li>
                    <li>• DashboardMVC.tsx - Wrapper (30 dòng)</li>
                    <li>• Service layer cho data operations</li>
                    <li>• Dễ test và maintain</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg">
                  <DashboardMVC />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Architecture Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            So sánh Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div>
              <h3 className="font-semibold text-red-800 mb-3">Original Pattern</h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <strong>Dashboard.tsx (592 dòng)</strong>
                  <ul className="mt-1 text-red-700">
                    <li>• UI rendering</li>
                    <li>• Business logic</li>
                    <li>• State management</li>
                    <li>• Data fetching</li>
                    <li>• Error handling</li>
                    <li>• Validation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* MVC */}
            <div>
              <h3 className="font-semibold text-green-800 mb-3">MVC Pattern</h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong>DashboardView.tsx (200 dòng)</strong>
                  <ul className="mt-1 text-blue-700">
                    <li>• Pure UI rendering</li>
                    <li>• Props-driven</li>
                    <li>• Reusable</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <strong>DashboardController.ts (100 dòng)</strong>
                  <ul className="mt-1 text-green-700">
                    <li>• Business logic</li>
                    <li>• Data processing</li>
                    <li>• Validation</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <strong>useDashboardController.ts (50 dòng)</strong>
                  <ul className="mt-1 text-purple-700">
                    <li>• React integration</li>
                    <li>• State management</li>
                    <li>• Event handling</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <strong>Service Layer</strong>
                  <ul className="mt-1 text-orange-700">
                    <li>• Data operations</li>
                    <li>• API calls</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Lợi ích của MVC Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Maintainability</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Dễ tìm và sửa bug</li>
                <li>• Code được tổ chức rõ ràng</li>
                <li>• Thay đổi 1 phần không ảnh hưởng phần khác</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Testability</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Test riêng từng layer</li>
                <li>• Mock dễ dàng</li>
                <li>• Unit tests hiệu quả</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Reusability</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Controller có thể reuse</li>
                <li>• View có thể dùng với controller khác</li>
                <li>• Service layer shared</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardComparison;

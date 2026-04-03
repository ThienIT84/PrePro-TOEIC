import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Languages, Eye, EyeOff } from 'lucide-react';

interface ExamReviewSettingsProps {
  showTranslations: boolean;
  showExplanations: boolean;
  onToggleTranslations: (show: boolean) => void;
  onToggleExplanations: (show: boolean) => void;
}

export const ExamReviewSettings: React.FC<ExamReviewSettingsProps> = ({
  showTranslations,
  showExplanations,
  onToggleTranslations,
  onToggleExplanations
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Cài đặt hiển thị
      </Button>

      {isOpen && (
        <Card className="absolute top-10 right-0 z-50 w-80 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cài đặt hiển thị
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Translation Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <Label htmlFor="translations" className="text-sm font-medium">
                    Hiển thị bản dịch
                  </Label>
                </div>
                <Switch
                  id="translations"
                  checked={showTranslations}
                  onCheckedChange={onToggleTranslations}
                />
              </div>
              <p className="text-xs text-gray-600">
                Hiển thị bản dịch tiếng Việt và tiếng Anh cho Part 3, 4, 6, 7
              </p>
            </div>

            {/* Explanation Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <Label htmlFor="explanations" className="text-sm font-medium">
                    Hiển thị giải thích
                  </Label>
                </div>
                <Switch
                  id="explanations"
                  checked={showExplanations}
                  onCheckedChange={onToggleExplanations}
                />
              </div>
              <p className="text-xs text-gray-600">
                Hiển thị giải thích chi tiết cho từng câu hỏi
              </p>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onToggleTranslations(true);
                  onToggleExplanations(true);
                }}
              >
                Hiển thị tất cả
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onToggleTranslations(false);
                  onToggleExplanations(false);
                }}
              >
                Ẩn tất cả
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamReviewSettings;

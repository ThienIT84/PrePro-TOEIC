import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Eye, EyeOff } from 'lucide-react';

interface PassageDisplayProps {
  passage: {
    title?: string;
    content: string;
    additional?: string;
  };
  translationVi?: {
    title?: string;
    content: string;
    additional?: string;
  };
  translationEn?: {
    title?: string;
    content: string;
    additional?: string;
  };
  showTranslation?: boolean;
  className?: string;
}

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  passage,
  translationVi,
  translationEn,
  showTranslation = true,
  className = ''
}) => {
  const [showTranslations, setShowTranslations] = useState(showTranslation);
  const [activeTab, setActiveTab] = useState('original');

  const hasTranslations = translationVi || translationEn;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            📖 Passage Reading
          </CardTitle>
          {hasTranslations && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranslations(!showTranslations)}
                className="flex items-center gap-2"
              >
                {showTranslations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showTranslations ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasTranslations && showTranslations ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="original" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Bản gốc
              </TabsTrigger>
              {translationVi && (
                <TabsTrigger value="vietnamese" className="flex items-center gap-2">
                  🇻🇳 Tiếng Việt
                </TabsTrigger>
              )}
              {translationEn && (
                <TabsTrigger value="english" className="flex items-center gap-2">
                  🇺🇸 English
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="original" className="mt-4">
              <div className="space-y-3">
                {passage.title && (
                  <h3 className="text-lg font-semibold text-gray-900">{passage.title}</h3>
                )}
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed">{passage.content}</p>
                  {passage.additional && (
                    <p className="whitespace-pre-wrap leading-relaxed mt-3">{passage.additional}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {translationVi && (
              <TabsContent value="vietnamese" className="mt-4">
                <div className="space-y-3">
                  {translationVi.title && (
                    <h3 className="text-lg font-semibold text-gray-900">{translationVi.title}</h3>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{translationVi.content}</p>
                    {translationVi.additional && (
                      <p className="whitespace-pre-wrap leading-relaxed mt-3">{translationVi.additional}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}

            {translationEn && (
              <TabsContent value="english" className="mt-4">
                <div className="space-y-3">
                  {translationEn.title && (
                    <h3 className="text-lg font-semibold text-gray-900">{translationEn.title}</h3>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{translationEn.content}</p>
                    {translationEn.additional && (
                      <p className="whitespace-pre-wrap leading-relaxed mt-3">{translationEn.additional}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="space-y-3">
            {passage.title && (
              <h3 className="text-lg font-semibold text-gray-900">{passage.title}</h3>
            )}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{passage.content}</p>
              {passage.additional && (
                <p className="whitespace-pre-wrap leading-relaxed mt-3">{passage.additional}</p>
              )}
            </div>
          </div>
        )}

        {/* Translation indicators */}
        {hasTranslations && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Badge variant="outline" className="text-xs">
              📖 Bản gốc có sẵn
            </Badge>
            {translationVi && (
              <Badge variant="outline" className="text-xs">
                🇻🇳 Có bản dịch tiếng Việt
              </Badge>
            )}
            {translationEn && (
              <Badge variant="outline" className="text-xs">
                🇺🇸 Có bản dịch tiếng Anh
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassageDisplay;

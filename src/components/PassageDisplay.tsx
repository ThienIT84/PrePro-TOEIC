import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Eye, EyeOff, Globe } from 'lucide-react';

interface PassageDisplayProps {
  passage: {
    title?: string;
    content: string;
    content2?: string;
    content3?: string;
    img_url?: string;
    img_url2?: string;
    img_url3?: string;
    additional?: string;
  };
  translationVi?: {
    content: string;
    content2?: string;
    content3?: string;
  };
  translationEn?: {
    content: string;
    content2?: string;
    content3?: string;
  };
  showTranslation?: boolean;
  hideOriginalContent?: boolean;
  className?: string;
}

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  passage,
  translationVi,
  translationEn,
  showTranslation = true,
  hideOriginalContent = false,
  className = ''
}) => {
  const [showTranslations, setShowTranslations] = useState(showTranslation);
  
  // Determine default active tab
  const getDefaultTab = () => {
    if (translationVi) return 'vietnamese';
    if (translationEn) return 'english';
    return 'original';
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Update local state when prop changes
  useEffect(() => {
    setShowTranslations(showTranslation);
  }, [showTranslation]);
  
  // Update active tab when translations change
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [translationVi, translationEn]);

  const hasTranslations = translationVi || translationEn;
  
  // Helper to clean and validate translation content
  const cleanContent = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content.trim();
    // If it's an object or array, try to stringify it
    if (typeof content === 'object') {
      return JSON.stringify(content);
    }
    return String(content);
  };
  
  // Debug logging
  console.log('🔍 PassageDisplay Debug:', {
    hasTranslations,
    translationVi,
    translationEn,
    showTranslations,
    activeTab,
    translationViType: typeof translationVi,
    translationViContent: translationVi?.content,
    translationViContentLength: translationVi?.content?.length,
    translationViContent2: translationVi?.content2,
    translationViContent3: translationVi?.content3,
    translationViContentPreview: cleanContent(translationVi?.content)?.substring(0, 100)
  });

  // Helper function to render passage content
  const renderPassageContent = (content?: string, content2?: string, content3?: string) => {
    // Clean and filter out empty strings
    const contents = [content, content2, content3]
      .map(c => cleanContent(c))
      .filter(c => c.length > 0);
    
    if (contents.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">
          Chưa có nội dung
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {contents.map((text, index) => (
          <div key={index} className="space-y-3">
            {contents.length > 1 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Đoạn {index + 1}
                </Badge>
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render images
  const renderImages = () => {
    // Parse additional field first (priority)
    let imageUrls: string[] = [];
    
    if (passage.additional && passage.additional.trim() !== '') {
      imageUrls = passage.additional
        .split('|')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0 && url.startsWith('http'));
    }
    
    // Fallback to individual img_url fields if additional is empty
    if (imageUrls.length === 0) {
      imageUrls = [passage.img_url, passage.img_url2, passage.img_url3].filter(Boolean);
    }
    
    if (imageUrls.length === 0) return null;

    return (
      <div className="space-y-4 mb-6">
        {imageUrls.map((url, index) => (
          <div key={index} className="text-center">
            {imageUrls.length > 1 && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  Ảnh {index + 1}
                </Badge>
              </div>
            )}
            <img 
              src={url} 
              alt={`Passage image ${index + 1}`} 
              className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden text-sm text-red-500 mt-2">
              Không thể tải ảnh
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          📖 Passage Reading
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Render images first */}
        {renderImages()}

        {/* Render passage content */}
        {!hideOriginalContent && (
          <div className="space-y-3">
            {passage.title && (
              <h3 className="text-lg font-semibold text-gray-900">{passage.title}</h3>
            )}
            {renderPassageContent(passage.content, passage.content2, passage.content3)}
          </div>
        )}

        {/* Render translations if available and enabled */}
        {hasTranslations && showTranslations && (
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full ${translationVi && translationEn ? 'grid-cols-2' : 'grid-cols-1'}`}>
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

              {translationVi && (
                <TabsContent value="vietnamese" className="mt-4">
                  <div className="space-y-3">
                    {renderPassageContent(
                      translationVi.content, 
                      translationVi.content2, 
                      translationVi.content3
                    )}
                  </div>
                </TabsContent>
              )}

              {translationEn && (
                <TabsContent value="english" className="mt-4">
                  <div className="space-y-3">
                    {renderPassageContent(
                      translationEn.content, 
                      translationEn.content2, 
                      translationEn.content3
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}

        {/* Translation toggle and indicators */}
        {hasTranslations && (
          <div className="pt-4 border-t space-y-3">
            {/* Toggle button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranslations(!showTranslations)}
                className="flex items-center gap-2"
              >
                {showTranslations ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                {showTranslations ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
              </Button>
            </div>
            
            {/* Translation indicators */}
            <div className="flex flex-wrap gap-2 justify-center">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassageDisplay;

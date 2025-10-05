/**
 * PassageManagerView
 * Pure UI component cho Passage Management
 * Nhận tất cả data và callbacks qua props
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Headphones, 
  BookOpen,
  Play,
  Pause,
  Volume2,
  FileText,
  Calendar,
  User,
  Upload,
  Download,
  FileSpreadsheet,
  FileImage,
  CheckSquare,
  Square,
  Trash
} from 'lucide-react';
import { Passage, PassageFormData, PassageManagerState } from '@/controllers/passage/PassageManagerController';

export interface PassageManagerViewProps {
  // State
  state: PassageManagerState;

  // Handlers
  onSearchTermChange: (searchTerm: string) => void;
  onFilterPartChange: (filterPart: string) => void;
  onActiveTabChange: (activeTab: string) => void;
  onFormDataChange: (field: string, value: any) => void;
  onContentChange: (content: string) => void;
  onToggleSelectAll: () => void;
  onToggleSelectPassage: (passageId: string) => void;
  onEditPassage: (passage: Passage) => void;
  onSavePassage: () => void;
  onDeletePassage: (passageId: string) => void;
  onDeleteSelectedPassages: () => void;
  onDownloadTemplate: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetForm: () => void;

  // Utility functions
  getFilteredPassages: () => Passage[];
  getPartName: (part: number) => string;
  getPartColor: (part: number) => string;
  getStatistics: () => {
    totalPassages: number;
    filteredPassages: number;
    selectedCount: number;
    partCounts: Record<number, number>;
    activeFiltersCount: number;
  };

  // Props
  className?: string;
}

export const PassageManagerView: React.FC<PassageManagerViewProps> = ({
  state,
  onSearchTermChange,
  onFilterPartChange,
  onActiveTabChange,
  onFormDataChange,
  onContentChange,
  onToggleSelectAll,
  onToggleSelectPassage,
  onEditPassage,
  onSavePassage,
  onDeletePassage,
  onDeleteSelectedPassages,
  onDownloadTemplate,
  onFileUpload,
  onResetForm,
  getFilteredPassages,
  getPartName,
  getPartColor,
  getStatistics,
  className = '',
}) => {
  const filteredPassages = getFilteredPassages();
  const statistics = getStatistics();

  if (state.loading) {
    return (
      <div className={`container mx-auto px-4 py-6 max-w-6xl ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-6 max-w-6xl ${className}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý đoạn văn</h1>
        <p className="text-muted-foreground">
          Tạo và quản lý các đoạn văn cho Parts 3, 4, 6, 7
        </p>
      </div>

      <Tabs value={state.activeTab} onValueChange={onActiveTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Danh sách ({state.passages.length})
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {state.editingPassage ? 'Chỉnh sửa' : 'Tạo mới'}
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Excel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <CardTitle>Danh sách đoạn văn</CardTitle>
                  <CardDescription>
                    Quản lý các đoạn văn cho bài thi TOEIC
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={onDownloadTemplate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  <Button onClick={() => onActiveTabChange('import')} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                  <Button onClick={() => onActiveTabChange('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                      value={state.searchTerm}
                      onChange={(e) => onSearchTermChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={state.filterPart} onValueChange={onFilterPartChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Lọc theo Part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả Parts</SelectItem>
                    <SelectItem value="3">Part 3 - Conversations</SelectItem>
                    <SelectItem value="4">Part 4 - Talks</SelectItem>
                    <SelectItem value="6">Part 6 - Text Completion</SelectItem>
                    <SelectItem value="7">Part 7 - Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {filteredPassages.length > 0 && (
                <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggleSelectAll}
                      className="flex items-center gap-2"
                    >
                      {state.selectedPassages.size === filteredPassages.length ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      {state.selectedPassages.size === filteredPassages.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </Button>
                    
                    {state.selectedPassages.size > 0 && (
                      <span className="text-sm text-gray-600">
                        Đã chọn {state.selectedPassages.size} đoạn văn
                      </span>
                    )}
                  </div>
                  
                  {state.selectedPassages.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onDeleteSelectedPassages}
                      disabled={state.deleting}
                      className="flex items-center gap-2"
                    >
                      <Trash className="h-4 w-4" />
                      {state.deleting ? 'Đang xóa...' : `Xóa ${state.selectedPassages.size} đoạn văn`}
                    </Button>
                  )}
                </div>
              )}

              {/* Passages List */}
              {filteredPassages.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {state.searchTerm || state.filterPart !== 'all' 
                      ? 'Không tìm thấy đoạn văn nào' 
                      : 'Chưa có đoạn văn nào. Hãy tạo đoạn văn đầu tiên!'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPassages.map((passage) => (
                    <Card key={passage.id} className={`hover:shadow-md transition-shadow ${state.selectedPassages.has(passage.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center mt-1">
                              <Checkbox
                                checked={state.selectedPassages.has(passage.id)}
                                onCheckedChange={() => onToggleSelectPassage(passage.id)}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPartColor(passage.part)}>
                                  {getPartName(passage.part)}
                                </Badge>
                                <Badge variant="outline">
                                  {passage.passage_type}
                                </Badge>
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-2">
                                {passage.texts.title}
                              </h3>
                              
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {passage.texts.content}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  {passage.meta.word_count} từ
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {passage.meta.reading_time} phút
                                </div>
                                {passage.audio_url && (
                                  <div className="flex items-center gap-1">
                                    <Headphones className="h-4 w-4" />
                                    Có audio
                                  </div>
                                )}
                                {passage.image_url && (
                                  <div className="flex items-center gap-1">
                                    <FileImage className="h-4 w-4" />
                                    Có hình ảnh
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditPassage(passage)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeletePassage(passage.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {state.editingPassage ? 'Chỉnh sửa đoạn văn' : 'Tạo đoạn văn mới'}
              </CardTitle>
              <CardDescription>
                Nhập thông tin đoạn văn cho bài thi TOEIC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part">Part</Label>
                  <Select
                    value={state.formData.part.toString()}
                    onValueChange={(value) => onFormDataChange('part', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Part 3 - Conversations</SelectItem>
                      <SelectItem value="4">Part 4 - Talks</SelectItem>
                      <SelectItem value="6">Part 6 - Text Completion</SelectItem>
                      <SelectItem value="7">Part 7 - Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="passage_type">Loại đoạn văn</Label>
                  <Select
                    value={state.formData.passage_type}
                    onValueChange={(value) => onFormDataChange('passage_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="triple">Triple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={state.formData.texts.title}
                  onChange={(e) => onFormDataChange('texts.title', e.target.value)}
                  placeholder="Nhập tiêu đề đoạn văn..."
                />
              </div>

              <div>
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  value={state.formData.texts.content}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder="Nhập nội dung đoạn văn..."
                  rows={8}
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  {state.formData.meta.word_count} từ • {state.formData.meta.reading_time} phút đọc
                </div>
              </div>

              <div>
                <Label htmlFor="additional">Nội dung bổ sung</Label>
                <Textarea
                  id="additional"
                  value={state.formData.texts.additional}
                  onChange={(e) => onFormDataChange('texts.additional', e.target.value)}
                  placeholder="Nhập nội dung bổ sung (nếu có)..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audio_url">URL Audio</Label>
                  <Input
                    id="audio_url"
                    value={state.formData.audio_url}
                    onChange={(e) => onFormDataChange('audio_url', e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">URL Hình ảnh</Label>
                  <Input
                    id="image_url"
                    value={state.formData.image_url}
                    onChange={(e) => onFormDataChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="topic">Chủ đề</Label>
                <Input
                  id="topic"
                  value={state.formData.meta.topic}
                  onChange={(e) => onFormDataChange('meta.topic', e.target.value)}
                  placeholder="Nhập chủ đề..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={onSavePassage} disabled={state.saving}>
                  {state.saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button variant="outline" onClick={onResetForm}>
                  Reset
                </Button>
                <Button variant="outline" onClick={() => onActiveTabChange('list')}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import từ Excel</CardTitle>
              <CardDescription>
                Tải lên file Excel để import nhiều đoạn văn cùng lúc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Button onClick={onDownloadTemplate} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Tải template
                </Button>
              </div>

              <div>
                <Label htmlFor="file-upload">Chọn file Excel</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={onFileUpload}
                  disabled={state.importing}
                />
              </div>

              {state.importing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Đang import...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.importProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(state.importProgress)}% hoàn thành
                  </div>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Hướng dẫn:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Tải template để xem định dạng dữ liệu</li>
                    <li>Điền thông tin vào các cột: part, passage_type, title, content</li>
                    <li>Các cột khác là tùy chọn: audio_url, image_url, topic</li>
                    <li>Part phải là 3, 4, 6, hoặc 7</li>
                    <li>Passage type phải là single, double, hoặc triple</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

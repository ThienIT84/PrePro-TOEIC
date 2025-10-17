import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface Passage {
  id: string;
  part: number;
  passage_type: 'single' | 'double' | 'triple';
  texts: {
    title: string;
    content: string;        // Đoạn 1
    content2?: string;      // Đoạn 2 (double/triple)
    content3?: string;      // Đoạn 3 (triple)
    img_url?: string;       // Ảnh đoạn 1
    img_url2?: string;      // Ảnh đoạn 2 (double/triple)
    img_url3?: string;      // Ảnh đoạn 3 (triple)
  };
  translation_vi?: {
    content: string;
    content2?: string;
    content3?: string;
  };
  translation_en?: {
    content: string;
    content2?: string;
    content3?: string;
  };
  audio_url?: string;
  assets?: {
    images: string[];
    charts: string[];
  };
  meta: {
    topic: string;
    word_count: number;
    reading_time: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface PassageFormData {
  part: number;
  passage_type: 'single' | 'double' | 'triple';
  texts: {
    title: string;
    content: string;        // Đoạn 1
    content2?: string;      // Đoạn 2 (double/triple)
    content3?: string;      // Đoạn 3 (triple)
    img_url?: string;       // Ảnh đoạn 1
    img_url2?: string;      // Ảnh đoạn 2 (double/triple)
    img_url3?: string;      // Ảnh đoạn 3 (triple)
  };
  translation_vi?: {
    content: string;
    content2?: string;
    content3?: string;
  };
  translation_en?: {
    content: string;
    content2?: string;
    content3?: string;
  };
  audio_url: string;
  assets: {
    images: string[];
    charts: string[];
  };
  meta: {
    topic: string;
    word_count: number;
    reading_time: number;
  };
}

const PassageManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPart, setFilterPart] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('list');
  const [editingPassage, setEditingPassage] = useState<Passage | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedPassages, setSelectedPassages] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Form data for creating/editing passages
  const [formData, setFormData] = useState<PassageFormData>({
    part: 3,
    passage_type: 'single',
    texts: {
      title: '',
      content: '',
      content2: '',
      content3: '',
      img_url: '',
      img_url2: '',
      img_url3: ''
    },
    translation_vi: {
      content: '',
      content2: '',
      content3: ''
    },
    translation_en: {
      content: '',
      content2: '',
      content3: ''
    },
    audio_url: '',
    assets: {
      images: [],
      charts: []
    },
    meta: {
      topic: '',
      word_count: 0,
      reading_time: 0
    }
  });

  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchPassages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('passages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPassages((data || []).map((item: any) => ({
        ...item,
        texts: {
          title: item.texts?.title || '',
          content: item.texts?.content || '',
          content2: item.texts?.content2 || '',
          content3: item.texts?.content3 || '',
          img_url: item.image_url || item.texts?.img_url || '', // Backward compatibility
          img_url2: item.texts?.img_url2 || '',
          img_url3: item.texts?.img_url3 || ''
        },
        translation_vi: {
          content: item.translation_vi?.content || '',
          content2: item.translation_vi?.content2 || '',
          content3: item.translation_vi?.content3 || ''
        },
        translation_en: {
          content: item.translation_en?.content || '',
          content2: item.translation_en?.content2 || '',
          content3: item.translation_en?.content3 || ''
        }
      })) as Passage[]);
    } catch (error) {
      console.error('Error fetching passages:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đoạn văn',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PassageFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const calculateReadingTime = (wordCount: number) => {
    // Average reading speed: 200 words per minute
    return Math.ceil(wordCount / 200);
  };

  const handleContentChange = (content: string) => {
    const wordCount = calculateWordCount(content);
    const readingTime = calculateReadingTime(wordCount);
    
    handleFormChange('texts.content', content);
    handleFormChange('meta.word_count', wordCount);
    handleFormChange('meta.reading_time', readingTime);
  };

  const savePassage = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const passageData = {
        ...formData,
        created_by: user.id
      };

      if (editingPassage) {
        // Update existing passage
        const { error } = await supabase
          .from('passages')
          .update(passageData)
          .eq('id', editingPassage.id);

        if (error) throw error;

        toast({
          title: 'Thành công',
          description: 'Đã cập nhật đoạn văn',
        });
      } else {
        // Create new passage
        const { error } = await supabase
          .from('passages')
          .insert(passageData);

        if (error) throw error;

        toast({
          title: 'Thành công',
          description: 'Đã tạo đoạn văn mới',
        });
      }

      // Reset form
      setFormData({
        part: 3,
        passage_type: 'single',
        texts: { 
          title: '', 
          content: '', 
          content2: '', 
          content3: '',
          img_url: '',
          img_url2: '',
          img_url3: ''
        },
        translation_vi: { content: '', content2: '', content3: '' },
        translation_en: { content: '', content2: '', content3: '' },
        audio_url: '',
        assets: { images: [], charts: [] },
        meta: { topic: '', word_count: 0, reading_time: 0 }
      });
      setEditingPassage(null);
      setActiveTab('list');
      fetchPassages();

    } catch (error: unknown) {
      console.error('Error saving passage:', error);
      toast({
        title: 'Lỗi',
        description: (error as any)?.message || 'Không thể lưu đoạn văn',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePassage = async (passageId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đoạn văn này?')) return;

    try {
      console.log('🔍 DEBUG: Deleting single passage:', passageId);
      
      // Check if we have questions using this passage first
      const { data: questionsUsingPassage, error: checkError } = await supabase
        .from('questions')
        .select('id, prompt_text')
        .eq('passage_id', passageId);

      if (checkError) {
        console.error('Error checking questions:', checkError);
        throw new Error('Không thể kiểm tra câu hỏi liên quan');
      }

      if (questionsUsingPassage && questionsUsingPassage.length > 0) {
        toast({
          title: 'Lỗi',
          description: `Không thể xóa vì có ${questionsUsingPassage.length} câu hỏi đang sử dụng đoạn văn này. Vui lòng xóa câu hỏi trước.`,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('passages')
        .delete()
        .eq('id', passageId);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      toast({
        title: 'Thành công',
        description: 'Đã xóa đoạn văn',
      });

      fetchPassages();
    } catch (error: unknown) {
      console.error('Error deleting passage:', error);
      
      // Better error handling
      let errorMessage = 'Không thể xóa đoạn văn';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
        } else if (error.message.includes('connection')) {
          errorMessage = 'Lỗi kết nối đến server. Vui lòng thử lại sau.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const deleteSelectedPassages = async () => {
    if (selectedPassages.size === 0) return;
    
    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedPassages.size} đoạn văn đã chọn?`;
    if (!confirm(confirmMessage)) return;

    try {
      setDeleting(true);
      
      console.log('🔍 DEBUG: Deleting passages:', Array.from(selectedPassages));
      
      // Check if we have questions using these passages first
      const { data: questionsUsingPassages, error: checkError } = await supabase
        .from('questions')
        .select('id, prompt_text')
        .in('passage_id', Array.from(selectedPassages));

      if (checkError) {
        console.error('Error checking questions:', checkError);
        throw new Error('Không thể kiểm tra câu hỏi liên quan');
      }

      if (questionsUsingPassages && questionsUsingPassages.length > 0) {
        toast({
          title: 'Lỗi',
          description: `Không thể xóa vì có ${questionsUsingPassages.length} câu hỏi đang sử dụng các đoạn văn này. Vui lòng xóa câu hỏi trước.`,
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('passages')
        .delete()
        .in('id', Array.from(selectedPassages));

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      toast({
        title: 'Thành công',
        description: `Đã xóa ${selectedPassages.size} đoạn văn`,
      });

      setSelectedPassages(new Set());
      fetchPassages();
    } catch (error: unknown) {
      console.error('Error deleting passages:', error);
      
      // Better error handling
      let errorMessage = 'Không thể xóa các đoạn văn đã chọn';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
        } else if (error.message.includes('connection')) {
          errorMessage = 'Lỗi kết nối đến server. Vui lòng thử lại sau.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPassages.size === filteredPassages.length) {
      setSelectedPassages(new Set());
    } else {
      setSelectedPassages(new Set(filteredPassages.map(p => p.id)));
    }
  };

  const toggleSelectPassage = (passageId: string) => {
    const newSelected = new Set(selectedPassages);
    if (newSelected.has(passageId)) {
      newSelected.delete(passageId);
    } else {
      newSelected.add(passageId);
    }
    setSelectedPassages(newSelected);
  };

  const editPassage = (passage: Passage) => {
    setFormData({
      part: passage.part,
      passage_type: passage.passage_type,
      texts: {
        title: passage.texts?.title || '',
        content: passage.texts?.content || '',
        content2: passage.texts?.content2 || '',
        content3: passage.texts?.content3 || '',
        img_url: passage.texts?.img_url || '',
        img_url2: passage.texts?.img_url2 || '',
        img_url3: passage.texts?.img_url3 || ''
      },
      translation_vi: {
        content: passage.translation_vi?.content || '',
        content2: passage.translation_vi?.content2 || '',
        content3: passage.translation_vi?.content3 || ''
      },
      translation_en: {
        content: passage.translation_en?.content || '',
        content2: passage.translation_en?.content2 || '',
        content3: passage.translation_en?.content3 || ''
      },
      audio_url: passage.audio_url || '',
      assets: passage.assets || { images: [], charts: [] },
      meta: passage.meta
    });
    setEditingPassage(passage);
    setActiveTab('create');
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        part: 3,
        passage_type: 'single',
        title: 'Office Meeting',
        content: 'Woman: Good morning, everyone. Thank you for coming to today\'s meeting. We need to discuss the quarterly sales report and the upcoming product launch. Man: Yes, I have the sales figures here. Our revenue increased by 15% compared to last quarter. Woman: That\'s excellent news. What about the new product? Man: The launch is scheduled for next month, but we\'re still waiting for final approval from the marketing department.',
        audio_url: 'https://example.com/audio/part3-conversation1.mp3',
        img_url: 'https://example.com/images/office-meeting.jpg',
        topic: 'Business Meeting',
        word_count: 85,
        reading_time: 1
      },
      {
        part: 7,
        passage_type: 'triple',
        title: 'Company Newsletter',
        content: 'Company News: Our quarterly earnings report shows a 12% increase in revenue compared to the same period last year. The growth was driven primarily by our new product line and expanded market presence in Asia.',
        content2: 'Employee Spotlight: Sarah Johnson from the Marketing Department has been promoted to Senior Manager. Sarah has been with the company for five years and has consistently exceeded her performance targets.',
        content3: 'Upcoming Events: The annual company picnic will be held on Saturday, June 15th at Central Park. All employees and their families are invited to attend. Please RSVP by June 1st.',
        img_url: 'https://example.com/images/newsletter1.jpg',
        img_url2: 'https://example.com/images/employee-spotlight.jpg',
        img_url3: 'https://example.com/images/company-picnic.jpg',
        topic: 'Company Newsletter',
        word_count: 120,
        reading_time: 2
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Passages');
    XLSX.writeFile(wb, 'passages_template.xlsx');

    toast({
      title: 'Template downloaded',
      description: 'Đã tải template Excel cho passages',
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportProgress(0);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        try {
          // Validate required fields
          if (!row.part || !row.title || !row.content) {
            throw new Error(`Row ${i + 1}: Missing required fields (part, title, content)`);
          }

          // Validate part
          if (![3, 4, 6, 7].includes(parseInt(row.part))) {
            throw new Error(`Row ${i + 1}: Part must be 3, 4, 6, or 7`);
          }

          // Validate passage_type
          if (!['single', 'double', 'triple'].includes(row.passage_type)) {
            throw new Error(`Row ${i + 1}: Passage type must be single, double, or triple`);
          }

          // Calculate word count and reading time
          const wordCount = row.word_count || calculateWordCount(row.content);
          const readingTime = row.reading_time || calculateReadingTime(wordCount);

          const passageData = {
            part: parseInt(row.part),
            passage_type: row.passage_type || 'single',
            texts: {
              title: row.title.trim(),
              content: row.content.trim(),
              additional: row.additional?.trim() || ''
            },
            audio_url: row.audio_url?.trim() || null,
            image_url: row.image_url?.trim() || null,
            assets: {
              images: [],
              charts: []
            },
            meta: {
              topic: row.topic?.trim() || 'General',
              word_count: wordCount,
              reading_time: readingTime
            },
            created_by: user?.id
          };

          const { error } = await supabase
            .from('passages')
            .insert(passageData);

          if (error) throw error;

          successCount++;
        } catch (error: unknown) {
          console.error(`Error importing row ${i + 1}:`, error);
          errorCount++;
        }

        // Update progress
        setImportProgress(((i + 1) / jsonData.length) * 100);
      }

      toast({
        title: 'Import completed',
        description: `Successfully imported ${successCount} passages. ${errorCount} errors.`,
        variant: errorCount > 0 ? 'destructive' : 'default',
      });

      // Refresh passages list
      fetchPassages();

    } catch (error: unknown) {
      console.error('Error importing passages:', error);
      toast({
        title: 'Import failed',
        description: (error as any)?.message || 'Không thể import file Excel',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };


  const filteredPassages = passages.filter(passage => {
    const title = passage.texts?.title || '';
    const content = passage.texts?.content || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPart = filterPart === 'all' || passage.part.toString() === filterPart;
    return matchesSearch && matchesPart;
  });

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedPassages(new Set());
  }, [searchTerm, filterPart]);

  const getPartName = (part: number) => {
    const partNames: { [key: number]: string } = {
      3: 'Conversations',
      4: 'Talks', 
      6: 'Text Completion',
      7: 'Reading Comprehension'
    };
    return partNames[part] || `Part ${part}`;
  };

  const getPartColor = (part: number) => {
    const colors: { [key: number]: string } = {
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-green-100 text-green-800',
      6: 'bg-purple-100 text-purple-800',
      7: 'bg-orange-100 text-orange-800'
    };
    return colors[part] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý đoạn văn</h1>
        <p className="text-muted-foreground">
          Tạo và quản lý các đoạn văn cho Parts 3, 4, 6, 7
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Danh sách ({passages.length})
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingPassage ? 'Chỉnh sửa' : 'Tạo mới'}
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
                  <Button onClick={downloadTemplate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  <Button onClick={() => setActiveTab('import')} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                  <Button onClick={() => setActiveTab('create')}>
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterPart} onValueChange={setFilterPart}>
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
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2"
                    >
                      {selectedPassages.size === filteredPassages.length ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      {selectedPassages.size === filteredPassages.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </Button>
                    
                    {selectedPassages.size > 0 && (
                      <span className="text-sm text-gray-600">
                        Đã chọn {selectedPassages.size} đoạn văn
                      </span>
                    )}
                  </div>
                  
                  {selectedPassages.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedPassages}
                      disabled={deleting}
                      className="flex items-center gap-2"
                    >
                      <Trash className="h-4 w-4" />
                      {deleting ? 'Đang xóa...' : `Xóa ${selectedPassages.size} đoạn văn`}
                    </Button>
                  )}
                </div>
              )}

              {/* Passages List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Đang tải...</p>
                </div>
              ) : filteredPassages.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || filterPart !== 'all' 
                      ? 'Không tìm thấy đoạn văn nào' 
                      : 'Chưa có đoạn văn nào. Hãy tạo đoạn văn đầu tiên!'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPassages.map((passage) => (
                    <Card key={passage.id} className={`hover:shadow-md transition-shadow ${selectedPassages.has(passage.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center mt-1">
                              <Checkbox
                                checked={selectedPassages.has(passage.id)}
                                onCheckedChange={() => toggleSelectPassage(passage.id)}
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
                              {passage.texts?.title || 'No title'}
                            </h3>
                            
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {passage.texts?.content || 'No content'}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {passage.meta?.word_count || 0} từ
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {passage.meta?.reading_time || 0} phút
                              </div>
                              {passage.audio_url && (
                                <div className="flex items-center gap-1">
                                  <Headphones className="h-4 w-4" />
                                  Có audio
                                </div>
                              )}
                              {passage.texts?.img_url && (
                                <div className="flex items-center gap-1">
                                  <FileImage className="h-4 w-4" />
                                  Có ảnh
                                </div>
                              )}
                            </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editPassage(passage)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePassage(passage.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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
                {editingPassage ? 'Chỉnh sửa đoạn văn' : 'Tạo đoạn văn mới'}
              </CardTitle>
              <CardDescription>
                {editingPassage 
                  ? 'Cập nhật thông tin đoạn văn'
                  : 'Tạo đoạn văn cho Parts 3, 4, 6, 7'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Part</Label>
                  <Select 
                    value={formData.part.toString()} 
                    onValueChange={(value) => handleFormChange('part', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Part 3 - Conversations</SelectItem>
                      <SelectItem value="4">Part 4 - Talks</SelectItem>
                      <SelectItem value="6">Part 6 - Text Completion</SelectItem>
                      <SelectItem value="7">Part 7 - Reading Comprehension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Loại đoạn văn</Label>
                  <Select 
                    value={formData.passage_type} 
                    onValueChange={(value: 'single' | 'double' | 'triple') => handleFormChange('passage_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="triple">Triple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Tiêu đề đoạn văn</Label>
                <Input
                  value={formData.texts.title}
                  onChange={(e) => handleFormChange('texts.title', e.target.value)}
                  placeholder="Nhập tiêu đề đoạn văn..."
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>Nội dung đoạn văn 1</Label>
                <Textarea
                  value={formData.texts.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Nhập nội dung đoạn văn 1..."
                  rows={8}
                  className="resize-none"
                />
                <div className="text-sm text-muted-foreground">
                  {formData.meta?.word_count || 0} từ • {formData.meta?.reading_time || 0} phút đọc
                </div>
              </div>

              {/* Additional Content for Double Passages */}
              {formData.passage_type === 'double' && (
                <div className="space-y-2">
                  <Label>Nội dung đoạn văn 2</Label>
                  <Textarea
                    value={formData.texts.content2 || ''}
                    onChange={(e) => handleFormChange('texts.content2', e.target.value)}
                    placeholder="Nhập nội dung đoạn văn 2..."
                    rows={8}
                    className="resize-none"
                  />
                </div>
              )}

              {/* Triple Passages - 3 separate content fields */}
              {formData.passage_type === 'triple' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nội dung đoạn văn 2</Label>
                    <Textarea
                      value={formData.texts.content2 || ''}
                      onChange={(e) => handleFormChange('texts.content2', e.target.value)}
                      placeholder="Nhập nội dung đoạn văn 2..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nội dung đoạn văn 3</Label>
                    <Textarea
                      value={formData.texts.content3 || ''}
                      onChange={(e) => handleFormChange('texts.content3', e.target.value)}
                      placeholder="Nhập nội dung đoạn văn 3..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Image URLs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ảnh đoạn văn 1 (tùy chọn)</Label>
                  <Input
                    value={formData.texts.img_url || ''}
                    onChange={(e) => handleFormChange('texts.img_url', e.target.value)}
                    placeholder="https://example.com/image1.jpg"
                  />
                </div>

                {(formData.passage_type === 'double' || formData.passage_type === 'triple') && (
                  <div className="space-y-2">
                    <Label>Ảnh đoạn văn 2 (tùy chọn)</Label>
                    <Input
                      value={formData.texts.img_url2 || ''}
                      onChange={(e) => handleFormChange('texts.img_url2', e.target.value)}
                      placeholder="https://example.com/image2.jpg"
                    />
                  </div>
                )}

                {formData.passage_type === 'triple' && (
                  <div className="space-y-2">
                    <Label>Ảnh đoạn văn 3 (tùy chọn)</Label>
                    <Input
                      value={formData.texts.img_url3 || ''}
                      onChange={(e) => handleFormChange('texts.img_url3', e.target.value)}
                      placeholder="https://example.com/image3.jpg"
                    />
                  </div>
                )}
              </div>

              {/* Translation Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bản dịch tiếng Việt - Đoạn 1 (tùy chọn)</Label>
                    <Textarea
                      value={formData.translation_vi?.content || ''}
                      onChange={(e) => handleFormChange('translation_vi.content', e.target.value)}
                      placeholder="Nhập bản dịch tiếng Việt cho đoạn 1..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bản dịch tiếng Anh - Đoạn 1 (tùy chọn)</Label>
                    <Textarea
                      value={formData.translation_en?.content || ''}
                      onChange={(e) => handleFormChange('translation_en.content', e.target.value)}
                      placeholder="Enter English translation for passage 1..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Translation for Double Passages */}
                {formData.passage_type === 'double' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bản dịch tiếng Việt - Đoạn 2 (tùy chọn)</Label>
                      <Textarea
                        value={formData.translation_vi?.content2 || ''}
                        onChange={(e) => handleFormChange('translation_vi.content2', e.target.value)}
                        placeholder="Nhập bản dịch tiếng Việt cho đoạn 2..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bản dịch tiếng Anh - Đoạn 2 (tùy chọn)</Label>
                      <Textarea
                        value={formData.translation_en?.content2 || ''}
                        onChange={(e) => handleFormChange('translation_en.content2', e.target.value)}
                        placeholder="Enter English translation for passage 2..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Translation for Triple Passages */}
                {formData.passage_type === 'triple' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bản dịch tiếng Việt - Đoạn 2 (tùy chọn)</Label>
                        <Textarea
                          value={formData.translation_vi?.content2 || ''}
                          onChange={(e) => handleFormChange('translation_vi.content2', e.target.value)}
                          placeholder="Nhập bản dịch tiếng Việt cho đoạn 2..."
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bản dịch tiếng Anh - Đoạn 2 (tùy chọn)</Label>
                        <Textarea
                          value={formData.translation_en?.content2 || ''}
                          onChange={(e) => handleFormChange('translation_en.content2', e.target.value)}
                          placeholder="Enter English translation for passage 2..."
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bản dịch tiếng Việt - Đoạn 3 (tùy chọn)</Label>
                        <Textarea
                          value={formData.translation_vi?.content3 || ''}
                          onChange={(e) => handleFormChange('translation_vi.content3', e.target.value)}
                          placeholder="Nhập bản dịch tiếng Việt cho đoạn 3..."
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bản dịch tiếng Anh - Đoạn 3 (tùy chọn)</Label>
                        <Textarea
                          value={formData.translation_en?.content3 || ''}
                          onChange={(e) => handleFormChange('translation_en.content3', e.target.value)}
                          placeholder="Enter English translation for passage 3..."
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Audio URL */}
              <div className="space-y-2">
                <Label>Audio URL (tùy chọn)</Label>
                <Input
                  value={formData.audio_url}
                  onChange={(e) => handleFormChange('audio_url', e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chủ đề</Label>
                  <Input
                    value={formData.meta?.topic || ''}
                    onChange={(e) => handleFormChange('meta.topic', e.target.value)}
                    placeholder="Ví dụ: Business, Travel, Education..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Thời gian đọc (phút)</Label>
                  <Input
                    type="number"
                    value={formData.meta?.reading_time || 0}
                    onChange={(e) => handleFormChange('meta.reading_time', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={savePassage} 
                  disabled={saving || !formData.texts.title || !formData.texts.content}
                  className="flex-1"
                >
                  {saving ? 'Đang lưu...' : (editingPassage ? 'Cập nhật' : 'Tạo đoạn văn')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActiveTab('list');
                    setEditingPassage(null);
                    setFormData({
                      part: 3,
                      passage_type: 'single',
                      texts: { 
                        title: '', 
                        content: '', 
                        content2: '', 
                        content3: '',
                        img_url: '',
                        img_url2: '',
                        img_url3: ''
                      },
                      translation_vi: { content: '', content2: '', content3: '' },
                      translation_en: { content: '', content2: '', content3: '' },
                      audio_url: '',
                      assets: { images: [], charts: [] },
                      meta: { topic: '', word_count: 0, reading_time: 0 }
                    });
                  }}
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Passages từ Excel
              </CardTitle>
              <CardDescription>
                Upload file Excel để import nhiều passages cùng lúc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Download Template */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Bước 1: Tải template</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Tải file template Excel với định dạng chuẩn để import passages
                </p>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Tải template Excel
                </Button>
              </div>

              {/* Upload File */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium mb-2">Bước 2: Upload file Excel</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Chọn file Excel đã điền thông tin passages
                </p>
                
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={importing}
                    className="cursor-pointer"
                  />
                  
                  {importing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">Đang import...</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(importProgress)}% hoàn thành
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">Hướng dẫn sử dụng</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>part:</strong> Phần thi (3, 4, 6, 7)</li>
                  <li>• <strong>passage_type:</strong> Loại đoạn văn (single, double, triple)</li>
                  <li>• <strong>title:</strong> Tiêu đề đoạn văn</li>
                  <li>• <strong>content:</strong> Nội dung chính</li>
                  <li>• <strong>additional:</strong> Nội dung bổ sung (tùy chọn)</li>
                  <li>• <strong>audio_url:</strong> Link audio (tùy chọn)</li>
                  <li>• <strong>image_url:</strong> Link ảnh minh họa (tùy chọn)</li>
                  <li>• <strong>topic:</strong> Chủ đề (tùy chọn)</li>
                  <li>• <strong>word_count:</strong> Số từ (tự động tính nếu để trống)</li>
                  <li>• <strong>reading_time:</strong> Thời gian đọc (tự động tính nếu để trống)</li>
                </ul>
              </div>

              {/* Example */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Ví dụ dữ liệu</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>part:</strong> 3</p>
                  <p><strong>passage_type:</strong> single</p>
                  <p><strong>title:</strong> Office Meeting</p>
                  <p><strong>content:</strong> Woman: Good morning, everyone...</p>
                  <p><strong>audio_url:</strong> https://example.com/audio.mp3</p>
                  <p><strong>image_url:</strong> https://example.com/image.jpg</p>
                  <p><strong>topic:</strong> Business Meeting</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PassageManager;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Plus, 
  Save, 
  Eye, 
  Copy, 
  Trash2, 
  Upload, 
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface QuestionTemplate {
  id: string;
  name: string;
  type: 'vocab' | 'grammar' | 'listening' | 'reading';
  difficulty: 'easy' | 'medium' | 'hard';
  template: {
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
    tags: string[];
  };
  usageCount: number;
  createdAt: string;
}

interface OptimizedQuestionCreatorProps {
  onQuestionCreated?: (question: any) => void;
  className?: string;
}

const OptimizedQuestionCreator: React.FC<OptimizedQuestionCreatorProps> = ({
  onQuestionCreated,
  className = ''
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Form state with auto-save
  const [formData, setFormData] = useState({
    type: 'vocab' as const,
    difficulty: 'medium' as const,
    question: '',
    choices: ['', '', '', ''],
    answer: 'A',
    explanation: '',
    tags: [] as string[],
    audio_url: '',
    transcript: ''
  });

  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.question.trim() || formData.choices.some(c => c.trim())) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveDraft = async () => {
    if (!user) return;

    try {
      const draftData = {
        user_id: user.id,
        form_data: formData,
        updated_at: new Date().toISOString()
      };

      if (draftId) {
        await supabase
          .from('question_drafts')
          .update(draftData)
          .eq('id', draftId);
      } else {
        const { data, error } = await supabase
          .from('question_drafts')
          .insert(draftData)
          .select()
          .single();

        if (error) throw error;
        setDraftId(data.id);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const loadTemplate = (template: QuestionTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      type: template.type,
      question: template.template.question,
      choices: [...template.template.choices],
      answer: template.template.answer,
      explanation: template.template.explanation,
      tags: [...template.template.tags],
      audio_url: '',
      transcript: ''
    });
  };

  const createFromTemplate = () => {
    if (!selectedTemplate) return;

    // Increment usage count
    supabase
      .from('question_templates')
      .update({ usage_count: selectedTemplate.usageCount + 1 })
      .eq('id', selectedTemplate.id);

    toast({
      title: "Template loaded",
      description: `Using template: ${selectedTemplate.name}`,
    });
  };

  const saveAsTemplate = async () => {
    if (!formData.question.trim()) {
      toast({
        title: "Error",
        description: "Question text is required to save as template",
        variant: "destructive",
      });
      return;
    }

    try {
      const templateData = {
        name: `Template ${Date.now()}`,
        type: formData.type,
        template: {
          question: formData.question,
          choices: formData.choices,
          answer: formData.answer,
          explanation: formData.explanation,
          tags: formData.tags
        },
        usage_count: 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('question_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Template saved",
        description: "Question saved as template successfully",
      });

      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createQuestion = async () => {
    if (!user) return;

    // Validation
    if (!formData.question.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.choices.filter(c => c.trim()).length < 2) {
      toast({
        title: "Validation Error",
        description: "At least 2 choices are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          type: formData.type,
          question: formData.question.trim(),
          choices: formData.choices.filter(c => c.trim()),
          answer: formData.answer,
          explain_vi: formData.explanation.trim(),
          explain_en: formData.explanation.trim(),
          audio_url: formData.audio_url || null,
          transcript: formData.transcript?.trim() || null,
          tags: formData.tags
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question created successfully",
      });

      // Clear form
      setFormData({
        type: 'vocab',
        question: '',
        choices: ['', '', '', ''],
        answer: 'A',
        explanation: '',
        tags: [],
        audio_url: '',
        transcript: ''
      });

      // Clear draft
      if (draftId) {
        await supabase
          .from('question_drafts')
          .delete()
          .eq('id', draftId);
        setDraftId(null);
      }

      onQuestionCreated?.(data);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.template.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Optimized Question Creator
          </CardTitle>
          <CardDescription>
            Create TOEIC questions efficiently with templates and auto-save
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Question</TabsTrigger>
              <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              {/* Auto-save indicator */}
              {lastSaved && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </AlertDescription>
                </Alert>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveDraft}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveAsTemplate}
                  disabled={!formData.question.trim()}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Preview functionality
                    console.log('Preview question:', formData);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Question Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vocab">Vocabulary</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="listening">Listening</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question text..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Answer Choices</Label>
                <div className="space-y-2">
                  {formData.choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Label className="w-8 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </Label>
                      <Input
                        value={choice}
                        onChange={(e) => {
                          const newChoices = [...formData.choices];
                          newChoices[index] = e.target.value;
                          setFormData(prev => ({ ...prev, choices: newChoices }));
                        }}
                        placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                      />
                      {formData.choices.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newChoices = formData.choices.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, choices: newChoices }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.choices.length < 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, choices: [...prev.choices, ''] }));
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Choice
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="answer">Correct Answer</Label>
                <Select 
                  value={formData.answer} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, answer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.choices.map((_, index) => (
                      <SelectItem key={index} value={String.fromCharCode(65 + index)}>
                        {String.fromCharCode(65 + index)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Enter explanation..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={createQuestion}
                  disabled={saving || !formData.question.trim()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Question
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vocab">Vocabulary</SelectItem>
                    <SelectItem value="grammar">Grammar</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {template.type}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {template.usageCount} uses
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.template.question}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => loadTemplate(template)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            loadTemplate(template);
                            setActiveTab('create');
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found matching your criteria
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedQuestionCreator;

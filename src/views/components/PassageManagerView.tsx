import React, { useState } from 'react';
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
  Trash,
  Loader2
} from 'lucide-react';
import { PassageManagerController, Passage, PassageFormData, PassageFilters } from '@/controllers/passage/PassageManagerController';

interface PassageManagerViewProps {
  controller: PassageManagerController;
  state: {
    passages: Passage[];
    filteredPassages: Passage[];
    selectedPassages: Set<string>;
    editingPassage: Passage | null;
    formData: PassageFormData;
    loading: boolean;
    saving: boolean;
    deleting: boolean;
    importing: boolean;
    importProgress: number;
    error: string | null;
    activeTab: 'list' | 'create' | 'edit' | 'import';
  };
  onLoadPassages: () => void;
  onCreatePassage: (data: PassageFormData) => void;
  onUpdatePassage: (id: string, data: Partial<PassageFormData>) => void;
  onDeletePassage: (id: string) => void;
  onDeleteSelectedPassages: () => void;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSetEditingPassage: (passage: Passage | null) => void;
  onSetFormData: (data: Partial<PassageFormData>) => void;
  onApplyFilters: (filters: PassageFilters) => void;
  onUploadAudio: (file: File) => void;
  onUploadImage: (file: File) => void;
  onImportFromExcel: (file: File) => void;
  onExportToExcel: () => void;
  onSetActiveTab: (tab: 'list' | 'create' | 'edit' | 'import') => void;
  onClearError: () => void;
}

export const PassageManagerView: React.FC<PassageManagerViewProps> = ({
  controller,
  state,
  onLoadPassages,
  onCreatePassage,
  onUpdatePassage,
  onDeletePassage,
  onDeleteSelectedPassages,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onSetEditingPassage,
  onSetFormData,
  onApplyFilters,
  onUploadAudio,
  onUploadImage,
  onImportFromExcel,
  onExportToExcel,
  onSetActiveTab,
  onClearError
}) => {
  const [filters, setFilters] = useState<PassageFilters>({
    searchTerm: '',
    filterPart: 'all',
    filterType: 'all',
    filterTopic: ''
  });

  const {
    passages,
    filteredPassages,
    selectedPassages,
    editingPassage,
    formData,
    loading,
    saving,
    deleting,
    importing,
    importProgress,
    error,
    activeTab
  } = state;

  // Event Handlers
  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, searchTerm: value };
    setFilters(newFilters);
    onApplyFilters(newFilters);
  };

  const handleFilterChange = (key: keyof PassageFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onApplyFilters(newFilters);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPassage) {
      onUpdatePassage(editingPassage.id, formData);
    } else {
      onCreatePassage(formData);
    }
  };

  const handleFileUpload = (type: 'audio' | 'image', file: File) => {
    if (type === 'audio') {
      onUploadAudio(file);
    } else {
      onUploadImage(file);
    }
  };

  const handleImportFile = (file: File) => {
    onImportFromExcel(file);
  };

  // Render Methods
  const renderError = () => (
    error && (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
        <Button size="sm" variant="outline" onClick={onClearError} className="mt-2">
          Dismiss
        </Button>
      </Alert>
    )
  );

  const renderFilters = () => (
    <Card className="mb-6">
            <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
            </CardHeader>
            <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
                  <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                id="search"
                placeholder="Search passages..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
          
          <div>
            <Label htmlFor="part">Part</Label>
            <Select value={filters.filterPart} onValueChange={(value) => handleFilterChange('filterPart', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Parts" />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="all">All Parts</SelectItem>
                <SelectItem value="1">Part 1: Photos</SelectItem>
                <SelectItem value="2">Part 2: Question-Response</SelectItem>
                <SelectItem value="3">Part 3: Conversations</SelectItem>
                <SelectItem value="4">Part 4: Talks</SelectItem>
                <SelectItem value="5">Part 5: Incomplete Sentences</SelectItem>
                <SelectItem value="6">Part 6: Text Completion</SelectItem>
                <SelectItem value="7">Part 7: Reading Comprehension</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={filters.filterType} onValueChange={(value) => handleFilterChange('filterType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="triple">Triple</SelectItem>
              </SelectContent>
            </Select>
                  </div>
                  
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="Filter by topic..."
              value={filters.filterTopic}
              onChange={(e) => handleFilterChange('filterTopic', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPassageList = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Passages ({filteredPassages.length})</CardTitle>
            <CardDescription>
              Manage TOEIC reading and listening passages
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSelectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={onClearSelection} variant="outline" size="sm">
              Clear
            </Button>
            {selectedPassages.size > 0 && (
              <Button onClick={onDeleteSelectedPassages} variant="destructive" size="sm" disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Selected ({selectedPassages.size})
                    </Button>
                  )}
                </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading passages...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPassages.map((passage) => (
              <div key={passage.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                              <Checkbox
                      checked={selectedPassages.has(passage.id)}
                      onCheckedChange={() => onToggleSelection(passage.id)}
                              />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Part {passage.part}</Badge>
                        <Badge variant="outline">{passage.passage_type}</Badge>
                        <Badge variant="outline">{passage.meta.topic}</Badge>
                              </div>
                      <h3 className="font-medium text-lg mb-2">{passage.texts.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                                {passage.texts.content}
                              </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {passage.meta.word_count} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(passage.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {passage.created_by}
                        </span>
                              </div>
                            </div>
                          </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => onSetEditingPassage(passage)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                            </Button>
                    <Button size="sm" variant="outline" onClick={() => onDeletePassage(passage.id)}>
                      <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
              </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
  );

  const renderPassageForm = () => (
          <Card>
            <CardHeader>
              <CardTitle>
          {editingPassage ? 'Edit Passage' : 'Create New Passage'}
              </CardTitle>
              <CardDescription>
          {editingPassage ? 'Update passage information' : 'Add a new TOEIC passage'}
              </CardDescription>
            </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part">Part</Label>
                  <Select
                value={formData.part.toString()} 
                onValueChange={(value) => onSetFormData({ part: parseInt(value) })}
                  >
                    <SelectTrigger>
                  <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="1">Part 1: Photos</SelectItem>
                  <SelectItem value="2">Part 2: Question-Response</SelectItem>
                  <SelectItem value="3">Part 3: Conversations</SelectItem>
                  <SelectItem value="4">Part 4: Talks</SelectItem>
                  <SelectItem value="5">Part 5: Incomplete Sentences</SelectItem>
                  <SelectItem value="6">Part 6: Text Completion</SelectItem>
                  <SelectItem value="7">Part 7: Reading Comprehension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
              <Label htmlFor="type">Passage Type</Label>
                  <Select
                value={formData.passage_type} 
                onValueChange={(value: 'single' | 'double' | 'triple') => onSetFormData({ passage_type: value })}
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

              <div>
            <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
              value={formData.texts.title}
              onChange={(e) => onSetFormData({ 
                texts: { ...formData.texts, title: e.target.value }
              })}
              placeholder="Enter passage title..."
                />
              </div>

              <div>
            <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
              value={formData.texts.content}
              onChange={(e) => onSetFormData({ 
                texts: { ...formData.texts, content: e.target.value }
              })}
              placeholder="Enter passage content..."
              rows={6}
            />
              </div>

              <div>
            <Label htmlFor="additional">Additional Information</Label>
                <Textarea
                  id="additional"
              value={formData.texts.additional}
              onChange={(e) => onSetFormData({ 
                texts: { ...formData.texts, additional: e.target.value }
              })}
              placeholder="Enter additional information..."
              rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
              <Label htmlFor="topic">Topic</Label>
                  <Input
                id="topic"
                value={formData.meta.topic}
                onChange={(e) => onSetFormData({ 
                  meta: { ...formData.meta, topic: e.target.value }
                })}
                placeholder="Enter topic..."
                  />
                </div>

                <div>
              <Label htmlFor="wordCount">Word Count</Label>
                  <Input
                id="wordCount"
                type="number"
                value={formData.meta.word_count}
                onChange={(e) => onSetFormData({ 
                  meta: { ...formData.meta, word_count: parseInt(e.target.value) || 0 }
                })}
                placeholder="Enter word count..."
                  />
                </div>
              </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onSetActiveTab('list')}>
              Cancel
                </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingPassage ? 'Update Passage' : 'Create Passage'}
                </Button>
              </div>
        </form>
            </CardContent>
          </Card>
  );

  const renderImportTab = () => (
          <Card>
            <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Passages
        </CardTitle>
              <CardDescription>
          Import passages from Excel file
              </CardDescription>
            </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="import-file" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500">
                  Click to upload Excel file
                </span>
              </label>
              <input
                id="import-file"
                  type="file"
                  accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                }}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Excel files (.xlsx, .xls) up to 50MB
            </p>
              </div>

          {importing && (
                <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing...</span>
                <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
                  </div>
                </div>
              )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onExportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="outline" onClick={() => onSetActiveTab('list')}>
              Back to List
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Passage Manager</h1>
        <p className="text-gray-600 mt-2">Manage TOEIC reading and listening passages</p>
      </div>

      {renderError()}

      <Tabs value={activeTab} onValueChange={(value) => onSetActiveTab(value as unknown)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Passages</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {renderFilters()}
          {renderPassageList()}
        </TabsContent>

        <TabsContent value="create">
          {renderPassageForm()}
        </TabsContent>

        <TabsContent value="edit">
          {editingPassage ? renderPassageForm() : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Select a passage to edit</p>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="import">
          {renderImportTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
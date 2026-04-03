// Mock services for now
const mockPassageService = {
  getPassages: async () => [],
  createPassage: async (data: any) => ({ id: '1', ...data }),
  updatePassage: async (id: string, data: any) => ({ id, ...data }),
  deletePassage: async (id: string) => {}
};

const mockFileService = {
  uploadAudio: async (file: File) => 'mock-audio-url',
  uploadImage: async (file: File) => 'mock-image-url'
};

import { TOEICPart, PassageType } from '@/types';
import * as XLSX from 'xlsx';

export interface Passage {
  id: string;
  part: number;
  passage_type: 'single' | 'double' | 'triple';
  texts: {
    title: string;
    content: string;
    additional: string;
  };
  audio_url?: string;
  image_url?: string;
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

export interface PassageFormData {
  part: number;
  passage_type: 'single' | 'double' | 'triple';
  texts: {
    title: string;
    content: string;
    additional: string;
  };
  audio_url: string;
  image_url: string;
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

export interface PassageFilters {
  searchTerm: string;
  filterPart: string;
  filterType: string;
  filterTopic: string;
}

export interface PassageManagerState {
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
}

export class PassageManagerController {
  private passageService: any;
  private fileService: any;
  private state: PassageManagerState;

  constructor() {
    this.passageService = mockPassageService;
    this.fileService = mockFileService;
    this.state = this.getInitialState();
  }

  // Initial State
  private getInitialState(): PassageManagerState {
    return {
      passages: [],
      filteredPassages: [],
      selectedPassages: new Set(),
      editingPassage: null,
      formData: this.getEmptyFormData(),
      loading: false,
      saving: false,
      deleting: false,
      importing: false,
      importProgress: 0,
      error: null,
      activeTab: 'list'
    };
  }

  // State Management
  getState(): PassageManagerState {
    return { ...this.state };
  }

  updateState(updates: Partial<PassageManagerState>): void {
    this.state = { ...this.state, ...updates };
  }

  // Passage Management
  async loadPassages(): Promise<Passage[]> {
    try {
      this.updateState({ loading: true, error: null });

      const passages = await this.passageService.getPassages();
      
      this.updateState({ 
        loading: false, 
        passages,
        filteredPassages: passages
      });

      return passages;
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  async createPassage(data: PassageFormData): Promise<Passage> {
    try {
      this.updateState({ saving: true, error: null });

      const passage = await this.passageService.createPassage(data);
      
      // Add to local state
      const newPassages = [...this.state.passages, passage];
      this.updateState({ 
        saving: false, 
        passages: newPassages,
        filteredPassages: this.filterPassages(newPassages, this.getCurrentFilters()),
        formData: this.getEmptyFormData(),
        activeTab: 'list'
      });

      return passage;
    } catch (error: any) {
      this.updateState({ 
        saving: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  async updatePassage(id: string, data: Partial<PassageFormData>): Promise<Passage> {
    try {
      this.updateState({ saving: true, error: null });

      const passage = await this.passageService.updatePassage(id, data);
      
      // Update local state
      const updatedPassages = this.state.passages.map(p => 
        p.id === id ? passage : p
      );
      this.updateState({ 
        saving: false, 
        passages: updatedPassages,
        filteredPassages: this.filterPassages(updatedPassages, this.getCurrentFilters()),
        editingPassage: null,
        activeTab: 'list'
      });

      return passage;
    } catch (error: any) {
      this.updateState({ 
        saving: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  async deletePassage(id: string): Promise<void> {
    try {
      this.updateState({ deleting: true, error: null });

      await this.passageService.deletePassage(id);
      
      // Remove from local state
      const filteredPassages = this.state.passages.filter(p => p.id !== id);
      this.updateState({ 
        deleting: false, 
        passages: filteredPassages,
        filteredPassages: this.filterPassages(filteredPassages, this.getCurrentFilters())
      });
    } catch (error: any) {
      this.updateState({ 
        deleting: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  async deleteSelectedPassages(): Promise<void> {
    try {
      this.updateState({ deleting: true, error: null });

      const deletePromises = Array.from(this.state.selectedPassages).map(id =>
        this.passageService.deletePassage(id)
      );

      await Promise.all(deletePromises);
      
      // Remove from local state
      const filteredPassages = this.state.passages.filter(p => 
        !this.state.selectedPassages.has(p.id)
      );
      this.updateState({ 
        deleting: false, 
        passages: filteredPassages,
        filteredPassages: this.filterPassages(filteredPassages, this.getCurrentFilters()),
        selectedPassages: new Set()
      });
    } catch (error: any) {
      this.updateState({ 
        deleting: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  // Filtering and Search
  filterPassages(passages: Passage[], filters: PassageFilters): Passage[] {
    return passages.filter(passage => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          passage.texts.title.toLowerCase().includes(searchLower) ||
          passage.texts.content.toLowerCase().includes(searchLower) ||
          passage.meta.topic.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Part filter
      if (filters.filterPart !== 'all') {
        if (passage.part.toString() !== filters.filterPart) return false;
      }

      // Type filter
      if (filters.filterType !== 'all') {
        if (passage.passage_type !== filters.filterType) return false;
      }

      // Topic filter
      if (filters.filterTopic) {
        if (!passage.meta.topic.toLowerCase().includes(filters.filterTopic.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  applyFilters(filters: PassageFilters): void {
    const filteredPassages = this.filterPassages(this.state.passages, filters);
    this.updateState({ filteredPassages });
  }

  getCurrentFilters(): PassageFilters {
    return {
      searchTerm: '',
      filterPart: 'all',
      filterType: 'all',
      filterTopic: ''
    };
  }

  // Selection Management
  togglePassageSelection(id: string): void {
    const newSelected = new Set(this.state.selectedPassages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    this.updateState({ selectedPassages: newSelected });
  }

  selectAllPassages(): void {
    const allIds = new Set(this.state.filteredPassages.map(p => p.id));
    this.updateState({ selectedPassages: allIds });
  }

  clearSelection(): void {
    this.updateState({ selectedPassages: new Set() });
  }

  // Form Management
  getEmptyFormData(): PassageFormData {
    return {
        part: 3,
        passage_type: 'single',
        texts: {
          title: '',
          content: '',
          additional: ''
        },
        audio_url: '',
        image_url: '',
        assets: {
          images: [],
          charts: []
        },
        meta: {
          topic: '',
          word_count: 0,
          reading_time: 0
        }
    };
  }

  setFormData(data: Partial<PassageFormData>): void {
    this.updateState({ 
      formData: { ...this.state.formData, ...data }
    });
  }

  setEditingPassage(passage: Passage | null): void {
    if (passage) {
      this.updateState({ 
        editingPassage: passage,
      formData: {
        part: passage.part,
        passage_type: passage.passage_type,
          texts: { ...passage.texts },
        audio_url: passage.audio_url || '',
        image_url: passage.image_url || '',
        assets: passage.assets || { images: [], charts: [] },
          meta: { ...passage.meta }
        },
        activeTab: 'edit'
      });
    } else {
      this.updateState({ 
        editingPassage: null,
        formData: this.getEmptyFormData(),
        activeTab: 'list'
      });
    }
  }

  // File Upload
  async uploadAudio(file: File): Promise<string> {
    try {
      const audioUrl = await this.fileService.uploadAudio(file);
      this.setFormData({ audio_url: audioUrl });
      return audioUrl;
    } catch (error: any) {
      this.updateState({ error: error?.message || 'An error occurred' });
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const imageUrl = await this.fileService.uploadImage(file);
      this.setFormData({ image_url: imageUrl });
      return imageUrl;
    } catch (error: any) {
      this.updateState({ error: error?.message || 'An error occurred' });
      throw error;
    }
  }

  // Import/Export
  async importFromExcel(file: File): Promise<void> {
    try {
      this.updateState({ importing: true, importProgress: 0, error: null });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const passages: PassageFormData[] = [];
      
      // Skip header row
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as unknown[];
        if (row.length === 0) continue;

        const passage: PassageFormData = {
          part: parseInt(String(row[0])) || 3,
          passage_type: (row[1] as 'single' | 'double' | 'triple') || 'single',
          texts: {
            title: String(row[2] || ''),
            content: String(row[3] || ''),
            additional: String(row[4] || '')
          },
          audio_url: String(row[5] || ''),
          image_url: String(row[6] || ''),
          assets: {
            images: row[7] ? String(row[7]).split(',').map((img: string) => img.trim()) : [],
            charts: row[8] ? String(row[8]).split(',').map((chart: string) => chart.trim()) : []
          },
          meta: {
            topic: String(row[9] || ''),
            word_count: parseInt(String(row[10])) || 0,
            reading_time: parseInt(String(row[11])) || 0
          }
        };

        passages.push(passage);
      }

      // Import passages
      for (let i = 0; i < passages.length; i++) {
        try {
          await this.createPassage(passages[i]);
        } catch (error: any) {
          console.error(`Failed to import passage ${i + 1}:`, error);
        }

        this.updateState({ 
          importProgress: Math.round(((i + 1) / passages.length) * 100)
        });
      }

      this.updateState({ importing: false, importProgress: 100 });
    } catch (error: any) {
      this.updateState({ 
        importing: false, 
        importProgress: 0,
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  exportToExcel(): void {
    const data = this.state.passages.map(passage => [
      passage.part,
      passage.passage_type,
      passage.texts.title,
      passage.texts.content,
      passage.texts.additional,
      passage.audio_url || '',
      passage.image_url || '',
      passage.assets?.images.join(',') || '',
      passage.assets?.charts.join(',') || '',
      passage.meta.topic,
      passage.meta.word_count,
      passage.meta.reading_time
    ]);

    const headers = [
      'Part', 'Type', 'Title', 'Content', 'Additional', 
      'Audio URL', 'Image URL', 'Images', 'Charts', 
      'Topic', 'Word Count', 'Reading Time'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Passages');
    XLSX.writeFile(workbook, 'passages_export.xlsx');
  }

  // Utility Methods
  calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadingTime(wordCount: number): number {
    // Average reading speed: 200 words per minute
    return Math.ceil(wordCount / 200);
  }

  getPartInfo(part: number) {
    const partInfo = {
      1: { name: 'Photos', description: 'Mô tả hình ảnh', type: 'listening' },
      2: { name: 'Question-Response', description: 'Hỏi đáp ngắn', type: 'listening' },
      3: { name: 'Conversations', description: 'Hội thoại ngắn', type: 'listening' },
      4: { name: 'Talks', description: 'Bài nói dài', type: 'listening' },
      5: { name: 'Incomplete Sentences', description: 'Hoàn thành câu', type: 'reading' },
      6: { name: 'Text Completion', description: 'Hoàn thành đoạn văn', type: 'reading' },
      7: { name: 'Reading Comprehension', description: 'Đọc hiểu', type: 'reading' }
    };
    return partInfo[part] || { name: 'Unknown', description: '', type: 'unknown' };
  }

  // Tab Management
  setActiveTab(tab: 'list' | 'create' | 'edit' | 'import'): void {
    this.updateState({ activeTab: tab });
  }

  // Error Management
  clearError(): void {
    this.updateState({ error: null });
  }

  resetState(): void {
    this.state = this.getInitialState();
  }
}
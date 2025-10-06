/**
 * PassageManagerController
 * Business logic cho Passage Management
 * Extracted từ PassageManager.tsx
 */

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

export interface PassageManagerState {
  passages: Passage[];
  loading: boolean;
  searchTerm: string;
  filterPart: string;
  activeTab: string;
  editingPassage: Passage | null;
  saving: boolean;
  importing: boolean;
  importProgress: number;
  selectedPassages: Set<string>;
  deleting: boolean;
  formData: PassageFormData;
}

export class PassageManagerController {
  private state: PassageManagerState;
  private listeners: Array<(state: PassageManagerState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): PassageManagerState {
    return {
      passages: [],
      loading: false,
      searchTerm: '',
      filterPart: 'all',
      activeTab: 'list',
      editingPassage: null,
      saving: false,
      importing: false,
      importProgress: 0,
      selectedPassages: new Set(),
      deleting: false,
      formData: {
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
      }
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: PassageManagerState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update state
   */
  private setState(updates: Partial<PassageManagerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): PassageManagerState {
    return { ...this.state };
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set passages data
   */
  public setPassages(passages: Passage[]): void {
    this.setState({ passages });
  }

  /**
   * Set search term
   */
  public setSearchTerm(searchTerm: string): void {
    this.setState({ searchTerm });
  }

  /**
   * Set filter part
   */
  public setFilterPart(filterPart: string): void {
    this.setState({ filterPart });
  }

  /**
   * Set active tab
   */
  public setActiveTab(activeTab: string): void {
    this.setState({ activeTab });
  }

  /**
   * Set editing passage
   */
  public setEditingPassage(passage: Passage | null): void {
    this.setState({ editingPassage: passage });
  }

  /**
   * Set saving state
   */
  public setSaving(saving: boolean): void {
    this.setState({ saving });
  }

  /**
   * Set importing state
   */
  public setImporting(importing: boolean): void {
    this.setState({ importing });
  }

  /**
   * Set import progress
   */
  public setImportProgress(progress: number): void {
    this.setState({ importProgress: progress });
  }

  /**
   * Set deleting state
   */
  public setDeleting(deleting: boolean): void {
    this.setState({ deleting });
  }

  /**
   * Update form data
   */
  public updateFormData(field: string, value: any): void {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      this.setState({
        formData: {
          ...this.state.formData,
          [parent]: {
            ...(this.state.formData[parent as keyof PassageFormData] as any),
            [child]: value
          }
        }
      });
    } else {
      this.setState({
        formData: {
          ...this.state.formData,
          [field]: value
        }
      });
    }
  }

  /**
   * Reset form data
   */
  public resetFormData(): void {
    this.setState({
      formData: {
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
      }
    });
  }

  /**
   * Calculate word count
   */
  public calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate reading time
   */
  public calculateReadingTime(wordCount: number): number {
    // Average reading speed: 200 words per minute
    return Math.ceil(wordCount / 200);
  }

  /**
   * Handle content change with auto-calculation
   */
  public handleContentChange(content: string): void {
    const wordCount = this.calculateWordCount(content);
    const readingTime = this.calculateReadingTime(wordCount);
    
    this.updateFormData('texts.content', content);
    this.updateFormData('meta.word_count', wordCount);
    this.updateFormData('meta.reading_time', readingTime);
  }

  /**
   * Get filtered passages
   */
  public getFilteredPassages(): Passage[] {
    return this.state.passages.filter(passage => {
      const matchesSearch = passage.texts.title.toLowerCase().includes(this.state.searchTerm.toLowerCase()) ||
                           passage.texts.content.toLowerCase().includes(this.state.searchTerm.toLowerCase());
      const matchesPart = this.state.filterPart === 'all' || passage.part.toString() === this.state.filterPart;
      return matchesSearch && matchesPart;
    });
  }

  /**
   * Toggle select all passages
   */
  public toggleSelectAll(): void {
    const filteredPassages = this.getFilteredPassages();
    if (this.state.selectedPassages.size === filteredPassages.length) {
      this.setState({ selectedPassages: new Set() });
    } else {
      this.setState({ selectedPassages: new Set(filteredPassages.map(p => p.id)) });
    }
  }

  /**
   * Toggle select individual passage
   */
  public toggleSelectPassage(passageId: string): void {
    const newSelected = new Set(this.state.selectedPassages);
    if (newSelected.has(passageId)) {
      newSelected.delete(passageId);
    } else {
      newSelected.add(passageId);
    }
    this.setState({ selectedPassages: newSelected });
  }

  /**
   * Clear selection
   */
  public clearSelection(): void {
    this.setState({ selectedPassages: new Set() });
  }

  /**
   * Edit passage
   */
  public editPassage(passage: Passage): void {
    this.setState({
      formData: {
        part: passage.part,
        passage_type: passage.passage_type,
        texts: {
          title: passage.texts.title,
          content: passage.texts.content,
          additional: passage.texts.additional || ''
        },
        audio_url: passage.audio_url || '',
        image_url: passage.image_url || '',
        assets: passage.assets || { images: [], charts: [] },
        meta: passage.meta
      },
      editingPassage: passage,
      activeTab: 'create'
    });
  }

  /**
   * Get part name
   */
  public getPartName(part: number): string {
    const partNames: { [key: number]: string } = {
      3: 'Conversations',
      4: 'Talks',
      6: 'Text Completion',
      7: 'Reading Comprehension'
    };
    return partNames[part] || `Part ${part}`;
  }

  /**
   * Get part color class
   */
  public getPartColor(part: number): string {
    const colors: { [key: number]: string } = {
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-green-100 text-green-800',
      6: 'bg-purple-100 text-purple-800',
      7: 'bg-orange-100 text-orange-800'
    };
    return colors[part] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get template data for Excel export
   */
  public getTemplateData(): any[] {
    return [
      {
        part: 3,
        passage_type: 'single',
        title: 'Office Meeting',
        content: 'Woman: Good morning, everyone. Thank you for coming to today\'s meeting. We need to discuss the quarterly sales report and the upcoming product launch. Man: Yes, I have the sales figures here. Our revenue increased by 15% compared to last quarter. Woman: That\'s excellent news. What about the new product? Man: The launch is scheduled for next month, but we\'re still waiting for final approval from the marketing department.',
        audio_url: 'https://example.com/audio/part3-conversation1.mp3',
        image_url: 'https://example.com/images/office-meeting.jpg',
        topic: 'Business Meeting',
        word_count: 85,
        reading_time: 1
      },
      {
        part: 3,
        passage_type: 'single',
        title: 'Restaurant Reservation',
        content: 'Man: Hello, I\'d like to make a reservation for dinner tonight. Woman: Certainly, sir. How many people will be in your party? Man: There will be four of us. Woman: What time would you prefer? Man: Around 7:30 PM would be perfect. Woman: I\'m sorry, but we\'re fully booked at that time. Would 8:00 PM work for you? Man: Yes, that\'s fine. Woman: Great, I\'ll reserve a table for four at 8:00 PM. May I have your name and phone number?',
        audio_url: 'https://example.com/audio/part3-conversation2.mp3',
        image_url: 'https://example.com/images/restaurant.jpg',
        topic: 'Restaurant',
        word_count: 78,
        reading_time: 1
      }
    ];
  }

  /**
   * Validate passage data
   */
  public validatePassageData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.part || ![3, 4, 6, 7].includes(parseInt(data.part))) {
      errors.push('Part must be 3, 4, 6, or 7');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (!data.passage_type || !['single', 'double', 'triple'].includes(data.passage_type)) {
      errors.push('Passage type must be single, double, or triple');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Process imported data
   */
  public processImportedData(jsonData: any[]): { validData: any[]; errors: string[] } {
    const validData: any[] = [];
    const errors: string[] = [];

    jsonData.forEach((row, index) => {
      const validation = this.validatePassageData(row);
      if (validation.isValid) {
        const wordCount = row.word_count || this.calculateWordCount(row.content);
        const readingTime = row.reading_time || this.calculateReadingTime(wordCount);

        validData.push({
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
          }
        });
      } else {
        errors.push(`Row ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return { validData, errors };
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const totalPassages = this.state.passages.length;
    const filteredPassages = this.getFilteredPassages();
    const selectedCount = this.state.selectedPassages.size;
    const partCounts = this.state.passages.reduce((acc, passage) => {
      acc[passage.part] = (acc[passage.part] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalPassages,
      filteredPassages: filteredPassages.length,
      selectedCount,
      partCounts,
      activeFiltersCount: (this.state.searchTerm ? 1 : 0) + (this.state.filterPart !== 'all' ? 1 : 0)
    };
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.setState(this.getInitialState());
  }
}

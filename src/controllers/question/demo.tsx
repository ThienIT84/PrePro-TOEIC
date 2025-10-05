/**
 * Demo component để show cách sử dụng QuestionController
 * Không cần import vào app chính
 */
import React, { useEffect, useState } from 'react';
import { useQuestionController } from './useQuestionController';
import { TOEICPart, Difficulty } from '@/types';

export function QuestionControllerDemo() {
  const {
    questions,
    loading,
    error,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsByPart,
    getQuestionsByDifficulty,
    searchQuestions,
    getQuestionsStats
  } = useQuestionController();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<TOEICPart | undefined>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>();

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const results = searchQuestions(term);
    console.log('Search results:', results);
  };

  // Handle filter by part
  const handlePartFilter = (part: TOEICPart | undefined) => {
    setSelectedPart(part);
    if (part) {
      const results = getQuestionsByPart(part);
      console.log(`Questions for part ${part}:`, results);
    }
  };

  // Handle filter by difficulty
  const handleDifficultyFilter = (difficulty: Difficulty | undefined) => {
    setSelectedDifficulty(difficulty);
    if (difficulty) {
      const results = getQuestionsByDifficulty(difficulty);
      console.log(`Questions for difficulty ${difficulty}:`, results);
    }
  };

  // Handle create question
  const handleCreateQuestion = async () => {
    const newQuestion = await createQuestion({
      part: 1,
      prompt_text: 'What do you see in the picture?',
      choices: { A: 'A car', B: 'A bus', C: 'A train', D: 'A plane' },
      correct_choice: 'A',
      explain_vi: 'Trong hình có một chiếc xe hơi',
      explain_en: 'There is a car in the picture',
      tags: ['listening', 'photos'],
      difficulty: 'easy',
      status: 'published',
      image_url: 'https://example.com/image.jpg',
      audio_url: 'https://example.com/audio.mp3'
    });

    if (newQuestion) {
      console.log('Question created:', newQuestion);
    }
  };

  // Get statistics
  const stats = getQuestionsStats();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Question Controller Demo</h1>
      
      {/* Statistics */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Questions</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Valid for Exam</div>
            <div className="text-2xl font-bold">{stats.validForExam}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Needing Audio</div>
            <div className="text-2xl font-bold">{stats.needingAudio}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Needing Images</div>
            <div className="text-2xl font-bold">{stats.needingImages}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Part</label>
          <select
            value={selectedPart || ''}
            onChange={(e) => handlePartFilter(e.target.value as TOEICPart || undefined)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Parts</option>
            <option value={1}>Part 1: Photos</option>
            <option value={2}>Part 2: Question-Response</option>
            <option value={3}>Part 3: Conversations</option>
            <option value={4}>Part 4: Talks</option>
            <option value={5}>Part 5: Incomplete Sentences</option>
            <option value={6}>Part 6: Text Completion</option>
            <option value={7}>Part 7: Reading Comprehension</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Difficulty</label>
          <select
            value={selectedDifficulty || ''}
            onChange={(e) => handleDifficultyFilter(e.target.value as Difficulty || undefined)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={handleCreateQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Sample Question
        </button>
      </div>

      {/* Status */}
      {loading && <div className="text-blue-600 mb-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
        {questions.length === 0 ? (
          <div className="text-gray-500">No questions found</div>
        ) : (
          questions.map(question => (
            <div key={question.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{question.getPartDisplayName()}</h3>
                  <p className="text-sm text-gray-600">{question.prompt_text}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {question.difficulty}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {question.status}
                    </span>
                    {question.needsAudio() && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        Audio
                      </span>
                    )}
                    {question.needsImage() && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        Image
                      </span>
                    )}
                    {question.needsPassage() && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        Passage
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {question.getEstimatedTime()}s
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

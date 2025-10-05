import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionModel } from '@/models/entities';
import QuestionDetailModalView from './QuestionDetailModalView';
import QuestionDetailModalMVC from './QuestionDetailModalMVC';
import { useQuestionDetailController } from '@/controllers/question/useQuestionDetailController';

// Mock question data
const mockQuestion = new QuestionModel({
  id: '1',
  part: 1,
  passage_id: null,
  blank_index: null,
  prompt_text: 'What do you see in the picture?',
  choices: { A: 'A car', B: 'A bus', C: 'A train', D: 'A plane' },
  correct_choice: 'A',
  explain_vi: 'Trong hình có một chiếc xe hơi',
  explain_en: 'There is a car in the picture',
  tags: ['listening', 'photos'],
  difficulty: 'easy',
  status: 'published',
  image_url: 'https://example.com/image.jpg',
  audio_url: 'https://example.com/audio.mp3',
  transcript: 'This is a sample transcript for the audio.',
  created_by: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
});

/**
 * Component để so sánh Old vs New MVC pattern
 */
const QuestionDetailModalComparison = () => {
  const [showOldModal, setShowOldModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMVCModal, setShowMVCModal] = useState(false);

  const {
    question: controllerQuestion,
    isOpen: controllerIsOpen,
    openModal,
    closeModal,
    playAudio,
    getTypeLabel,
    getDifficultyLabel,
    getDifficultyColor
  } = useQuestionDetailController();

  const handleOpenOldModal = () => {
    setShowOldModal(true);
  };

  const handleOpenNewModal = () => {
    setShowNewModal(true);
  };

  const handleOpenMVCModal = () => {
    setShowMVCModal(true);
  };

  const handleOpenControllerModal = () => {
    openModal(mockQuestion);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Question Detail Modal - MVC Refactor Comparison</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Old Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">OLD</Badge>
              Original Component
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Component cũ với business logic trộn với UI logic.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Business logic trong component</li>
              <li>• Hard-coded labels</li>
              <li>• Direct audio handling</li>
              <li>• Khó test và maintain</li>
            </ul>
            <Button onClick={handleOpenOldModal} className="w-full">
              Test Original Modal
            </Button>
          </CardContent>
        </Card>

        {/* New Pattern - Pure View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">NEW</Badge>
              Pure View
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Pure View component, nhận business logic qua props.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Chỉ hiển thị UI</li>
              <li>• Business logic từ props</li>
              <li>• Dễ test và reuse</li>
              <li>• Separation of concerns</li>
            </ul>
            <Button onClick={handleOpenNewModal} className="w-full">
              Test Pure View
            </Button>
          </CardContent>
        </Card>

        {/* MVC Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">MVC</Badge>
              MVC Pattern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              MVC pattern với Controller + View.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Controller quản lý state</li>
              <li>• View chỉ hiển thị UI</li>
              <li>• Business logic tách biệt</li>
              <li>• Dễ maintain và scale</li>
            </ul>
            <Button onClick={handleOpenMVCModal} className="w-full">
              Test MVC Modal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Controller Demo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">CONTROLLER</Badge>
            Controller Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Demo sử dụng Controller trực tiếp với callbacks.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleOpenControllerModal}>
              Open via Controller
            </Button>
            <Button variant="outline" onClick={closeModal}>
              Close via Controller
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            <p>Controller State: {controllerIsOpen ? 'Open' : 'Closed'}</p>
            <p>Question: {controllerQuestion ? 'Loaded' : 'None'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      
      {/* Old Modal - Placeholder */}
      {showOldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Original Modal (Placeholder)</h2>
            <p className="text-gray-600 mb-4">
              This would be the original component with mixed business logic and UI.
            </p>
            <Button onClick={() => setShowOldModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* New Modal - Pure View */}
      {showNewModal && (
        <QuestionDetailModalView
          question={mockQuestion}
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onEdit={(question) => {
            console.log('Edit question:', question);
            setShowNewModal(false);
          }}
          onPlayAudio={(audioUrl) => {
            console.log('Play audio:', audioUrl);
            // Mock audio play
            alert(`Playing audio: ${audioUrl}`);
          }}
          getTypeLabel={(type) => type}
          getDifficultyLabel={(difficulty) => difficulty}
          getDifficultyColor={(difficulty) => {
            switch (difficulty) {
              case 'easy': return 'bg-green-100 text-green-800';
              case 'medium': return 'bg-yellow-100 text-yellow-800';
              case 'hard': return 'bg-red-100 text-red-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          }}
        />
      )}

      {/* MVC Modal */}
      {showMVCModal && (
        <QuestionDetailModalMVC
          question={mockQuestion}
          isOpen={showMVCModal}
          onClose={() => setShowMVCModal(false)}
          onEdit={(question) => {
            console.log('Edit question:', question);
            setShowMVCModal(false);
          }}
        />
      )}

      {/* Controller Modal */}
      {controllerIsOpen && controllerQuestion && (
        <QuestionDetailModalView
          question={controllerQuestion}
          isOpen={controllerIsOpen}
          onClose={closeModal}
          onEdit={(question) => {
            console.log('Edit question:', question);
            closeModal();
          }}
          onPlayAudio={playAudio}
          getTypeLabel={getTypeLabel}
          getDifficultyLabel={getDifficultyLabel}
          getDifficultyColor={getDifficultyColor}
        />
      )}
    </div>
  );
};

export default QuestionDetailModalComparison;

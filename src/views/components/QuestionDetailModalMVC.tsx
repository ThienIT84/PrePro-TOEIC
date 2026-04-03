import React from 'react';
import { useQuestionDetailController } from '@/controllers/question/useQuestionDetailController';
import QuestionDetailModalView from './QuestionDetailModalView';
import { QuestionModel } from '@/models/entities';

interface QuestionDetailModalMVCProps {
  question: QuestionModel | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (question: QuestionModel) => void;
}

/**
 * MVC Component - Kết hợp View và Controller
 * Sử dụng useQuestionDetailController để quản lý business logic
 */
const QuestionDetailModalMVC = ({ 
  question, 
  isOpen, 
  onClose, 
  onEdit 
}: QuestionDetailModalMVCProps) => {
  const {
    // State
    question: controllerQuestion,
    isOpen: controllerIsOpen,
    
    // Actions
    openModal,
    closeModal,
    playAudio,
    
    // Display helpers
    getTypeLabel,
    getDifficultyLabel,
    getDifficultyColor
  } = useQuestionDetailController();

  // Sync external props with controller
  React.useEffect(() => {
    if (question && isOpen) {
      openModal(question);
    } else if (!isOpen) {
      closeModal();
    }
  }, [question, isOpen, openModal, closeModal]);

  // Handle close
  const handleClose = () => {
    closeModal();
    onClose();
  };

  // Handle edit
  const handleEdit = (question: QuestionModel) => {
    onEdit?.(question);
  };

  return (
    <QuestionDetailModalView
      question={controllerQuestion}
      isOpen={controllerIsOpen}
      onClose={handleClose}
      onEdit={handleEdit}
      onPlayAudio={playAudio}
      getTypeLabel={getTypeLabel}
      getDifficultyLabel={getDifficultyLabel}
      getDifficultyColor={getDifficultyColor}
    />
  );
};

export default QuestionDetailModalMVC;

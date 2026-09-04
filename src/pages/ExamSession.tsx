import React from 'react';
import { useParams } from 'react-router-dom';
import ExamSessionMVC from '@/views/components/ExamSessionMVC';

/**
 * ExamSession Page (Route Container)
 * Tuân thủ kiến trúc MVC: ủy quyền toàn bộ state và UI cho ExamSessionMVC
 */
const ExamSessionPage: React.FC = () => {
  const { examSetId } = useParams<{ examSetId: string }>();
  return <ExamSessionMVC examSetId={examSetId} />;
};

export default ExamSessionPage;


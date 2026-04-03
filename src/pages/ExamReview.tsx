import { useParams } from 'react-router-dom';
import ExamReviewComponent from '@/components/ExamReview';

const ExamReview = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  if (!sessionId) {
    return <div>Session ID not found</div>;
  }

  return <ExamReviewComponent sessionId={sessionId} />;
};

export default ExamReview;

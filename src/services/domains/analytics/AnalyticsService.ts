import { BaseService } from '../BaseService';
import { QuestionModel, ExamSetModel, UserModel } from '@/models/entities';

/**
 * Analytics Service - Xử lý tất cả operations liên quan đến Analytics
 * Sử dụng BaseService và không thay đổi Supabase
 */
export class AnalyticsService extends BaseService {
  private profilesTable = 'profiles';
  private questionsTable = 'questions';
  private examSetsTable = 'exam_sets';
  private examSessionsTable = 'exam_sessions';
  private examAttemptsTable = 'exam_attempts';

  /**
   * Get overall system statistics
   */
  async getSystemStats(): Promise<{ data: any; error: any }> {
    this.log('getSystemStats');

    try {
      // Get counts for all main entities
      const [
        usersCount,
        questionsCount,
        examSetsCount,
        sessionsCount
      ] = await Promise.all([
        this.countData(this.profilesTable),
        this.countData(this.questionsTable),
        this.countData(this.examSetsTable),
        this.countData(this.examSessionsTable)
      ]);

      const stats = {
        totalUsers: usersCount.count || 0,
        totalQuestions: questionsCount.count || 0,
        totalExamSets: examSetsCount.count || 0,
        totalSessions: sessionsCount.count || 0,
        activeUsers: 0, // Will be calculated separately
        publishedQuestions: 0, // Will be calculated separately
        activeExamSets: 0 // Will be calculated separately
      };

      // Get additional stats
      const { data: publishedQuestions } = await this.supabase
        .from(this.questionsTable)
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');

      const { data: activeExamSets } = await this.supabase
        .from(this.examSetsTable)
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      stats.publishedQuestions = publishedQuestions?.length || 0;
      stats.activeExamSets = activeExamSets?.length || 0;

      return { data: stats, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get question analytics
   */
  async getQuestionAnalytics(): Promise<{ data: any; error: any }> {
    this.log('getQuestionAnalytics');

    try {
      const { data: questions, error } = await this.supabase
        .from(this.questionsTable)
        .select('*');

      if (error) {
        this.handleError(error, 'getQuestionAnalytics');
      }

      const questionModels = (questions || []).map(q => new QuestionModel(q));

      const analytics = {
        total: questionModels.length,
        byPart: {} as Record<number, number>,
        byDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0
        },
        byStatus: {
          draft: 0,
          published: 0,
          archived: 0
        },
        byType: {
          listening: 0,
          reading: 0
        },
        needingAudio: 0,
        needingImages: 0,
        needingPassages: 0,
        validForExam: 0,
        averageWordCount: 0,
        averageTime: 0
      };

      questionModels.forEach(q => {
        // Count by part
        analytics.byPart[q.part] = (analytics.byPart[q.part] || 0) + 1;
        
        // Count by difficulty
        analytics.byDifficulty[q.difficulty]++;
        
        // Count by status
        analytics.byStatus[q.status]++;
        
        // Count by type
        const type = q.getPartType();
        analytics.byType[type]++;
        
        // Count special requirements
        if (q.needsAudio()) analytics.needingAudio++;
        if (q.needsImage()) analytics.needingImages++;
        if (q.needsPassage()) analytics.needingPassages++;
        if (q.isValidForExam()) analytics.validForExam++;
        
        // Calculate averages
        analytics.averageTime += q.getEstimatedTime();
      });

      // Calculate averages
      if (questionModels.length > 0) {
        analytics.averageTime = analytics.averageTime / questionModels.length;
      }

      return { data: analytics, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get exam analytics
   */
  async getExamAnalytics(): Promise<{ data: any; error: any }> {
    this.log('getExamAnalytics');

    try {
      const { data: examSets, error: examSetsError } = await this.supabase
        .from(this.examSetsTable)
        .select('*');

      if (examSetsError) {
        this.handleError(examSetsError, 'getExamAnalytics');
      }

      const examSetModels = (examSets || []).map(es => new ExamSetModel(es));

      const analytics = {
        total: examSetModels.length,
        active: examSetModels.filter(es => es.is_active).length,
        byType: {} as Record<string, number>,
        byDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0
        },
        totalQuestions: examSetModels.reduce((sum, es) => sum + es.question_count, 0),
        averageQuestions: 0,
        totalTime: examSetModels.reduce((sum, es) => sum + es.time_limit, 0),
        averageTime: 0,
        byQuestionCount: {
          '1-20': 0,
          '21-50': 0,
          '51-100': 0,
          '100+': 0
        },
        byTimeLimit: {
          '0-30': 0,
          '31-60': 0,
          '61-120': 0,
          '120+': 0
        }
      };

      examSetModels.forEach(es => {
        // Count by type
        analytics.byType[es.type] = (analytics.byType[es.type] || 0) + 1;
        
        // Count by difficulty
        analytics.byDifficulty[es.difficulty]++;
        
        // Count by question count ranges
        if (es.question_count <= 20) {
          analytics.byQuestionCount['1-20']++;
        } else if (es.question_count <= 50) {
          analytics.byQuestionCount['21-50']++;
        } else if (es.question_count <= 100) {
          analytics.byQuestionCount['51-100']++;
        } else {
          analytics.byQuestionCount['100+']++;
        }
        
        // Count by time limit ranges
        if (es.time_limit <= 30) {
          analytics.byTimeLimit['0-30']++;
        } else if (es.time_limit <= 60) {
          analytics.byTimeLimit['31-60']++;
        } else if (es.time_limit <= 120) {
          analytics.byTimeLimit['61-120']++;
        } else {
          analytics.byTimeLimit['120+']++;
        }
      });

      // Calculate averages
      if (examSetModels.length > 0) {
        analytics.averageQuestions = analytics.totalQuestions / examSetModels.length;
        analytics.averageTime = analytics.totalTime / examSetModels.length;
      }

      return { data: analytics, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(): Promise<{ data: any; error: any }> {
    this.log('getUserAnalytics');

    try {
      const { data: profiles, error } = await this.supabase
        .from(this.profilesTable)
        .select('*');

      if (error) {
        this.handleError(error, 'getUserAnalytics');
      }

      const userModels = (profiles || []).map(p => new UserModel(p));

      const analytics = {
        total: userModels.length,
        students: userModels.filter(u => u.isStudent()).length,
        teachers: userModels.filter(u => u.isTeacher()).length,
        byLevel: {
          Beginner: 0,
          Intermediate: 0,
          Advanced: 0
        },
        byTargetScore: {
          '0-500': 0,
          '500-700': 0,
          '700-900': 0,
          '900+': 0
        },
        withTestDate: userModels.filter(u => u.test_date).length,
        withFocusAreas: userModels.filter(u => u.focus.length > 0).length,
        averageTargetScore: 0,
        completionRate: 0
      };

      userModels.forEach(u => {
        // Count by level
        const level = u.getUserLevel();
        analytics.byLevel[level]++;
        
        // Count by target score range
        if (u.target_score < 500) {
          analytics.byTargetScore['0-500']++;
        } else if (u.target_score < 700) {
          analytics.byTargetScore['500-700']++;
        } else if (u.target_score < 900) {
          analytics.byTargetScore['700-900']++;
        } else {
          analytics.byTargetScore['900+']++;
        }
      });

      // Calculate averages
      if (userModels.length > 0) {
        analytics.averageTargetScore = userModels.reduce((sum, u) => sum + u.target_score, 0) / userModels.length;
        analytics.completionRate = (analytics.withTestDate + analytics.withFocusAreas) / (userModels.length * 2) * 100;
      }

      return { data: analytics, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get exam session analytics
   */
  async getSessionAnalytics(): Promise<{ data: any; error: any }> {
    this.log('getSessionAnalytics');

    try {
      const { data: sessions, error } = await this.supabase
        .from(this.examSessionsTable)
        .select(`
          *,
          exam_sets (*),
          profiles (*)
        `);

      if (error) {
        this.handleError(error, 'getSessionAnalytics');
      }

      const analytics = {
        total: sessions?.length || 0,
        completed: sessions?.filter(s => s.status === 'completed').length || 0,
        inProgress: sessions?.filter(s => s.status === 'in_progress').length || 0,
        abandoned: sessions?.filter(s => s.status === 'abandoned').length || 0,
        averageScore: 0,
        averageTime: 0,
        byExamSet: {} as Record<string, number>,
        byUser: {} as Record<string, number>,
        completionRate: 0
      };

      if (sessions && sessions.length > 0) {
        // Calculate completion rate
        analytics.completionRate = (analytics.completed / analytics.total) * 100;

        // Group by exam set
        sessions.forEach(session => {
          const examSetId = session.exam_set_id;
          analytics.byExamSet[examSetId] = (analytics.byExamSet[examSetId] || 0) + 1;
        });

        // Group by user
        sessions.forEach(session => {
          const userId = session.user_id;
          analytics.byUser[userId] = (analytics.byUser[userId] || 0) + 1;
        });
      }

      return { data: analytics, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(): Promise<{ data: any; error: any }> {
    this.log('getPerformanceAnalytics');

    try {
      const { data: attempts, error } = await this.supabase
        .from(this.examAttemptsTable)
        .select(`
          *,
          questions (*)
        `);

      if (error) {
        this.handleError(error, 'getPerformanceAnalytics');
      }

      const analytics = {
        totalAttempts: attempts?.length || 0,
        correctAnswers: attempts?.filter(a => a.correct).length || 0,
        overallAccuracy: 0,
        averageTimePerQuestion: 0,
        byPart: {} as Record<number, any>,
        byDifficulty: {
          easy: { attempts: 0, correct: 0, accuracy: 0 },
          medium: { attempts: 0, correct: 0, accuracy: 0 },
          hard: { attempts: 0, correct: 0, accuracy: 0 }
        },
        byQuestion: {} as Record<string, any>
      };

      if (attempts && attempts.length > 0) {
        // Calculate overall accuracy
        analytics.overallAccuracy = (analytics.correctAnswers / analytics.totalAttempts) * 100;

        // Calculate average time per question
        const totalTime = attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0);
        analytics.averageTimePerQuestion = totalTime / analytics.totalAttempts;

        // Group by part and difficulty
        attempts.forEach(attempt => {
          const question = attempt.questions;
          if (question) {
            // By part
            if (!analytics.byPart[question.part]) {
              analytics.byPart[question.part] = { attempts: 0, correct: 0, accuracy: 0 };
            }
            analytics.byPart[question.part].attempts++;
            if (attempt.correct) {
              analytics.byPart[question.part].correct++;
            }

            // By difficulty
            analytics.byDifficulty[question.difficulty].attempts++;
            if (attempt.correct) {
              analytics.byDifficulty[question.difficulty].correct++;
            }

            // By question
            if (!analytics.byQuestion[question.id]) {
              analytics.byQuestion[question.id] = { attempts: 0, correct: 0, accuracy: 0 };
            }
            analytics.byQuestion[question.id].attempts++;
            if (attempt.correct) {
              analytics.byQuestion[question.id].correct++;
            }
          }
        });

        // Calculate accuracies
        Object.keys(analytics.byPart).forEach(part => {
          const partData = analytics.byPart[parseInt(part)];
          partData.accuracy = partData.attempts > 0 ? (partData.correct / partData.attempts) * 100 : 0;
        });

        Object.keys(analytics.byDifficulty).forEach(difficulty => {
          const diffData = analytics.byDifficulty[difficulty as keyof typeof analytics.byDifficulty];
          diffData.accuracy = diffData.attempts > 0 ? (diffData.correct / diffData.attempts) * 100 : 0;
        });

        Object.keys(analytics.byQuestion).forEach(questionId => {
          const questionData = analytics.byQuestion[questionId];
          questionData.accuracy = questionData.attempts > 0 ? (questionData.correct / questionData.attempts) * 100 : 0;
        });
      }

      return { data: analytics, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(): Promise<{ data: any; error: any }> {
    this.log('getDashboardSummary');

    try {
      const [
        systemStats,
        questionAnalytics,
        examAnalytics,
        userAnalytics,
        sessionAnalytics
      ] = await Promise.all([
        this.getSystemStats(),
        this.getQuestionAnalytics(),
        this.getExamAnalytics(),
        this.getUserAnalytics(),
        this.getSessionAnalytics()
      ]);

      const summary = {
        system: systemStats.data,
        questions: questionAnalytics.data,
        exams: examAnalytics.data,
        users: userAnalytics.data,
        sessions: sessionAnalytics.data,
        lastUpdated: new Date().toISOString()
      };

      return { data: summary, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get trends over time
   */
  async getTrends(days: number = 30): Promise<{ data: any; error: any }> {
    this.log('getTrends', { days });

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = {
        questionsCreated: [] as any[],
        examSetsCreated: [] as any[],
        sessionsStarted: [] as any[],
        usersRegistered: [] as any[]
      };

      // Get questions created over time
      const { data: questions } = await this.supabase
        .from(this.questionsTable)
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Get exam sets created over time
      const { data: examSets } = await this.supabase
        .from(this.examSetsTable)
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Get sessions started over time
      const { data: sessions } = await this.supabase
        .from(this.examSessionsTable)
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Get users registered over time
      const { data: users } = await this.supabase
        .from(this.profilesTable)
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Process data into daily counts
      const processData = (data: any[], key: string) => {
        const dailyCounts: Record<string, number> = {};
        
        data?.forEach(item => {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        return Object.entries(dailyCounts).map(([date, count]) => ({
          date,
          count
        }));
      };

      trends.questionsCreated = processData(questions, 'questions');
      trends.examSetsCreated = processData(examSets, 'examSets');
      trends.sessionsStarted = processData(sessions, 'sessions');
      trends.usersRegistered = processData(users, 'users');

      return { data: trends, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }
}

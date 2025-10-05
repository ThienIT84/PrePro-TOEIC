import { supabase } from '@/integrations/supabase/client';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  target_score: number;
  test_date: string | null;
  created_at: string;
  last_activity: string;
  total_attempts: number;
  avg_score: number;
  completion_rate: number;
  streak_days: number;
  weak_areas: string[];
  strong_areas: string[];
}

export interface ClassInfo {
  id: string;
  name: string;
  description: string;
  student_count: number;
  created_at: string;
  avg_score: number;
  completion_rate: number;
}

export interface ActivityEvent {
  id: string;
  student_id: string;
  student_name: string;
  type: 'exam' | 'drill' | 'review' | 'achievement';
  title: string;
  score?: number;
  timestamp: string;
  details?: string;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  title: string;
  message: string;
  student_id?: string;
  student_name?: string;
  timestamp: string;
  is_read: boolean;
}

export interface AnalyticsData {
  // Key Metrics
  total_students: number;
  active_today: number;
  avg_score: number;
  completion_rate: number;
  
  // Trends
  students_trend: number;
  activity_trend: number;
  score_trend: number;
  completion_trend: number;
  
  // Detailed Data
  students: StudentProfile[];
  classes: ClassInfo[];
  recent_activities: ActivityEvent[];
  alerts: AlertItem[];
  
  // Performance by Skill
  skill_performance: {
    vocabulary: { avg_score: number; trend: number };
    grammar: { avg_score: number; trend: number };
    listening: { avg_score: number; trend: number };
    reading: { avg_score: number; trend: number };
  };
  
  // Time-based Data
  daily_activity: Array<{ date: string; count: number }>;
  weekly_progress: Array<{ week: string; avg_score: number }>;
}

class TeacherAnalyticsService {
  /**
   * Get comprehensive analytics data for teacher
   */
  async getAnalyticsData(teacherId: string): Promise<AnalyticsData> {
    try {
      // Get teacher's students
      const students = await this.getTeacherStudents(teacherId);
      const studentIds = students.map(s => s.student_id);
      
      if (studentIds.length === 0) {
        return this.getEmptyAnalytics();
      }

      // Get all analytics data in parallel
      const [
        keyMetrics,
        activities,
        examResults,
        skillPerformance,
        dailyActivity,
        weeklyProgress
      ] = await Promise.all([
        this.getKeyMetrics(studentIds),
        this.getRecentActivities(studentIds),
        this.getExamResults(studentIds),
        this.getSkillPerformance(studentIds),
        this.getDailyActivity(studentIds),
        this.getWeeklyProgress(studentIds)
      ]);

      // Generate alerts
      const alerts = await this.generateAlerts(students, activities, examResults);

      return {
        ...keyMetrics,
        students: students.map(s => ({
          id: s.student_id,
          name: s.name || 'Unknown',
          email: s.email || '',
          target_score: s.target_score || 700,
          test_date: s.test_date,
          created_at: s.created_at,
          last_activity: s.last_activity || s.created_at,
          total_attempts: s.total_attempts || 0,
          avg_score: s.avg_score || 0,
          completion_rate: s.completion_rate || 0,
          streak_days: s.streak_days || 0,
          weak_areas: s.weak_areas || [],
          strong_areas: s.strong_areas || []
        })),
        classes: await this.getClasses(teacherId),
        recent_activities: activities,
        alerts,
        skill_performance: skillPerformance,
        daily_activity: dailyActivity,
        weekly_progress: weeklyProgress
      };

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get teacher's students with detailed info
   */
  private async getTeacherStudents(teacherId: string) {
    try {
      const { data, error } = await supabase.rpc('get_teacher_students', {
        teacher_uuid: teacherId
      });

      if (error) {
        console.error('Error fetching teacher students:', error);
        return [];
      }

      // Get additional student data
      const studentIds = data?.map(s => s.student_id) || [];
      if (studentIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds);

      if (profileError) {
        console.error('Error fetching student profiles:', profileError);
        return [];
      }

      // Get student statistics
      const { data: attempts, error: attemptsError } = await supabase
        .from('attempts')
        .select('user_id, correct, created_at, items(type)')
        .in('user_id', studentIds);

      if (attemptsError) {
        console.error('Error fetching student attempts:', attemptsError);
      }

      // Calculate statistics for each student
      return profiles?.map(profile => {
        const studentAttempts = attempts?.filter(a => a.user_id === profile.user_id) || [];
        const correctAttempts = studentAttempts.filter(a => a.correct);
        const avgScore = studentAttempts.length > 0 ? 
          (correctAttempts.length / studentAttempts.length) * 100 : 0;

        // Calculate weak/strong areas
        const skillStats = this.calculateSkillStats(studentAttempts);
        
        return {
          ...profile,
          total_attempts: studentAttempts.length,
          avg_score: avgScore,
          completion_rate: Math.min(100, studentAttempts.length * 2), // Simplified
          streak_days: this.calculateStreak(studentAttempts),
          weak_areas: skillStats.weak,
          strong_areas: skillStats.strong,
          last_activity: this.getLastActivity(studentAttempts)
        };
      }) || [];
    } catch (error) {
      console.error('Error in getTeacherStudents:', error);
      return [];
    }
  }

  /**
   * Get key metrics for dashboard
   */
  private async getKeyMetrics(studentIds: string[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get current metrics
    const { data: currentAttempts } = await supabase
      .from('attempts')
      .select('user_id, correct, created_at')
      .in('user_id', studentIds);

    const { data: lastWeekAttempts } = await supabase
      .from('attempts')
      .select('user_id, correct, created_at')
      .in('user_id', studentIds)
      .gte('created_at', lastWeek.toISOString())
      .lt('created_at', today.toISOString());

    const totalStudents = studentIds.length;
    const activeToday = new Set(
      currentAttempts?.filter(a => 
        new Date(a.created_at) >= today
      ).map(a => a.user_id) || []
    ).size;

    const currentAvgScore = currentAttempts?.length > 0 ?
      (currentAttempts.filter(a => a.correct).length / currentAttempts.length) * 100 : 0;

    const lastWeekAvgScore = lastWeekAttempts?.length > 0 ?
      (lastWeekAttempts.filter(a => a.correct).length / lastWeekAttempts.length) * 100 : 0;

    return {
      total_students: totalStudents,
      active_today: activeToday,
      avg_score: Math.round(currentAvgScore),
      completion_rate: Math.min(100, Math.round((currentAttempts?.length || 0) / totalStudents * 10)),
      students_trend: totalStudents > 0 ? 12 : 0, // Mock data
      activity_trend: activeToday > 0 ? 5 : 0,
      score_trend: Math.round(currentAvgScore - lastWeekAvgScore),
      completion_trend: 3 // Mock data
    };
  }

  /**
   * Get recent activities
   */
  private async getRecentActivities(studentIds: string[]): Promise<ActivityEvent[]> {
    const { data: examSessions } = await supabase
      .from('exam_sessions')
      .select(`
        id,
        user_id,
        score,
        completed_at,
        exam_sets(title),
        profiles(name)
      `)
      .in('user_id', studentIds)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(20);

    const { data: attempts } = await supabase
      .from('attempts')
      .select(`
        user_id,
        correct,
        created_at,
        items(type),
        profiles(name)
      `)
      .in('user_id', studentIds)
      .order('created_at', { ascending: false })
      .limit(20);

    const activities: ActivityEvent[] = [];

    // Add exam activities
    examSessions?.forEach(exam => {
      activities.push({
        id: exam.id,
        student_id: exam.user_id,
        student_name: exam.profiles?.name || 'Unknown',
        type: 'exam',
        title: exam.exam_sets?.title || 'Exam',
        score: exam.score,
        timestamp: exam.completed_at,
        details: `Score: ${exam.score}%`
      });
    });

    // Add drill activities
    attempts?.forEach(attempt => {
      activities.push({
        id: attempt.user_id + '_' + attempt.created_at,
        student_id: attempt.user_id,
        student_name: attempt.profiles?.name || 'Unknown',
        type: 'drill',
        title: `${attempt.items?.type || 'Unknown'} Practice`,
        score: attempt.correct ? 100 : 0,
        timestamp: attempt.created_at,
        details: attempt.correct ? 'Correct' : 'Incorrect'
      });
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  }

  /**
   * Get exam results
   */
  private async getExamResults(studentIds: string[]) {
    const { data } = await supabase
      .from('exam_sessions')
      .select('user_id, score, completed_at')
      .in('user_id', studentIds)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    return data || [];
  }

  /**
   * Get skill performance
   */
  private async getSkillPerformance(studentIds: string[]) {
    const { data: attempts } = await supabase
      .from('attempts')
      .select('correct, items(type)')
      .in('user_id', studentIds);

    const skillStats = {
      vocabulary: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 }
    };

    attempts?.forEach(attempt => {
      const type = attempt.items?.type as keyof typeof skillStats;
      if (type && skillStats[type]) {
        skillStats[type].total++;
        if (attempt.correct) {
          skillStats[type].correct++;
        }
      }
    });

    return {
      vocabulary: {
        avg_score: skillStats.vocabulary.total > 0 ? 
          Math.round((skillStats.vocabulary.correct / skillStats.vocabulary.total) * 100) : 0,
        trend: 5 // Mock data
      },
      grammar: {
        avg_score: skillStats.grammar.total > 0 ? 
          Math.round((skillStats.grammar.correct / skillStats.grammar.total) * 100) : 0,
        trend: 3 // Mock data
      },
      listening: {
        avg_score: skillStats.listening.total > 0 ? 
          Math.round((skillStats.listening.correct / skillStats.listening.total) * 100) : 0,
        trend: -2 // Mock data
      },
      reading: {
        avg_score: skillStats.reading.total > 0 ? 
          Math.round((skillStats.reading.correct / skillStats.reading.total) * 100) : 0,
        trend: 7 // Mock data
      }
    };
  }

  /**
   * Get daily activity data
   */
  private async getDailyActivity(studentIds: string[]) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const { data: attempts } = await supabase
      .from('attempts')
      .select('created_at')
      .in('user_id', studentIds)
      .gte('created_at', last7Days[0])
      .lte('created_at', last7Days[6] + 'T23:59:59');

    return last7Days.map(date => ({
      date,
      count: attempts?.filter(a => a.created_at.startsWith(date)).length || 0
    }));
  }

  /**
   * Get weekly progress data
   */
  private async getWeeklyProgress(studentIds: string[]) {
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const week = new Date();
      week.setDate(week.getDate() - (i * 7));
      return week.toISOString().split('T')[0];
    }).reverse();

    const { data: attempts } = await supabase
      .from('attempts')
      .select('created_at, correct')
      .in('user_id', studentIds);

    return last4Weeks.map((week, index) => {
      const weekAttempts = attempts?.filter(a => {
        const attemptDate = new Date(a.created_at);
        const weekStart = new Date(week);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return attemptDate >= weekStart && attemptDate < weekEnd;
      }) || [];

      const avgScore = weekAttempts.length > 0 ?
        (weekAttempts.filter(a => a.correct).length / weekAttempts.length) * 100 : 0;

      return {
        week: `Week ${index + 1}`,
        avg_score: Math.round(avgScore)
      };
    });
  }

  /**
   * Generate smart alerts
   */
  private async generateAlerts(students: any[], activities: ActivityEvent[], examResults: any[]): Promise<AlertItem[]> {
    const alerts: AlertItem[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Check for inactive students
    students.forEach(student => {
      const lastActivity = new Date(student.last_activity);
      if (lastActivity < sevenDaysAgo) {
        alerts.push({
          id: `inactive_${student.user_id}`,
          type: 'warning',
          title: 'Student Inactive',
          message: `${student.name} hasn't been active for more than 7 days`,
          student_id: student.user_id,
          student_name: student.name,
          timestamp: now.toISOString(),
          is_read: false
        });
      }
    });

    // Check for low scores
    examResults.forEach(exam => {
      if (exam.score < 50) {
        const student = students.find(s => s.user_id === exam.user_id);
        alerts.push({
          id: `low_score_${exam.user_id}_${exam.completed_at}`,
          type: 'danger',
          title: 'Low Score Alert',
          message: `${student?.name || 'Student'} scored ${exam.score}% on recent exam`,
          student_id: exam.user_id,
          student_name: student?.name,
          timestamp: exam.completed_at,
          is_read: false
        });
      }
    });

    // Check for achievements
    examResults.forEach(exam => {
      if (exam.score >= 90) {
        const student = students.find(s => s.user_id === exam.user_id);
        alerts.push({
          id: `achievement_${exam.user_id}_${exam.completed_at}`,
          type: 'success',
          title: 'Excellent Score!',
          message: `${student?.name || 'Student'} achieved ${exam.score}% - Great job!`,
          student_id: exam.user_id,
          student_name: student?.name,
          timestamp: exam.completed_at,
          is_read: false
        });
      }
    });

    return alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get classes for teacher
   */
  private async getClasses(teacherId: string): Promise<ClassInfo[]> {
    // Mock data - in real implementation, you'd have a classes table
    return [
      {
        id: 'class_1',
        name: 'TOEIC Intermediate',
        description: 'Students targeting 600-700 points',
        student_count: 15,
        created_at: '2024-01-01',
        avg_score: 650,
        completion_rate: 85
      },
      {
        id: 'class_2',
        name: 'TOEIC Advanced',
        description: 'Students targeting 700+ points',
        student_count: 8,
        created_at: '2024-01-15',
        avg_score: 720,
        completion_rate: 92
      }
    ];
  }

  /**
   * Calculate skill statistics
   */
  private calculateSkillStats(attempts: any[]) {
    const skillCounts: Record<string, { correct: number; total: number }> = {};
    
    attempts.forEach(attempt => {
      const type = attempt.items?.type;
      if (type) {
        if (!skillCounts[type]) {
          skillCounts[type] = { correct: 0, total: 0 };
        }
        skillCounts[type].total++;
        if (attempt.correct) {
          skillCounts[type].correct++;
        }
      }
    });

    const skills = Object.entries(skillCounts).map(([skill, stats]) => ({
      skill,
      accuracy: stats.total > 0 ? stats.correct / stats.total : 0
    }));

    const sortedSkills = skills.sort((a, b) => a.accuracy - b.accuracy);
    
    return {
      weak: sortedSkills.slice(0, 2).map(s => s.skill),
      strong: sortedSkills.slice(-2).map(s => s.skill)
    };
  }

  /**
   * Calculate streak days
   */
  private calculateStreak(attempts: any[]): number {
    if (attempts.length === 0) return 0;
    
    const dates = attempts.map(a => a.created_at.split('T')[0]);
    const uniqueDates = [...new Set(dates)].sort().reverse();
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (uniqueDates[i] === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Get last activity date
   */
  private getLastActivity(attempts: any[]): string {
    if (attempts.length === 0) return new Date().toISOString();
    
    const sortedAttempts = attempts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return sortedAttempts[0].created_at;
  }

  /**
   * Get empty analytics for new teachers
   */
  private getEmptyAnalytics(): AnalyticsData {
    return {
      total_students: 0,
      active_today: 0,
      avg_score: 0,
      completion_rate: 0,
      students_trend: 0,
      activity_trend: 0,
      score_trend: 0,
      completion_trend: 0,
      students: [],
      classes: [],
      recent_activities: [],
      alerts: [],
      skill_performance: {
        vocabulary: { avg_score: 0, trend: 0 },
        grammar: { avg_score: 0, trend: 0 },
        listening: { avg_score: 0, trend: 0 },
        reading: { avg_score: 0, trend: 0 }
      },
      daily_activity: [],
      weekly_progress: []
    };
  }
}

export const teacherAnalyticsService = new TeacherAnalyticsService();

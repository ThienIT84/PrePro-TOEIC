import { supabase } from '@/integrations/supabase/client';

export interface ClassInfo {
  id: string;
  teacher_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  student_count: number;
  avg_score: number;
  completion_rate: number;
  students: Array<{
    id: string;
    name: string;
    avg_score: number;
    last_activity: string;
  }>;
}

export interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
  status: 'active' | 'inactive' | 'suspended';
}

class ClassesService {
  /**
   * Get all classes for a teacher
   */
  async getClasses(teacherId: string): Promise<ClassInfo[]> {
    try {
      const { data: classes, error } = await supabase
        .from('classes')
        .select(`
          id,
          teacher_id,
          name,
          description,
          created_at,
          updated_at
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching classes:', error);
        return [];
      }

      // Get class statistics for each class
      const classesWithStats = await Promise.all(
        classes.map(async (classData) => {
          const stats = await this.getClassStats(classData.id);
          return {
            ...classData,
            ...stats
          };
        })
      );

      return classesWithStats;
    } catch (error) {
      console.error('Error in getClasses:', error);
      return [];
    }
  }

  /**
   * Get class statistics
   */
  private async getClassStats(classId: string) {
    try {
      // Get students in this class
      const { data: classStudents, error: classStudentsError } = await supabase
        .from('class_students')
        .select(`
          student_id,
          profiles!class_students_student_id_fkey(
            user_id,
            name
          )
        `)
        .eq('class_id', classId)
        .eq('status', 'active');

      if (classStudentsError) {
        console.error('Error fetching class students:', classStudentsError);
        return {
          student_count: 0,
          avg_score: 0,
          completion_rate: 0,
          students: []
        };
      }

      const studentIds = classStudents?.map(cs => cs.student_id) || [];
      const studentCount = studentIds.length;

      if (studentCount === 0) {
        return {
          student_count: 0,
          avg_score: 0,
          completion_rate: 0,
          students: []
        };
      }

      // Get student attempts and exam sessions
      const [attemptsResult, examSessionsResult] = await Promise.all([
        supabase
          .from('attempts')
          .select('user_id, correct, created_at')
          .in('user_id', studentIds),
        supabase
          .from('exam_sessions')
          .select('user_id, score, completed_at, total_questions, correct_answers')
          .in('user_id', studentIds)
          .eq('status', 'completed')
      ]);

      const attempts = attemptsResult.data || [];
      const examSessions = examSessionsResult.data || [];

      // Calculate statistics for each student
      const studentsWithStats = classStudents?.map(classStudent => {
        const profile = classStudent.profiles;
        if (!profile) return null;

        const studentId = profile.user_id;
        const studentAttempts = attempts.filter(a => a.user_id === studentId);
        const studentExams = examSessions.filter(e => e.user_id === studentId);

        const correctAttempts = studentAttempts.filter(a => a.correct);
        const totalQuestions = studentAttempts.length +
          studentExams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0);
        const totalCorrect = correctAttempts.length +
          studentExams.reduce((sum, exam) => sum + (exam.correct_answers || 0), 0);

        const avgScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

        const lastActivity = studentAttempts.length > 0 ?
          studentAttempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at :
          studentExams.length > 0 ?
            studentExams.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at :
            new Date().toISOString();

        return {
          id: studentId,
          name: profile.name || 'Unknown',
          avg_score: Math.round(avgScore),
          last_activity: lastActivity
        };
      }).filter(Boolean) || [];

      // Calculate class averages
      const totalClassQuestions = attempts.length + 
        examSessions.reduce((sum, exam) => sum + (exam.total_questions || 0), 0);
      const totalClassCorrect = attempts.filter(a => a.correct).length +
        examSessions.reduce((sum, exam) => sum + (exam.correct_answers || 0), 0);

      const classAvgScore = totalClassQuestions > 0 ? 
        Math.round((totalClassCorrect / totalClassQuestions) * 100) : 0;

      const classCompletionRate = Math.min(100, Math.round((totalClassQuestions / (studentCount * 50)) * 100));

      return {
        student_count: studentCount,
        avg_score: classAvgScore,
        completion_rate: classCompletionRate,
        students: studentsWithStats
      };
    } catch (error) {
      console.error('Error in getClassStats:', error);
      return {
        student_count: 0,
        avg_score: 0,
        completion_rate: 0,
        students: []
      };
    }
  }

  /**
   * Create a new class
   */
  async createClass(teacherId: string, name: string, description: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('classes')
        .insert({
          teacher_id: teacherId,
          name,
          description
        });

      if (error) {
        console.error('Error creating class:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createClass:', error);
      return false;
    }
  }

  /**
   * Update a class
   */
  async updateClass(classId: string, name: string, description: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', classId);

      if (error) {
        console.error('Error updating class:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateClass:', error);
      return false;
    }
  }

  /**
   * Delete a class
   */
  async deleteClass(classId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) {
        console.error('Error deleting class:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteClass:', error);
      return false;
    }
  }

  /**
   * Add student to class
   */
  async addStudentToClass(classId: string, studentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('class_students')
        .insert({
          class_id: classId,
          student_id: studentId,
          status: 'active'
        });

      if (error) {
        console.error('Error adding student to class:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addStudentToClass:', error);
      return false;
    }
  }

  /**
   * Remove student from class
   */
  async removeStudentFromClass(classId: string, studentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (error) {
        console.error('Error removing student from class:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeStudentFromClass:', error);
      return false;
    }
  }

  /**
   * Get all students for a teacher (can be in multiple classes)
   */
  async getAvailableStudents(teacherId: string, excludeClassId?: string): Promise<Array<{
    id: string;
    name: string;
    avg_score: number;
    last_activity: string;
    is_in_class: boolean;
  }>> {
    try {
      // Get teacher's students
      const { data: teacherStudents } = await supabase
        .from('teacher_students')
        .select('student_id')
        .eq('teacher_id', teacherId)
        .eq('status', 'active');

      if (!teacherStudents || teacherStudents.length === 0) {
        return [];
      }

      const studentIds = teacherStudents.map(ts => ts.student_id);

      // Get all students
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', studentIds);

      const { data: attempts } = await supabase
        .from('attempts')
        .select('user_id, correct, created_at')
        .in('user_id', studentIds);

      // Get students already in the specific class (if excludeClassId is provided)
      let studentsInClass: string[] = [];
      if (excludeClassId) {
        const { data: classStudents } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', excludeClassId)
          .eq('status', 'active');
        
        studentsInClass = classStudents?.map(cs => cs.student_id) || [];
      }

      return profiles?.map(profile => {
        const studentAttempts = attempts?.filter(a => a.user_id === profile.user_id) || [];
        const avgScore = studentAttempts.length > 0 ?
          Math.round((studentAttempts.filter(a => a.correct).length / studentAttempts.length) * 100) : 0;

        const lastActivity = studentAttempts.length > 0 ?
          studentAttempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at :
          new Date().toISOString();

        return {
          id: profile.user_id,
          name: profile.name || 'Unknown',
          avg_score: avgScore,
          last_activity: lastActivity,
          is_in_class: studentsInClass.includes(profile.user_id)
        };
      }) || [];
    } catch (error) {
      console.error('Error in getAvailableStudents:', error);
      return [];
    }
  }
}

export const classesService = new ClassesService();

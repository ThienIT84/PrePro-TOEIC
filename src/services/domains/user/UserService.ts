import { BaseService } from '../BaseService';
import { UserModel } from '@/models/entities';
import { Profile, AppRole } from '@/types';

/**
 * User Service - Xử lý tất cả operations liên quan đến Users
 * Sử dụng BaseService và không thay đổi Supabase
 */
export class UserService extends BaseService {

  /**
   * Get all profiles với filters
   */
  async getProfiles(filters?: {
    role?: AppRole;
    search?: string;
  }): Promise<{ data: UserModel[] | null; error: unknown }> {
    this.log('getProfiles', filters);

    try {
      let query = this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.role) {
          query = query.eq('role', filters.role);
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'getProfiles');
      }

      // Convert to UserModel instances
      const userModels = (data || []).map(p => new UserModel(p as Profile));
      return { data: userModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<{ data: UserModel | null; error: unknown }> {
    this.log('getProfileByUserId', { userId });

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        this.handleError(error, 'getProfileByUserId');
      }

      const userModel = data ? new UserModel(data as Profile) : null;
      return { data: userModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get profile by ID
   */
  async getProfileById(id: string): Promise<{ data: UserModel | null; error: unknown }> {
    this.log('getProfileById', { id });

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.handleError(error, 'getProfileById');
      }

      const userModel = data ? new UserModel(data as Profile) : null;
      return { data: userModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create new profile
   */
  async createProfile(profileData: Partial<Profile>): Promise<{ data: UserModel | null; error: unknown }> {
    this.log('createProfile', { user_id: profileData.user_id });

    try {
      // Validate required fields
      const requiredFields = ['user_id', 'role', 'target_score', 'locales'];
      const validationErrors = this.validateRequired(profileData, requiredFields);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Create UserModel instance for validation
      const userModel = new UserModel(profileData as Profile);
      const modelValidationErrors = userModel.validate();
      
      if (modelValidationErrors.length > 0) {
        throw new Error(`Model validation failed: ${modelValidationErrors.join(', ')}`);
      }

      const { data, error } = await this.insertData('profiles', profileData);

      if (error) {
        this.handleError(error, 'createProfile');
      }

      const newUserModel = data ? new UserModel(data) : null;
      return { data: newUserModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update existing profile
   */
  async updateProfile(id: string, updates: Partial<Profile>): Promise<{ data: UserModel | null; error: unknown }> {
    this.log('updateProfile', { id, updates });

    try {
      // Get current profile for validation
      const { data: currentData } = await this.getProfileById(id);
      if (!currentData) {
        throw new Error('Profile not found');
      }

      // Create updated UserModel for validation
      const updatedData = { ...currentData.toJSON(), ...updates };
      const userModel = new UserModel(updatedData);
      const validationErrors = userModel.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const { data, error } = await this.updateData('profiles', id, updates);

      if (error) {
        this.handleError(error, 'updateProfile');
      }

      const updatedUserModel = data ? new UserModel(data) : null;
      return { data: updatedUserModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update profile by user ID
   */
  async updateProfileByUserId(userId: string, updates: Partial<Profile>): Promise<{ data: UserModel | null; error: unknown }> {
    this.log('updateProfileByUserId', { userId, updates });

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'updateProfileByUserId');
      }

      const updatedUserModel = data ? new UserModel(data as Profile) : null;
      return { data: updatedUserModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(id: string): Promise<{ error: unknown }> {
    this.log('deleteProfile', { id });

    try {
      const { error } = await this.deleteData('profiles', id);

      if (error) {
        this.handleError(error, 'deleteProfile');
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * Search profiles
   */
  async searchProfiles(searchTerm: string): Promise<{ data: UserModel[] | null; error: unknown }> {
    this.log('searchProfiles', { searchTerm });

    try {
      const { data, error } = await this.searchData(
        'profiles',
        searchTerm,
        ['name']
      );

      if (error) {
        this.handleError(error, 'searchProfiles');
      }

      const userModels = (data || []).map(p => new UserModel(p as Profile));
      return { data: userModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get profiles by role
   */
  async getProfilesByRole(role: AppRole): Promise<{ data: UserModel[] | null; error: unknown }> {
    this.log('getProfilesByRole', { role });

    return this.getProfiles({ role });
  }

  /**
   * Get students
   */
  async getStudents(): Promise<{ data: UserModel[] | null; error: unknown }> {
    this.log('getStudents');

    return this.getProfilesByRole('student');
  }

  /**
   * Get teachers
   */
  async getTeachers(): Promise<{ data: UserModel[] | null; error: unknown }> {
    this.log('getTeachers');

    return this.getProfilesByRole('teacher');
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{ data: unknown; error: unknown }> {
    this.log('getUserStats');

    try {
      const { data: profiles, error } = await this.getProfiles();
      
      if (error) {
        this.handleError(error, 'getUserStats');
      }

      const userModels = (profiles || []).map(p => new UserModel(p as Profile));
      
      const stats = {
        totalUsers: userModels.length,
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
        averageTargetScore: userModels.reduce((sum, u) => sum + u.target_score, 0) / userModels.length || 0
      };

      userModels.forEach(u => {
        // Count by level
        const level = u.getUserLevel();
        stats.byLevel[level]++;

        // Count by target score range
        if (u.target_score < 500) {
          stats.byTargetScore['0-500']++;
        } else if (u.target_score < 700) {
          stats.byTargetScore['500-700']++;
        } else if (u.target_score < 900) {
          stats.byTargetScore['700-900']++;
        } else {
          stats.byTargetScore['900+']++;
        }
      });

      return { data: stats, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get profiles count
   */
  async getProfilesCount(filters?: {
    role?: AppRole;
  }): Promise<{ count: number | null; error: unknown }> {
    this.log('getProfilesCount', filters);

    return this.countData('profiles', filters);
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<{ exists: boolean; error: unknown }> {
    this.log('userExists', { userId });

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        this.handleError(error, 'userExists');
      }

      return { exists: !!data, error: null };

    } catch (error) {
      return { exists: false, error };
    }
  }

  /**
   * Get user's exam history
   */
  async getUserExamHistory(userId: string): Promise<{ data: unknown[] | null; error: unknown }> {
    this.log('getUserExamHistory', { userId });

    try {
      const { data, error } = await this.supabase
        .from('exam_sessions')
        .select(`
          *,
          exam_sets (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getUserExamHistory');
      }

      return { data: data || [], error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user's performance statistics
   */
  async getUserPerformanceStats(userId: string): Promise<{ data: unknown; error: unknown }> {
    this.log('getUserPerformanceStats', { userId });

    try {
      // First get user's exam sessions
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('exam_sessions')
        .select('id')
        .eq('user_id', userId);

      if (sessionsError) {
        this.handleError(sessionsError, 'getUserPerformanceStats');
      }

      const sessionIds = sessions?.map(s => s.id) || [];

      if (sessionIds.length === 0) {
        return {
          data: {
            totalAttempts: 0,
            correctAnswers: 0,
            accuracy: 0,
            averageTime: 0,
            byPart: {},
            byDifficulty: {
              easy: { attempts: 0, correct: 0 },
              medium: { attempts: 0, correct: 0 },
              hard: { attempts: 0, correct: 0 }
            }
          },
          error: null
        };
      }

      // Get exam attempts for these sessions
      const { data: attempts, error: attemptsError } = await this.supabase
        .from('exam_attempts')
        .select(`
          *,
          questions (*)
        `)
        .in('session_id', sessionIds);

      if (attemptsError) {
        this.handleError(attemptsError, 'getUserPerformanceStats');
      }

      const stats = {
        totalAttempts: attempts?.length || 0,
        correctAnswers: attempts?.filter(a => a.is_correct).length || 0,
        accuracy: 0,
        averageTime: 0,
        byPart: {} as Record<number, { attempts: number; correct: number }>,
        byDifficulty: {
          easy: { attempts: 0, correct: 0 },
          medium: { attempts: 0, correct: 0 },
          hard: { attempts: 0, correct: 0 }
        }
      };

      if (attempts && attempts.length > 0) {
        stats.accuracy = (stats.correctAnswers / stats.totalAttempts) * 100;
        stats.averageTime = attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0) / attempts.length;

        // Group by part and difficulty
        attempts.forEach(attempt => {
          const question = attempt.questions as any;
          if (question) {
            // By part
            if (!stats.byPart[question.part]) {
              stats.byPart[question.part] = { attempts: 0, correct: 0 };
            }
            stats.byPart[question.part].attempts++;
            if (attempt.is_correct) {
              stats.byPart[question.part].correct++;
            }

            // By difficulty
            const difficulty = question.difficulty as 'easy' | 'medium' | 'hard';
            if (difficulty && stats.byDifficulty[difficulty]) {
              stats.byDifficulty[difficulty].attempts++;
              if (attempt.is_correct) {
                stats.byDifficulty[difficulty].correct++;
              }
            }
          }
        });
      }

      return { data: stats, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }
}

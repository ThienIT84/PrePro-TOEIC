import { supabase } from '@/integrations/supabase/client';
import { AlertItem } from './teacherAnalytics';

export interface AlertRule {
  id: string;
  teacher_id: string;
  name: string;
  description: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  condition: string;
  threshold: number;
  is_enabled: boolean;
  notification_type: 'in_app' | 'email' | 'both';
  created_at: string;
  updated_at: string;
}

export interface AlertSettings {
  email_notifications: boolean;
  in_app_notifications: boolean;
  alert_frequency: 'immediate' | 'hourly' | 'daily';
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

class AlertsService {
  /**
   * Get alerts for a teacher
   */
  async getAlerts(teacherId: string): Promise<AlertItem[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          type,
          title,
          message,
          student_id,
          is_read,
          created_at
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }

      // Get student names separately
      const studentIds = data?.map(alert => alert.student_id) || [];
      let studentNames: { [key: string]: string } = {};
      
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', studentIds);
        
        studentNames = profiles?.reduce((acc, profile) => {
          acc[profile.user_id] = profile.name || 'Unknown Student';
          return acc;
        }, {} as { [key: string]: string }) || {};
      }

      return data?.map(alert => ({
        id: alert.id,
        type: alert.type as 'success' | 'warning' | 'info' | 'danger',
        title: alert.title,
        message: alert.message,
        student_id: alert.student_id,
        student_name: studentNames[alert.student_id] || 'Unknown Student',
        timestamp: alert.created_at,
        is_read: alert.is_read
      })) || [];
    } catch (error) {
      console.error('Error in getAlerts:', error);
      return [];
    }
  }

  /**
   * Get alert rules for a teacher
   */
  async getAlertRules(teacherId: string): Promise<AlertRule[]> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alert rules:', error);
        return [];
      }

      return data?.map(rule => ({
        ...rule,
        type: rule.type as 'success' | 'warning' | 'info' | 'danger',
        notification_type: rule.notification_type as 'in_app' | 'email' | 'both'
      })) || [];
    } catch (error) {
      console.error('Error in getAlertRules:', error);
      return [];
    }
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) {
        console.error('Error marking alert as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * Mark all alerts as read
   */
  async markAllAsRead(teacherId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('teacher_id', teacherId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all alerts as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) {
        console.error('Error deleting alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAlert:', error);
      return false;
    }
  }

  /**
   * Toggle alert rule
   */
  async toggleRule(ruleId: string, isEnabled: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ 
          is_enabled: isEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      if (error) {
        console.error('Error toggling rule:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in toggleRule:', error);
      return false;
    }
  }

  /**
   * Create alert rule
   */
  async createRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .insert(rule);

      if (error) {
        console.error('Error creating rule:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createRule:', error);
      return false;
    }
  }

  /**
   * Generate alerts based on student data
   */
  async generateAlerts(teacherId: string, students: any[]): Promise<void> {
    try {
      // Get enabled rules
      const rules = await this.getAlertRules(teacherId);
      const enabledRules = rules.filter(rule => rule.is_enabled);

      if (enabledRules.length === 0) {
        console.log('No enabled rules found for teacher:', teacherId);
        return;
      }

      console.log(`Generating alerts for ${students.length} students with ${enabledRules.length} rules`);

      // OPTIMIZATION: Batch fetch all existing alerts at once
      const studentIds = students.map(s => s.id || s.user_id || s.student_id).filter(Boolean);
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('id, student_id, title')
        .eq('teacher_id', teacherId)
        .in('student_id', studentIds)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Create a map for quick lookup: "studentId:title" -> exists
      const alertsMap = new Set<string>();
      (existingAlerts || []).forEach(alert => {
        alertsMap.add(`${alert.student_id}:${alert.title}`);
      });

      // Collect alerts to insert in batch
      const alertsToInsert: any[] = [];

      for (const student of students) {
        const studentId = student.id || student.user_id || student.student_id;
        if (!studentId) continue;

        for (const rule of enabledRules) {
          const alertData = this.checkRule(student, rule);
          if (alertData) {
            const alertKey = `${studentId}:${alertData.title}`;
            // Check if alert already exists
            if (!alertsMap.has(alertKey)) {
              alertsToInsert.push({
                teacher_id: teacherId,
                student_id: studentId,
                type: rule.type,
                title: alertData.title,
                message: alertData.message,
                is_read: false
              });
              // Add to set to prevent duplicates in current batch
              alertsMap.add(alertKey);
            }
          }
        }
      }

      // Batch insert all alerts at once
      if (alertsToInsert.length > 0) {
        const { error } = await supabase
          .from('alerts')
          .insert(alertsToInsert);

        if (error) {
          console.error('Error batch creating alerts:', error);
        } else {
          console.log(`✅ Created ${alertsToInsert.length} alerts in batch`);
        }
      } else {
        console.log('No new alerts to create');
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }

  /**
   * Check rule and return alert data if condition is met (no DB call)
   */
  private checkRule(student: any, rule: AlertRule): { title: string; message: string } | null {
    const studentName = student.name || 'Unknown';
    
    switch (rule.condition) {
      case 'inactive_days': {
        const lastActivity = new Date(student.last_activity);
        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActivity > rule.threshold) {
          return {
            title: 'Học viên không hoạt động',
            message: `${studentName} đã không hoạt động trong ${daysSinceActivity} ngày`
          };
        }
        break;
      }

      case 'score_below':
        if (student.avg_score < rule.threshold) {
          return {
            title: 'Điểm số thấp',
            message: `${studentName} đạt ${student.avg_score.toFixed(1)}% trong các hoạt động gần đây`
          };
        }
        break;

      case 'score_above':
        if (student.avg_score > rule.threshold) {
          return {
            title: 'Điểm số xuất sắc!',
            message: `${studentName} đạt ${student.avg_score.toFixed(1)}% - Làm tốt lắm!`
          };
        }
        break;

      case 'completion_low':
        if (student.completion_rate < rule.threshold) {
          return {
            title: 'Tỷ lệ hoàn thành thấp',
            message: `${studentName} chỉ có ${student.completion_rate.toFixed(1)}% tỷ lệ hoàn thành`
          };
        }
        break;

      case 'streak_low':
        if (student.streak_days < rule.threshold) {
          return {
            title: 'Chuỗi hoạt động thấp',
            message: `${studentName} chỉ có ${student.streak_days} ngày liên tiếp hoạt động`
          };
        }
        break;

      default:
        break;
    }

    return null;
  }

  /**
   * Check rule and create alert if condition is met (DEPRECATED - keeping for backwards compatibility)
   */
  private async checkRuleAndCreateAlert(teacherId: string, student: any, rule: AlertRule): Promise<void> {
    try {
      // Ensure student has required fields
      if (!student.id && !student.user_id && !student.student_id) {
        console.error('Student missing ID:', student);
        return;
      }

      const studentId = student.id || student.user_id || student.student_id;
      let shouldCreateAlert = false;
      let alertTitle = '';
      let alertMessage = '';

      console.log(`Checking rule: ${rule.name} (${rule.condition}) for student ${student.name}`);
      console.log(`Student data: avg_score=${student.avg_score}, completion_rate=${student.completion_rate}, streak_days=${student.streak_days}, last_activity=${student.last_activity}`);

      switch (rule.condition) {
        case 'inactive_days': {
          const lastActivity = new Date(student.last_activity);
          const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`Inactive days check: ${daysSinceActivity} days since last activity, threshold: ${rule.threshold}`);
          if (daysSinceActivity > rule.threshold) {
            shouldCreateAlert = true;
            alertTitle = 'Học viên không hoạt động';
            alertMessage = `${student.name} đã không hoạt động trong ${daysSinceActivity} ngày`;
            console.log(`✅ Inactive alert triggered: ${daysSinceActivity} > ${rule.threshold}`);
          }
          break;
        }

        case 'score_below':
          console.log(`Score below check: ${student.avg_score} < ${rule.threshold}?`);
          if (student.avg_score < rule.threshold) {
            shouldCreateAlert = true;
            alertTitle = 'Điểm số thấp';
            alertMessage = `${student.name} đạt ${student.avg_score.toFixed(1)}% trong các hoạt động gần đây`;
            console.log(`✅ Low score alert triggered: ${student.avg_score} < ${rule.threshold}`);
          }
          break;

        case 'score_above':
          console.log(`Score above check: ${student.avg_score} > ${rule.threshold}?`);
          if (student.avg_score > rule.threshold) {
            shouldCreateAlert = true;
            alertTitle = 'Điểm số xuất sắc!';
            alertMessage = `${student.name} đạt ${student.avg_score.toFixed(1)}% - Làm tốt lắm!`;
            console.log(`✅ High score alert triggered: ${student.avg_score} > ${rule.threshold}`);
          }
          break;

        case 'completion_low':
          console.log(`Completion low check: ${student.completion_rate} < ${rule.threshold}?`);
          if (student.completion_rate < rule.threshold) {
            shouldCreateAlert = true;
            alertTitle = 'Tỷ lệ hoàn thành thấp';
            alertMessage = `${student.name} chỉ có ${student.completion_rate.toFixed(1)}% tỷ lệ hoàn thành`;
            console.log(`✅ Low completion alert triggered: ${student.completion_rate} < ${rule.threshold}`);
          }
          break;

        case 'streak_low':
          console.log(`Streak low check: ${student.streak_days} < ${rule.threshold}?`);
          if (student.streak_days < rule.threshold) {
            shouldCreateAlert = true;
            alertTitle = 'Chuỗi hoạt động thấp';
            alertMessage = `${student.name} chỉ có ${student.streak_days} ngày liên tiếp hoạt động`;
            console.log(`✅ Low streak alert triggered: ${student.streak_days} < ${rule.threshold}`);
          }
          break;

        default:
          console.log(`Unknown rule condition: ${rule.condition}`);
          break;
      }

      if (shouldCreateAlert) {
        // Check if similar alert already exists recently (within 24 hours)
        const { data: existingAlerts } = await supabase
          .from('alerts')
          .select('id')
          .eq('teacher_id', teacherId)
          .eq('student_id', studentId)
          .eq('title', alertTitle)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!existingAlerts || existingAlerts.length === 0) {
          const { error } = await supabase
            .from('alerts')
            .insert({
              teacher_id: teacherId,
              student_id: studentId,
              type: rule.type,
              title: alertTitle,
              message: alertMessage,
              is_read: false
            });

          if (error) {
            console.error('Error creating alert:', error);
          } else {
            console.log(`Created alert: ${alertTitle} for student ${student.name} (ID: ${studentId})`);
          }
        } else {
          console.log(`Alert already exists: ${alertTitle} for student ${student.name} (ID: ${studentId})`);
        }
      }
    } catch (error) {
      console.error('Error checking rule:', error);
    }
  }

  /**
   * Clear all alerts for a teacher (useful for testing)
   */
  async clearAllAlerts(teacherId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('teacher_id', teacherId);

      if (error) {
        console.error('Error clearing alerts:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearAllAlerts:', error);
      return false;
    }
  }

  /**
   * Get default alert rules for a teacher
   */
  async createDefaultRules(teacherId: string): Promise<void> {
    try {
      const defaultRules = [
        {
          teacher_id: teacherId,
          name: 'Cảnh báo học viên không hoạt động',
          description: 'Cảnh báo khi học viên không hoạt động hơn 7 ngày',
          type: 'warning' as const,
          condition: 'inactive_days',
          threshold: 7,
          is_enabled: true,
          notification_type: 'both' as const
        },
        {
          teacher_id: teacherId,
          name: 'Cảnh báo điểm số thấp',
          description: 'Cảnh báo khi học viên đạt điểm dưới 50%',
          type: 'danger' as const,
          condition: 'score_below',
          threshold: 50,
          is_enabled: true,
          notification_type: 'in_app' as const
        },
        {
          teacher_id: teacherId,
          name: 'Cảnh báo điểm số xuất sắc',
          description: 'Cảnh báo khi học viên đạt điểm trên 90%',
          type: 'success' as const,
          condition: 'score_above',
          threshold: 90,
          is_enabled: true,
          notification_type: 'both' as const
        },
        {
          teacher_id: teacherId,
          name: 'Cảnh báo tỷ lệ hoàn thành thấp',
          description: 'Cảnh báo khi tỷ lệ hoàn thành của học viên dưới 30%',
          type: 'warning' as const,
          condition: 'completion_low',
          threshold: 30,
          is_enabled: true,
          notification_type: 'in_app' as const
        }
      ];

      // Check if rules already exist
      const { data: existingRules } = await supabase
        .from('alert_rules')
        .select('id')
        .eq('teacher_id', teacherId);

      if (!existingRules || existingRules.length === 0) {
        await supabase
          .from('alert_rules')
          .insert(defaultRules);
      }
    } catch (error) {
      console.error('Error creating default rules:', error);
    }
  }
}

export const alertsService = new AlertsService();

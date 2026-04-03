/**
 * Export all domain services
 */

// Base Service
export { BaseService } from './BaseService';

// Question Domain
export { QuestionService } from './question/QuestionService';

// Exam Domain
export { ExamService } from './exam/ExamService';

// User Domain
export { UserService } from './user/UserService';

// Analytics Domain
export { AnalyticsService } from './analytics/AnalyticsService';

// Media Domain
export { MediaService } from './media/MediaService';

// Import services for ServiceFactory
import { QuestionService } from './question/QuestionService';
import { ExamService } from './exam/ExamService';
import { UserService } from './user/UserService';
import { AnalyticsService } from './analytics/AnalyticsService';
import { MediaService } from './media/MediaService';

// Service Factory
export class ServiceFactory {
  private static instances: Map<string, unknown> = new Map();

  static getQuestionService(): QuestionService {
    if (!this.instances.has('question')) {
      this.instances.set('question', new QuestionService());
    }
    return this.instances.get('question') as QuestionService;
  }

  static getExamService(): ExamService {
    if (!this.instances.has('exam')) {
      this.instances.set('exam', new ExamService());
    }
    return this.instances.get('exam') as ExamService;
  }

  static getUserService(): UserService {
    if (!this.instances.has('user')) {
      this.instances.set('user', new UserService());
    }
    return this.instances.get('user') as UserService;
  }

  static getAnalyticsService(): AnalyticsService {
    if (!this.instances.has('analytics')) {
      this.instances.set('analytics', new AnalyticsService());
    }
    return this.instances.get('analytics') as AnalyticsService;
  }

  static getMediaService(): MediaService {
    if (!this.instances.has('media')) {
      this.instances.set('media', new MediaService());
    }
    return this.instances.get('media') as MediaService;
  }

  static getAllServices() {
    return {
      question: this.getQuestionService(),
      exam: this.getExamService(),
      user: this.getUserService(),
      analytics: this.getAnalyticsService(),
      media: this.getMediaService()
    };
  }

  static clearInstances() {
    this.instances.clear();
  }

  static getInstanceCount(): number {
    return this.instances.size;
  }

  static hasService(serviceName: string): boolean {
    return this.instances.has(serviceName);
  }
}

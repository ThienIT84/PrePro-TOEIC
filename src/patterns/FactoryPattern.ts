// Factory Pattern Implementation for MVC Architecture

export interface ComponentFactory<T> {
  create(type: string, props?: unknown): T;
  register(type: string, creator: (props?: unknown) => T): void;
  unregister(type: string): void;
  getRegisteredTypes(): string[];
}

export interface ServiceFactory<T> {
  create(type: string, config?: unknown): T;
  register(type: string, creator: (config?: unknown) => T): void;
  unregister(type: string): void;
  getRegisteredTypes(): string[];
}

export interface ControllerFactory<T> {
  create(type: string, params?: unknown): T;
  register(type: string, creator: (params?: unknown) => T): void;
  unregister(type: string): void;
  getRegisteredTypes(): string[];
}

// Base Factory Implementation
export abstract class BaseFactory<T> {
  protected creators: Map<string, (params?: unknown) => T> = new Map();
  protected instances: Map<string, T> = new Map();
  protected singleton: boolean = false;

  constructor(singleton: boolean = false) {
    this.singleton = singleton;
  }

  create(type: string, params?: unknown): T {
    if (!this.creators.has(type)) {
      throw new Error(`Type ${type} is not registered`);
    }

    if (this.singleton && this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    const creator = this.creators.get(type)!;
    const instance = creator(params);

    if (this.singleton) {
      this.instances.set(type, instance);
    }

    return instance;
  }

  register(type: string, creator: (params?: unknown) => T): void {
    this.creators.set(type, creator);
  }

  unregister(type: string): void {
    this.creators.delete(type);
    this.instances.delete(type);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.creators.keys());
  }

  hasType(type: string): boolean {
    return this.creators.has(type);
  }

  clear(): void {
    this.creators.clear();
    this.instances.clear();
  }
}

// Component Factory Implementation
export class ComponentFactoryImpl<T> extends BaseFactory<T> implements ComponentFactory<T> {
  constructor(singleton: boolean = true) {
    super(singleton);
  }
}

// Service Factory Implementation
export class ServiceFactoryImpl<T> extends BaseFactory<T> implements ServiceFactory<T> {
  constructor(singleton: boolean = true) {
    super(singleton);
  }
}

// Controller Factory Implementation
export class ControllerFactoryImpl<T> extends BaseFactory<T> implements ControllerFactory<T> {
  constructor(singleton: boolean = true) {
    super(singleton);
  }
}

// Abstract Factory for MVC Components
export abstract class AbstractMVCFactory {
  protected componentFactory: ComponentFactory<unknown>;
  protected serviceFactory: ServiceFactory<unknown>;
  protected controllerFactory: ControllerFactory<unknown>;

  constructor() {
    this.componentFactory = new ComponentFactoryImpl();
    this.serviceFactory = new ServiceFactoryImpl();
    this.controllerFactory = new ControllerFactoryImpl();
  }

  abstract createComponent(type: string, props?: unknown): unknown;
  abstract createService(type: string, config?: unknown): unknown;
  abstract createController(type: string, params?: unknown): unknown;
}

// Concrete MVC Factory Implementation
export class TOEICMVCFactory extends AbstractMVCFactory {
  constructor() {
    super();
    this.registerAllTypes();
  }

  private registerAllTypes(): void {
    // Register Components
    this.componentFactory.register('TOEICQuestionCreator', (props) => {
      const { TOEICQuestionCreatorMVC } = require('@/views/components/TOEICQuestionCreatorMVC');
      return React.createElement(TOEICQuestionCreatorMVC, props);
    });

    this.componentFactory.register('TOEICBulkUpload', (props) => {
      const { TOEICBulkUploadMVC } = require('@/views/components/TOEICBulkUploadMVC');
      return React.createElement(TOEICBulkUploadMVC, props);
    });

    this.componentFactory.register('PassageManager', (props) => {
      const { PassageManagerMVC } = require('@/views/components/PassageManagerMVC');
      return React.createElement(PassageManagerMVC, props);
    });

    this.componentFactory.register('ExamReview', (props) => {
      const { ExamReviewMVC } = require('@/views/components/ExamReviewMVC');
      return React.createElement(ExamReviewMVC, props);
    });

    // Register Services
    this.serviceFactory.register('QuestionService', (config) => {
      const { QuestionService } = require('@/services/domains/QuestionService');
      return new QuestionService(config);
    });

    this.serviceFactory.register('ExamService', (config) => {
      const { ExamService } = require('@/services/domains/ExamService');
      return new ExamService(config);
    });

    this.serviceFactory.register('UserService', (config) => {
      const { UserService } = require('@/services/domains/UserService');
      return new UserService(config);
    });

    this.serviceFactory.register('AnalyticsService', (config) => {
      const { AnalyticsService } = require('@/services/domains/AnalyticsService');
      return new AnalyticsService(config);
    });

    this.serviceFactory.register('MediaService', (config) => {
      const { MediaService } = require('@/services/domains/MediaService');
      return new MediaService(config);
    });

    // Register Controllers
    this.controllerFactory.register('TOEICQuestionCreatorController', (params) => {
      const { TOEICQuestionCreatorController } = require('@/controllers/question/TOEICQuestionCreatorController');
      return new TOEICQuestionCreatorController(params);
    });

    this.controllerFactory.register('TOEICBulkUploadController', (params) => {
      const { TOEICBulkUploadController } = require('@/controllers/upload/TOEICBulkUploadController');
      return new TOEICBulkUploadController(params);
    });

    this.controllerFactory.register('PassageManagerController', (params) => {
      const { PassageManagerController } = require('@/controllers/passage/PassageManagerController');
      return new PassageManagerController(params);
    });

    this.controllerFactory.register('ExamReviewController', (params) => {
      const { ExamReviewController } = require('@/controllers/exam/ExamReviewController');
      return new ExamReviewController(params);
    });
  }

  createComponent(type: string, props?: unknown): unknown {
    return this.componentFactory.create(type, props);
  }

  createService(type: string, config?: unknown): unknown {
    return this.serviceFactory.create(type, config);
  }

  createController(type: string, params?: unknown): unknown {
    return this.controllerFactory.create(type, params);
  }

  // Utility methods
  getAvailableComponents(): string[] {
    return this.componentFactory.getRegisteredTypes();
  }

  getAvailableServices(): string[] {
    return this.serviceFactory.getRegisteredTypes();
  }

  getAvailableControllers(): string[] {
    return this.controllerFactory.getRegisteredTypes();
  }

  // Dynamic registration
  registerComponent(type: string, creator: (props?: unknown) => unknown): void {
    this.componentFactory.register(type, creator);
  }

  registerService(type: string, creator: (config?: unknown) => unknown): void {
    this.serviceFactory.register(type, creator);
  }

  registerController(type: string, creator: (params?: unknown) => unknown): void {
    this.controllerFactory.register(type, creator);
  }
}

// Factory Registry for Global Access
export class FactoryRegistry {
  private static instance: FactoryRegistry;
  private factories: Map<string, AbstractMVCFactory> = new Map();

  private constructor() {
    this.registerDefaultFactories();
  }

  static getInstance(): FactoryRegistry {
    if (!FactoryRegistry.instance) {
      FactoryRegistry.instance = new FactoryRegistry();
    }
    return FactoryRegistry.instance;
  }

  private registerDefaultFactories(): void {
    this.registerFactory('TOEIC', new TOEICMVCFactory());
  }

  registerFactory(name: string, factory: AbstractMVCFactory): void {
    this.factories.set(name, factory);
  }

  getFactory(name: string): AbstractMVCFactory | null {
    return this.factories.get(name) || null;
  }

  getTOEICFactory(): TOEICMVCFactory {
    return this.getFactory('TOEIC') as TOEICMVCFactory;
  }

  createComponent(factoryName: string, type: string, props?: unknown): unknown {
    const factory = this.getFactory(factoryName);
    if (!factory) {
      throw new Error(`Factory ${factoryName} not found`);
    }
    return factory.createComponent(type, props);
  }

  createService(factoryName: string, type: string, config?: unknown): unknown {
    const factory = this.getFactory(factoryName);
    if (!factory) {
      throw new Error(`Factory ${factoryName} not found`);
    }
    return factory.createService(type, config);
  }

  createController(factoryName: string, type: string, params?: unknown): unknown {
    const factory = this.getFactory(factoryName);
    if (!factory) {
      throw new Error(`Factory ${factoryName} not found`);
    }
    return factory.createController(type, params);
  }

  getAvailableFactories(): string[] {
    return Array.from(this.factories.keys());
  }
}

// React Hook for Factory Usage
export const useFactory = (factoryName: string = 'TOEIC') => {
  const registry = FactoryRegistry.getInstance();
  const factory = registry.getFactory(factoryName);

  const createComponent = React.useCallback((type: string, props?: unknown) => {
    return registry.createComponent(factoryName, type, props);
  }, [factoryName]);

  const createService = React.useCallback((type: string, config?: unknown) => {
    return registry.createService(factoryName, type, config);
  }, [factoryName]);

  const createController = React.useCallback((type: string, params?: unknown) => {
    return registry.createController(factoryName, type, params);
  }, [factoryName]);

  return {
    factory,
    createComponent,
    createService,
    createController,
    availableComponents: factory?.getAvailableComponents() || [],
    availableServices: factory?.getAvailableServices() || [],
    availableControllers: factory?.getAvailableControllers() || []
  };
};

// Export factory registry instance
export const factoryRegistry = FactoryRegistry.getInstance();



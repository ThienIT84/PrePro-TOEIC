// Observer Pattern Implementation for MVC Architecture

export interface Observer<T = unknown> {
  update(data: T): void;
  getId(): string;
}

export interface Subject<T = unknown> {
  subscribe(observer: Observer<T>): void;
  unsubscribe(observer: Observer<T>): void;
  notify(data: T): void;
  getObservers(): Observer<T>[];
}

export interface EventEmitter {
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
  once(event: string, callback: (...args: unknown[]) => void): void;
}

// Base Observer Implementation
export class BaseObserver<T = unknown> implements Observer<T> {
  private id: string;
  private callback: (data: T) => void;

  constructor(id: string, callback: (data: T) => void) {
    this.id = id;
    this.callback = callback;
  }

  update(data: T): void {
    try {
      this.callback(data);
    } catch (error) {
      console.error(`Observer ${this.id} error:`, error);
    }
  }

  getId(): string {
    return this.id;
  }
}

// Base Subject Implementation
export class BaseSubject<T = unknown> implements Subject<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): void {
    if (!this.observers.find(obs => obs.getId() === observer.getId())) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: Observer<T>): void {
    this.observers = this.observers.filter(obs => obs.getId() !== observer.getId());
  }

  notify(data: T): void {
    this.observers.forEach(observer => {
      try {
        observer.update(data);
      } catch (error) {
        console.error(`Error notifying observer ${observer.getId()}:`, error);
      }
    });
  }

  getObservers(): Observer<T>[] {
    return [...this.observers];
  }

  clearObservers(): void {
    this.observers = [];
  }
}

// Event Emitter Implementation
export class EventEmitterImpl implements EventEmitter {
  private events: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event ${event} callback:`, error);
        }
      });
    }
  }

  once(event: string, callback: (...args: unknown[]) => void): void {
    const onceCallback = (...args: unknown[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  getEventNames(): string[] {
    return Array.from(this.events.keys());
  }

  getListenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// State Observer for Global State
export class StateObserver<T = unknown> extends BaseObserver<T> {
  private componentId: string;
  private stateKey: string;

  constructor(componentId: string, stateKey: string, callback: (data: T) => void) {
    super(`${componentId}_${stateKey}`, callback);
    this.componentId = componentId;
    this.stateKey = stateKey;
  }

  getComponentId(): string {
    return this.componentId;
  }

  getStateKey(): string {
    return this.stateKey;
  }
}

// State Subject for Global State
export class StateSubject<T = unknown> extends BaseSubject<T> {
  private stateKey: string;
  private currentValue: T | null = null;

  constructor(stateKey: string) {
    super();
    this.stateKey = stateKey;
  }

  getStateKey(): string {
    return this.stateKey;
  }

  getCurrentValue(): T | null {
    return this.currentValue;
  }

  setValue(value: T): void {
    this.currentValue = value;
    this.notify(value);
  }

  updateValue(updater: (current: T | null) => T): void {
    const newValue = updater(this.currentValue);
    this.setValue(newValue);
  }
}

// Component Observer for React Components
export class ComponentObserver<T = unknown> extends BaseObserver<T> {
  private componentRef: React.RefObject<unknown>;
  private updateMethod: string;

  constructor(
    componentId: string, 
    componentRef: React.RefObject<unknown>, 
    updateMethod: string = 'forceUpdate',
    callback: (data: T) => void
  ) {
    super(componentId, callback);
    this.componentRef = componentRef;
    this.updateMethod = updateMethod;
  }

  update(data: T): void {
    super.update(data);
    
    // Trigger component update
    if (this.componentRef.current && this.componentRef.current[this.updateMethod]) {
      this.componentRef.current[this.updateMethod]();
    }
  }
}

// Controller Observer for MVC Controllers
export class ControllerObserver<T = unknown> extends BaseObserver<T> {
  private controller: unknown;
  private methodName: string;

  constructor(
    controllerId: string,
    controller: unknown,
    methodName: string,
    callback: (data: T) => void
  ) {
    super(controllerId, callback);
    this.controller = controller;
    this.methodName = methodName;
  }

  update(data: T): void {
    super.update(data);
    
    // Call controller method if it exists
    if (this.controller && this.controller[this.methodName]) {
      try {
        this.controller[this.methodName](data);
      } catch (error) {
        console.error(`Error calling controller method ${this.methodName}:`, error);
      }
    }
  }
}

// Global Event System
export class GlobalEventSystem {
  private static instance: GlobalEventSystem;
  private eventEmitter: EventEmitterImpl;
  private stateSubjects: Map<string, StateSubject<unknown>> = new Map();

  private constructor() {
    this.eventEmitter = new EventEmitterImpl();
  }

  static getInstance(): GlobalEventSystem {
    if (!GlobalEventSystem.instance) {
      GlobalEventSystem.instance = new GlobalEventSystem();
    }
    return GlobalEventSystem.instance;
  }

  // Event System Methods
  on(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  emit(event: string, ...args: unknown[]): void {
    this.eventEmitter.emit(event, ...args);
  }

  once(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.once(event, callback);
  }

  // State System Methods
  createStateSubject<T>(stateKey: string): StateSubject<T> {
    if (!this.stateSubjects.has(stateKey)) {
      this.stateSubjects.set(stateKey, new StateSubject<T>(stateKey));
    }
    return this.stateSubjects.get(stateKey)!;
  }

  getStateSubject<T>(stateKey: string): StateSubject<T> | null {
    return this.stateSubjects.get(stateKey) || null;
  }

  subscribeToState<T>(
    stateKey: string, 
    observerId: string, 
    callback: (data: T) => void
  ): StateObserver<T> {
    const subject = this.createStateSubject<T>(stateKey);
    const observer = new StateObserver(observerId, stateKey, callback);
    subject.subscribe(observer);
    return observer;
  }

  unsubscribeFromState(stateKey: string, observerId: string): void {
    const subject = this.stateSubjects.get(stateKey);
    if (subject) {
      const observer = subject.getObservers().find(obs => obs.getId() === observerId);
      if (observer) {
        subject.unsubscribe(observer);
      }
    }
  }

  setStateValue<T>(stateKey: string, value: T): void {
    const subject = this.createStateSubject<T>(stateKey);
    subject.setValue(value);
  }

  getStateValue<T>(stateKey: string): T | null {
    const subject = this.stateSubjects.get(stateKey);
    return subject ? subject.getCurrentValue() : null;
  }

  // Utility Methods
  getEventNames(): string[] {
    return this.eventEmitter.getEventNames();
  }

  getStateKeys(): string[] {
    return Array.from(this.stateSubjects.keys());
  }

  getListenerCount(event: string): number {
    return this.eventEmitter.getListenerCount(event);
  }

  getStateObserverCount(stateKey: string): number {
    const subject = this.stateSubjects.get(stateKey);
    return subject ? subject.getObservers().length : 0;
  }

  clearAll(): void {
    this.eventEmitter.removeAllListeners();
    this.stateSubjects.forEach(subject => subject.clearObservers());
    this.stateSubjects.clear();
  }
}

// React Hook for State Observation
export const useStateObserver = <T>(
  stateKey: string,
  callback: (data: T) => void,
  deps: unknown[] = []
) => {
  const eventSystem = GlobalEventSystem.getInstance();
  const [currentValue, setCurrentValue] = React.useState<T | null>(
    eventSystem.getStateValue<T>(stateKey)
  );

  React.useEffect(() => {
    const observer = eventSystem.subscribeToState(stateKey, 'useStateObserver', (data: T) => {
      setCurrentValue(data);
      callback(data);
    });

    return () => {
      eventSystem.unsubscribeFromState(stateKey, observer.getId());
    };
  }, deps);

  return currentValue;
};

// React Hook for Event Listening
export const useEvent = (
  event: string,
  callback: (...args: unknown[]) => void,
  deps: unknown[] = []
) => {
  const eventSystem = GlobalEventSystem.getInstance();

  React.useEffect(() => {
    eventSystem.on(event, callback);

    return () => {
      eventSystem.off(event, callback);
    };
  }, deps);
};

// Export global event system instance
export const globalEventSystem = GlobalEventSystem.getInstance();



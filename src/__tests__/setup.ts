/**
 * Global test setup for Jest
 * PrePro-TOEIC Testing Environment Setup
 */
import '@testing-library/jest-dom';

// Mock window.matchMedia (required for responsive UI / theme / shadcn)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock HTMLMediaElement methods (for TOEIC audio players in listening parts)
window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

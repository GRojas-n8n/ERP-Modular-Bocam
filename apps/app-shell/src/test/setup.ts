import '@testing-library/jest-dom'

// jsdom no implementa ResizeObserver — se provee un stub no-op para que los
// componentes que lo usan (ej. TableScrollShadow) puedan montarse en tests.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

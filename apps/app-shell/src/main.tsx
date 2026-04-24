import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// NOTA: El <Suspense> raíz fue eliminado intencionalmente.
// TenantProvider gestiona su propio estado de carga con isLoading + useState,
// sin lanzar Promises. Un <Suspense> aquí es redundante y en React 19
// puede causar interacciones inesperadas con el ErrorBoundary interno.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

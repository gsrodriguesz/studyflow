import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { GamificationProvider } from './context/GamificationContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <GamificationProvider>
          <App />
        </GamificationProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)

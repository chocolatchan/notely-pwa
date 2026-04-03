import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages — splits Dashboard and PageView into separate chunks
// PageView pulls in react-markdown, katex, framer-motion, @dnd-kit (~200KB)
// These are NOT loaded until the user navigates to a page
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PageView = React.lazy(() => import('./pages/PageView'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#FFFFFF' 
        }}>
          <div style={{ 
            width: 24, height: 24, 
            border: '2px solid #EAEAEA', 
            borderTopColor: '#111', 
            borderRadius: '50%', 
            animation: 'spin 0.6s linear infinite' 
          }} />
        </div>
      }>
        <div className="min-h-screen bg-slate-50 antialiased selection:bg-blue-100 selection:text-blue-900">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/page/:id" element={<PageView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
}

export default App;

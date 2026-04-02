import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PageView from './pages/PageView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/page/:id" element={<PageView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

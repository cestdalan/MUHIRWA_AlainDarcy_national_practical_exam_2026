import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';

// Route protector component that checks if user has active session
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Application shell layout coordinating the sidebar and right side main view pane
const LayoutShell = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Scrollable Main Content Area */}
      <main className="flex-1 min-h-screen ml-64 p-8 overflow-y-auto text-gray-900 dark:text-slate-100 bg-[#f5f5f5] dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);



  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <LayoutShell>
                  <Dashboard />
                </LayoutShell>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute>
                <LayoutShell>
                  <Employees />
                </LayoutShell>
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

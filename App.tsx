
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';

const Dashboard = lazy(() => import('./screens/Dashboard'));
const Accounts = lazy(() => import('./screens/Accounts'));
const Cards = lazy(() => import('./screens/Cards'));
const Transactions = lazy(() => import('./screens/Transactions'));
const Reports = lazy(() => import('./screens/Reports'));
const Backup = lazy(() => import('./screens/Backup'));
const Purchase = lazy(() => import('./screens/Purchase'));
const Login = lazy(() => import('./screens/Login'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/backup" element={<Backup />} />
                <Route path="/purchase" element={<Purchase />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

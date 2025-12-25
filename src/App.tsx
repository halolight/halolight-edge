import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeSettingsProvider } from '@/contexts/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { OfflinePage } from '@/components/OfflinePage';
import { AdminRoute } from '@/components/AdminRoute';
import { useNetwork } from '@/hooks/use-network';
import { Loader2 } from 'lucide-react';

// 核心页面 - 静态导入
import Index from './pages/Index';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import Unauthorized from './pages/Unauthorized';
import Maintenance from './pages/Maintenance';
import NetworkError from './pages/NetworkError';

// 功能页面 - 懒加载
const Users = lazy(() => import('./pages/Users'));
const Roles = lazy(() => import('./pages/Roles'));
const Settings = lazy(() => import('./pages/Settings'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const ScheduledTasks = lazy(() => import('./pages/ScheduledTasks'));
const ApiTokens = lazy(() => import('./pages/ApiTokens'));
const DevTools = lazy(() => import('./pages/DevTools'));

// 重型页面 - 懒加载 (包含大型依赖)
const DataDictionary = lazy(() => import('./pages/DataDictionary'));
const SwaggerDocs = lazy(() => import('./pages/SwaggerDocs'));
const SqlEditor = lazy(() => import('./pages/SqlEditor'));
const ApiTester = lazy(() => import('./pages/ApiTester'));

const queryClient = new QueryClient();

// 页面加载骨架
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  const { isOnline } = useNetwork();

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route
            path="/roles"
            element={
              <AdminRoute>
                <Roles />
              </AdminRoute>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/audit-logs"
            element={
              <AdminRoute>
                <AuditLogs />
              </AdminRoute>
            }
          />
          <Route
            path="/data-dictionary"
            element={
              <AdminRoute>
                <DataDictionary />
              </AdminRoute>
            }
          />
          <Route
            path="/scheduled-tasks"
            element={
              <AdminRoute>
                <ScheduledTasks />
              </AdminRoute>
            }
          />
          <Route
            path="/api-tokens"
            element={
              <AdminRoute>
                <ApiTokens />
              </AdminRoute>
            }
          />
          <Route
            path="/swagger-docs"
            element={
              <AdminRoute>
                <SwaggerDocs />
              </AdminRoute>
            }
          />
          <Route
            path="/sql-editor"
            element={
              <AdminRoute>
                <SqlEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/api-tester"
            element={
              <AdminRoute>
                <ApiTester />
              </AdminRoute>
            }
          />
          <Route path="/dev-tools" element={<DevTools />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/401" element={<Unauthorized />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/503" element={<Maintenance />} />
          <Route path="/offline" element={<NetworkError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ThemeSettingsProvider>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </AuthProvider>
          </TooltipProvider>
        </ThemeSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

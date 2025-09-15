import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CoursesPage from './pages/CoursesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AgentsPage from './pages/AgentsPage';
import AgentDetailsPage from './pages/AgentDetailsPage';
import PersonasPage from './pages/PersonasPage';
import PersonaDetailsPage from './pages/PersonaDetailsPage';
import SurveysAndQAPage from './pages/SurveysAndQAPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import SurveyResultsPage from './pages/SurveyResultsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="agents/:agentName" element={<AgentDetailsPage />} />
            <Route path="personas" element={<PersonasPage />} />
            <Route path="personas/:leadId" element={<PersonaDetailsPage />} />
            <Route path="surveys" element={<SurveysAndQAPage />} />
            <Route path="surveys/create" element={<CreateSurveyPage />} />
            <Route path="surveys/:surveyId/results" element={<SurveyResultsPage />} />
          </Route>
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

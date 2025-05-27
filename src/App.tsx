import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import SchedulePage from './pages/SchedulePage';
import LessonDetailsPage from './pages/LessonDetailsPage';
import ProfilePage from './pages/ProfilePage';
import TutorSearchPage from './pages/TutorSearchPage';
import StudentsPage from './pages/StudentsPage';
import LessonsPage from './pages/LessonsPage';
import CreateLessonPage from './pages/CreateLessonPage';
import { useAuth } from './hooks/useAuth';
import './App.css';
import HomePage from './pages/HomePage';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to='/login' />;
};

// Public Route component (accessible only when not authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to='/dashboard' />;
};

// Teacher Route component
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to='/login' />;
  if (!user?.roles.includes('TEACHER')) return <Navigate to='/dashboard' />;
  return <>{children}</>;
};

// Student Route component
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to='/login' />;
  if (!user?.roles.includes('STUDENT')) return <Navigate to='/dashboard' />;
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path='/login'
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path='/register'
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/schedule'
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/schedule/day/:day'
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/search'
            element={
              <StudentRoute>
                <TutorSearchPage />
              </StudentRoute>
            }
          />

          <Route
            path='/students'
            element={
              <TeacherRoute>
                <StudentsPage />
              </TeacherRoute>
            }
          />

          <Route
            path='/lessons'
            element={
              <TeacherRoute>
                <LessonsPage />
              </TeacherRoute>
            }
          />

          <Route
            path='/lessons/:lessonId'
            element={
              <ProtectedRoute>
                <LessonDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/create-lesson'
            element={
              <TeacherRoute>
                <CreateLessonPage />
              </TeacherRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route
            path='/'
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />

          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to dashboard */}
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

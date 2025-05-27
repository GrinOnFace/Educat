import { Routes, Route, Outlet } from 'react-router-dom';
import PublicLayout from '@components/layouts/PublicLayout';
import AppLayout from '@components/layouts/AppLayout';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import HomePage from '@pages/HomePage';
import ProfilePage from '@pages/ProfilePage';
import LessonsPage from '@pages/LessonsPage';
import StudentsPage from '@pages/StudentsPage';
import SchedulePage from '@pages/SchedulePage';
import TutorSearchPage from '@pages/TutorSearchPage';
import { useAuth } from '@hooks/useAuth';
import './App.css';

const PublicLayoutWrapper = () => (
  <PublicLayout>
    <Outlet />
  </PublicLayout>
);

const AppLayoutWrapper = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {!isAuthenticated ? (
        <Route element={<PublicLayoutWrapper />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      ) : (
        <Route element={<AppLayoutWrapper />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/tutors" element={<TutorSearchPage />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;

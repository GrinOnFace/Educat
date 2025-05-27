import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { AppLayout } from '../components';
import { useAuth } from '../hooks/useAuth';
import { lessonService } from '../services/lessonService';
import type { Lesson } from '../services/lessonService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MainPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const lessonsData = user.roles.includes('TEACHER')
          ? await lessonService.getTeacherLessons(user.id)
          : await lessonService.getStudentLessons(user.id);
        setLessons(lessonsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.roles]);

  // Prepare data for charts
  const prepareChartData = () => {
    const weeklyHours = new Array(7).fill(0);
    const upcomingLessons = new Array(7).fill(0);
    const subjectsMap = new Map<string, number>();
    const now = new Date();

    lessons.forEach(lesson => {
      const lessonDate = new Date(lesson.startTime);
      const dayOfWeek = lessonDate.getDay();
      const daysDiff = Math.floor((lessonDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (lesson.status === 'Completed') {
        weeklyHours[dayOfWeek === 0 ? 6 : dayOfWeek - 1] +=
          (new Date(lesson.endTime).getTime() - new Date(lesson.startTime).getTime()) /
          (1000 * 60 * 60);
      }

      if (lesson.status === 'Scheduled' && daysDiff >= 0 && daysDiff < 7) {
        upcomingLessons[daysDiff]++;
      }

      if (subjectsMap.has(lesson.subjectName)) {
        subjectsMap.set(lesson.subjectName, subjectsMap.get(lesson.subjectName)! + 1);
      } else {
        subjectsMap.set(lesson.subjectName, 1);
      }
      console.log(subjectsMap);
    });

    return {
      weeklyHours,
      upcomingLessons,
      subjectsDistribution: Array.from(subjectsMap.entries()),
    };
  };

  const chartData = prepareChartData();

  // Data for Student/Teacher Bar Chart (Hours)
  const hoursData = {
    labels: DAYS_OF_WEEK,
    datasets: [
      {
        label: 'Часы',
        data: chartData.weeklyHours,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Data for Upcoming Classes
  const upcomingClassesData = {
    labels: ['Сегодня', 'Завтра', '+2 дня', '+3 дня', '+4 дня', '+5 дней', '+6 дней'],
    datasets: [
      {
        label: 'Количество занятий',
        data: chartData.upcomingLessons,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
    ],
  };

  // Data for Subjects Pie Chart
  const subjectsData = {
    labels: chartData.subjectsDistribution.map(([subject]) => subject),
    datasets: [
      {
        data: chartData.subjectsDistribution.map(([, count]) => count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <AppLayout onLogout={handleLogout}>
        <Container maxWidth='lg'>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
            <CircularProgress />
          </Box>
        </Container>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout onLogout={handleLogout}>
        <Container maxWidth='lg'>
          <Box sx={{ py: 4 }}>
            <Alert severity='error'>{error}</Alert>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  const Dashboard = () => (
    <>
      <Typography variant='h4' align='center' gutterBottom>
        Добро пожаловать, {user?.firstName}!
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        <Paper elevation={2} sx={{ p: 3, height: 340 }}>
          <Typography variant='h6' gutterBottom>
            Часы занятий по дням недели
          </Typography>
          <Box sx={{ height: 240 }}>
            <Bar data={hoursData} options={barOptions} />
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, height: 340 }}>
          <Typography variant='h6' gutterBottom>
            Предстоящие занятия
          </Typography>
          <Box sx={{ height: 240 }}>
            <Bar data={upcomingClassesData} options={horizontalBarOptions} />
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, height: 340 }}>
          <Typography variant='h6' gutterBottom>
            Распределение по предметам
          </Typography>
          <Box sx={{ height: 240 }}>
            <Pie data={subjectsData} options={pieOptions} />
          </Box>
        </Paper>
      </Box>
    </>
  );

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='lg'>
        <Box sx={{ py: 4 }}>
          <Dashboard />
        </Box>
      </Container>
    </AppLayout>
  );
};

export default MainPage;

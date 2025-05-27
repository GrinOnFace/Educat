import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AccessTime, Person as PersonIcon, School as SchoolIcon } from '@mui/icons-material';
import { AppLayout } from '../components';
import { lessonService } from '../services/lessonService';
import type { DaySchedule, Lesson, DateFilter } from '../services/lessonService';
import { useAuth } from '../hooks/useAuth';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
  { value: 'sunday', label: 'Воскресенье' },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'scheduled':
      return 'info';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Завершено';
    case 'scheduled':
      return 'Запланировано';
    case 'cancelled':
      return 'Отменено';
    default:
      return status;
  }
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

const groupLessonsByDay = (lessons: Lesson[]): DaySchedule => {
  const schedule: DaySchedule = {};

  // Инициализируем все дни недели пустыми массивами
  DAYS_OF_WEEK.forEach(day => {
    schedule[day.value] = [];
  });

  // Группируем уроки по дням недели
  lessons.forEach(lesson => {
    const dayOfWeek = getDayOfWeek(lesson.startTime);
    if (schedule[dayOfWeek]) {
      schedule[dayOfWeek].push(lesson);
    }
  });

  // Сортируем уроки в каждом дне по времени начала
  Object.keys(schedule).forEach(day => {
    schedule[day].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  return schedule;
};

const getWeekDates = (): DateFilter => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Воскресенье
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString(),
  };
};

const SchedulePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedDay, setSelectedDay] = useState(getDayOfWeek(new Date().toISOString()));
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchLessons = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const weekDates = getWeekDates();
        const lessons = user.roles.includes('TEACHER')
          ? await lessonService.getTeacherLessons(user.id)
          : await lessonService.getStudentLessons(user.id);
        const groupedLessons = groupLessonsByDay(lessons);
        setSchedule(groupedLessons);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Ошибка при загрузке расписания');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [user?.id, user?.roles]);

  const handleDayChange = (event: React.MouseEvent<HTMLElement>, newDay: string) => {
    if (newDay !== null) {
      setSelectedDay(newDay);
    }
  };

  const handleLessonClick = (lessonId: number) => {
    navigate(`/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <AppLayout>
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
      <AppLayout>
        <Container maxWidth='lg'>
          <Box sx={{ py: 4 }}>
            <Alert severity='error'>{error}</Alert>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='lg'>
        <Box sx={{ py: 4 }}>
          <Typography variant='h4' gutterBottom>
            Расписание занятий
          </Typography>

          <Box sx={{ mb: 4 }}>
            <ToggleButtonGroup
              value={selectedDay}
              exclusive
              onChange={handleDayChange}
              aria-label='выбор дня'
              sx={{ mb: 3, flexWrap: 'wrap' }}
            >
              {DAYS_OF_WEEK.map(day => (
                <ToggleButton
                  key={day.value}
                  value={day.value}
                  sx={{
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {day.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {schedule && schedule[selectedDay]?.length > 0 ? (
              <List>
                {schedule[selectedDay].map(lesson => (
                  <Paper
                    key={lesson.id}
                    elevation={1}
                    sx={{
                      mb: 2,
                      p: 3,
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant='h6'>
                          {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(lesson.status)}
                        color={getStatusColor(lesson.status)}
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 'medium',
                          borderRadius: '16px',
                        }}
                      />
                    </Box>

                    <Box sx={{ pl: 4 }}>
                      <Typography variant='h5' gutterBottom>
                        {lesson.subjectName}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ color: 'action.active' }} />
                          <Typography>
                            {user?.roles.includes('teacher')
                              ? lesson.studentName
                              : lesson.teacherName}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ textAlign: 'center', mt: 4 }}
              >
                Нет занятий в этот день
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default SchedulePage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add as AddIcon,
  Sort as SortIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AppLayout } from '../components';
import { lessonService } from '../services/lessonService';
import type { Lesson } from '../services/lessonService';
import { useAuth } from '../hooks/useAuth';

const LessonsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchLessons = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const lessonsData = await lessonService.getTeacherLessons(user.id);
        setLessons(lessonsData);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Ошибка при загрузке уроков');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [user?.id]);

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

  const handleLessonClick = (lessonId: number) => {
    navigate(`/lessons/${lessonId}`);
  };

  const filteredAndSortedLessons = lessons
    .filter(lesson => {
      const matchesSearch =
        lesson.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || lesson.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return sortOrder === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth='lg'>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
            <Typography>Загрузка...</Typography>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='lg'>
        <Box sx={{ py: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant='h4'>Мои уроки</Typography>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-lesson')}
            >
              Новый урок
            </Button>
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder='Поиск по предмету или студенту...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  label='Статус'
                >
                  <MenuItem value='all'>Все статусы</MenuItem>
                  <MenuItem value='scheduled'>Запланировано</MenuItem>
                  <MenuItem value='completed'>Завершено</MenuItem>
                  <MenuItem value='cancelled'>Отменено</MenuItem>
                </Select>
              </FormControl>

              <Tooltip title='Сортировка по дате'>
                <IconButton onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}>
                  <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {filteredAndSortedLessons.length === 0 ? (
            <Typography color='text.secondary' align='center'>
              Уроков не найдено
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredAndSortedLessons.map(lesson => (
                <Card
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson.id)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                      transition: 'box-shadow 0.2s',
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                        <Box>
                          <Typography variant='h6' gutterBottom>
                            {lesson.subjectName}
                          </Typography>
                          <Typography color='text.secondary'>
                            {format(new Date(lesson.startTime), 'dd MMMM yyyy, HH:mm', {
                              locale: ru,
                            })}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={getStatusText(lesson.status)}
                          color={getStatusColor(lesson.status) as any}
                          size='small'
                        />
                        <ArrowForwardIcon color='action' />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </AppLayout>
  );
};

export default LessonsPage;

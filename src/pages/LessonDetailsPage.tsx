import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Breadcrumbs,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Rating,
  TextField,
  IconButton,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Telegram as TelegramIcon,
  OpenInNew as OpenInNewIcon,
  NavigateNext as NavigateNextIcon,
  Star as StarIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { AppLayout } from '../components';
import { lessonService } from '../services/lessonService';
import type { Lesson, CreateReviewRequest, Review } from '../services/lessonService';
import { useAuth } from '../hooks/useAuth';
import { LessonMaterials } from '@/components/LessonMaterials';

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

const LessonDetailsPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchLesson = async () => {
      if (!user?.id || !lessonId) return;

      try {
        setLoading(true);
        const isTeacher = user.roles.includes('TEACHER');
        const lessonData = await lessonService.getLesson(
          user.id,
          parseInt(lessonId, 10),
          isTeacher
        );
        setLesson(lessonData);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Ошибка при загрузке урока');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [user?.id, user?.roles, lessonId]);

  const handleReviewSubmit = async () => {
    if (!user?.id || !lesson || !lessonId) return;

    try {
      setReviewSubmitting(true);
      setReviewError(null);

      const reviewData: CreateReviewRequest = {
        lessonId: parseInt(lessonId, 10),
        teacherId: lesson.teacherId,
        studentId: user.id,
        rating,
        comment,
      };

      await lessonService.createReview(reviewData);
      setIsEditingReview(false);
      // Перезагружаем урок, чтобы получить обновленные данные
      const updatedLesson = await lessonService.getLesson(user.id, parseInt(lessonId, 10), false);
      setLesson(updatedLesson);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError('Ошибка при сохранении отзыва');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatExternalUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
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

  if (error || !lesson) {
    return (
      <AppLayout>
        <Container maxWidth='lg'>
          <Box sx={{ py: 4 }}>
            <Alert severity='error'>{error || 'Урок не найден'}</Alert>
            <Button component={Link} to='/schedule' sx={{ mt: 2 }}>
              Вернуться к расписанию
            </Button>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  const isTeacher = user?.roles.includes('TEACHER');
  const otherPartyName = isTeacher ? lesson.studentName : lesson.teacherName;
  const otherPartyTelegram = otherPartyName.toLowerCase().replace(/\s+/g, '_');

  const isStudent = !user?.roles.includes('TEACHER');

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='lg'>
        <Box sx={{ py: 4 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />} sx={{ mb: 3 }}>
            <Link to='/schedule' style={{ textDecoration: 'none', color: 'primary.main' }}>
              <Typography color='primary'>Расписание</Typography>
            </Link>
            <Typography color='text.secondary'>Детали урока</Typography>
          </Breadcrumbs>

          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
            >
              <Typography variant='h4' component='h1'>
                {lesson.subjectName}
              </Typography>
              <Chip
                label={getStatusText(lesson.status)}
                color={getStatusColor(lesson.status)}
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 'medium',
                  borderRadius: '16px',
                  px: 2,
                }}
              />
            </Box>

            <Stack spacing={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant='h6'>Время урока</Typography>
                </Box>
                <Box sx={{ pl: 5 }}>
                  <Typography variant='body1' color='text.secondary' gutterBottom>
                    Начало:{' '}
                    {new Date(lesson.startTime).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    Окончание:{' '}
                    {new Date(lesson.endTime).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant='h6'>{isTeacher ? 'Студент' : 'Преподаватель'}</Typography>
                </Box>
                <Box sx={{ pl: 5 }}>
                  <Typography variant='body1' gutterBottom>
                    {otherPartyName}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant='h6' gutterBottom>
                  Ссылки для подключения
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant='contained'
                    endIcon={<OpenInNewIcon />}
                    onClick={() => window.open(formatExternalUrl(lesson.conferenceLink), '_blank', 'noopener,noreferrer')}
                    disabled={!lesson.conferenceLink}
                    sx={{
                      width: 'fit-content',
                      borderRadius: '12px',
                      textTransform: 'none',
                    }}
                  >
                    Перейти на конференцию
                  </Button>
                  <Button
                    variant='outlined'
                    endIcon={<OpenInNewIcon />}
                    onClick={() => window.open(formatExternalUrl(lesson.whiteboardLink), '_blank', 'noopener,noreferrer')}
                    disabled={!lesson.whiteboardLink}
                    sx={{
                      width: 'fit-content',
                      borderRadius: '12px',
                      textTransform: 'none',
                    }}
                  >
                    Открыть интерактивную доску
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: 4 }} />
              <Box>
                <LessonMaterials 
                  lessonId={Number(lessonId)} 
                  teacherId={isTeacher ? user?.id : undefined}
                />
              </Box>

              {isStudent && (
                <>
                  <Divider sx={{ my: 4 }} />
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant='h6'>Ваш отзыв</Typography>
                      {!isEditingReview && (
                        <IconButton
                          onClick={() => setIsEditingReview(true)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </Box>

                    {isEditingReview ? (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography component='legend' gutterBottom>
                            Оценка:
                          </Typography>
                          <Rating
                            value={rating}
                            onChange={(_, newValue) => {
                              if (newValue !== null) setRating(newValue);
                            }}
                            icon={<StarIcon fontSize='large' />}
                            emptyIcon={<StarIcon fontSize='large' />}
                          />
                        </Box>

                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label='Комментарий'
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          sx={{ mb: 2 }}
                        />

                        {reviewError && (
                          <Alert severity='error' sx={{ mb: 2 }}>
                            {reviewError}
                          </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button
                            variant='outlined'
                            onClick={() => setIsEditingReview(false)}
                            disabled={reviewSubmitting}
                          >
                            Отмена
                          </Button>
                          <Button
                            variant='contained'
                            onClick={handleReviewSubmit}
                            disabled={reviewSubmitting}
                          >
                            {reviewSubmitting ? (
                              <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Сохранение...
                              </>
                            ) : (
                              'Сохранить отзыв'
                            )}
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Rating
                          value={rating}
                          readOnly
                          icon={<StarIcon fontSize='large' />}
                          emptyIcon={<StarIcon fontSize='large' />}
                        />
                        {comment ? (
                          <Typography sx={{ mt: 1 }}>{comment}</Typography>
                        ) : (
                          <Typography color='text.secondary' sx={{ mt: 1 }}>
                            Нет комментария
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          </Paper>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default LessonDetailsPage;

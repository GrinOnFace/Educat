import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText,
  Paper,
  CircularProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { AppLayout } from '../components';
import { lessonService } from '../services/lessonService';
import type { CreateLessonRequest } from '../services/lessonService';
import { useAuth } from '../hooks/useAuth';
import { subjectService } from '../services/subjectService';
import type { Subject } from '../services/subjectService';
import type { TeacherStudentProfile } from '../services/studentService';
import { studentService } from '../services/studentService';

const CreateLessonPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<TeacherStudentProfile[]>([]);

  const [formData, setFormData] = useState<CreateLessonRequest>({
    teacherId: user?.id || 0,
    studentId: 0,
    subjectId: 0,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(), // +1 hour
    conferenceLink: '',
    whiteboardLink: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateLessonRequest, string>>>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [studentIds, subjectsList] = await Promise.all([
          studentService.getTeacherStudents(user.id),
          subjectService.getSubjects(),
        ]);

        const studentsData = await Promise.all(
          studentIds.map((id: number) => studentService.getTeacherStudentProfile(id))
        );

        setStudents(studentsData);
        setSubjects(subjectsList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateLessonRequest, string>> = {};

    if (!formData.studentId) {
      errors.studentId = 'Выберите студента';
    }
    if (!formData.subjectId) {
      errors.subjectId = 'Выберите предмет';
    }
    if (!formData.startTime) {
      errors.startTime = 'Укажите время начала';
    }
    if (!formData.endTime) {
      errors.endTime = 'Укажите время окончания';
    }
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      errors.endTime = 'Время окончания должно быть позже времени начала';
    }
    if (!formData.conferenceLink) {
      errors.conferenceLink = 'Укажите ссылку на конференцию';
    }
    if (!formData.whiteboardLink) {
      errors.whiteboardLink = 'Укажите ссылку на интерактивную доску';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await lessonService.createLesson(formData);
      navigate('/lessons');
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError('Ошибка при создании урока');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'startTime' | 'endTime') => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString(),
      }));
    }
  };

  const handleSelectChange =
    (field: 'studentId' | 'subjectId') => (event: SelectChangeEvent<number>) => {
      const value = event.target.value as number;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleInputChange =
    (field: 'conferenceLink' | 'whiteboardLink') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  if (loading && !students.length && !subjects.length) {
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

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='md'>
        <Box sx={{ py: 4 }}>
          <Typography variant='h4' gutterBottom>
            Создать урок
          </Typography>

          <Paper sx={{ p: 3 }}>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.studentId}>
                <InputLabel>Студент</InputLabel>
                <Select
                  value={formData.studentId}
                  onChange={handleSelectChange('studentId')}
                  label='Студент'
                >
                  <MenuItem value={0}>Выберите студента</MenuItem>
                  {students.map(student => (
                    <MenuItem key={student.userId} value={student.userId}>
                      {student.fullName}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.studentId && <FormHelperText>{formErrors.studentId}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.subjectId}>
                <InputLabel>Предмет</InputLabel>
                <Select
                  value={formData.subjectId}
                  onChange={handleSelectChange('subjectId')}
                  label='Предмет'
                >
                  <MenuItem value={0}>Выберите предмет</MenuItem>
                  {subjects.map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.subjectId && <FormHelperText>{formErrors.subjectId}</FormHelperText>}
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <Box sx={{ mb: 2 }}>
                  <DateTimePicker
                    label='Время начала'
                    value={new Date(formData.startTime)}
                    onChange={handleDateChange('startTime')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.startTime,
                        helperText: formErrors.startTime,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <DateTimePicker
                    label='Время окончания'
                    value={new Date(formData.endTime)}
                    onChange={handleDateChange('endTime')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.endTime,
                        helperText: formErrors.endTime,
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>

              <TextField
                fullWidth
                label='Ссылка на конференцию'
                placeholder='https://zoom.us/j/123456789'
                value={formData.conferenceLink}
                onChange={handleInputChange('conferenceLink')}
                error={!!formErrors.conferenceLink}
                helperText={
                  formErrors.conferenceLink || 'Например, ссылка на Zoom, Google Meet или Teams'
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label='Ссылка на интерактивную доску'
                placeholder='https://miro.com/app/board/123456789/'
                value={formData.whiteboardLink}
                onChange={handleInputChange('whiteboardLink')}
                error={!!formErrors.whiteboardLink}
                helperText={
                  formErrors.whiteboardLink ||
                  'Например, ссылка на Miro, Jamboard или другую интерактивную доску'
                }
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='outlined' onClick={() => navigate('/lessons')}>
                  Назад к урокам
                </Button>
                <Button type='submit' variant='contained' disabled={loading}>
                  Создать урок
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default CreateLessonPage;

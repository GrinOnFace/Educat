import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import {
  AccountCircle,
  Add,
  Badge,
  Book,
  CalendarToday,
  Chat,
  Info,
  Lock,
  MonetizationOn,
  Person,
  PhotoCamera,
  School,
  Timer,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { PublicLayout, FormContainer } from '../components';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerStudent, registerTeacher } = useAuth();
  const [role, setRole] = useState<string>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [gender, setGender] = useState<string>('male');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Поля специфичные для репетитора
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);

  // Доступные предметы и программы
  const availableSubjects = [
    'Математика',
    'Физика',
    'Химия',
    'Информатика',
    'Русский язык',
    'Английский язык',
    'Литература',
    'История',
    'География',
    'Биология',
    'Обществознание',
  ];
  const availablePrograms = ['ОГЭ', 'ЕГЭ', 'Олимпиады', 'Школьная программа', 'ВПР'];

  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    photo: null as File | null,
    contactInfo: '',
  });

  const handleRoleChange = (_: React.MouseEvent<HTMLElement>, newRole: string | null) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        photo: e.target.files![0],
      }));
    }
  };

  const handleProgramChange = (event: SelectChangeEvent<string>) => {
    setSelectedProgram(event.target.value);
  };

  const handleSubjectChange = (event: SelectChangeEvent<string>) => {
    setSelectedSubject(event.target.value);
  };

  const addProgram = () => {
    if (selectedProgram && !programs.includes(selectedProgram)) {
      setPrograms([...programs, selectedProgram]);
      setSelectedProgram('');
    }
  };

  const addSubject = () => {
    if (selectedSubject && !subjects.includes(selectedSubject)) {
      setSubjects([...subjects, selectedSubject]);
      setSelectedSubject('');
    }
  };

  const removeProgram = (program: string) => {
    setPrograms(programs.filter(p => p !== program));
  };

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  // Convert image file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, part to get just the base64 string
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (!agreeTerms) {
      setError('Необходимо согласиться с условиями пользования');
      return;
    }

    // Валидация полей репетитора
    if (role === 'teacher') {
      if (!education) {
        setError('Необходимо указать образование');
        return;
      }
      if (!experience) {
        setError('Необходимо указать опыт работы');
        return;
      }
      if (!hourlyRate) {
        setError('Необходимо указать стоимость часа');
        return;
      }
      if (subjects.length === 0) {
        setError('Необходимо выбрать хотя бы один предмет');
        return;
      }
      if (programs.length === 0) {
        setError('Необходимо выбрать хотя бы одну программу подготовки');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Convert photo to base64 if exists
      let photoBase64 = '';
      if (formData.photo) {
        photoBase64 = await convertToBase64(formData.photo);
      }

      if (role === 'student') {
        // Register student
        await registerStudent({
          login: formData.login,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          lastName: formData.lastName,
          firstName: formData.firstName,
          middleName: formData.middleName || '',
          birthDate: formData.birthDate,
          gender: gender,
          contactInfo: formData.contactInfo || '',
          photoBase64: photoBase64,
        });
      } else {
        // Register teacher
        await registerTeacher({
          login: formData.login,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          lastName: formData.lastName,
          firstName: formData.firstName,
          middleName: formData.middleName || '',
          birthDate: formData.birthDate,
          gender: gender,
          contactInfo: formData.contactInfo || '',
          photoBase64: photoBase64,
          education: education,
          preparationProgramIds: programs.map((_, index) => index + 1), // Временно используем индексы как ID
          experienceYears: parseInt(experience) || 0,
          hourlyRate: parseInt(hourlyRate) || 0,
          subjectIds: subjects.map((_, index) => index + 1), // Временно используем индексы как ID
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
          'Ошибка при регистрации. Пожалуйста, проверьте введенные данные.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <FormContainer maxWidth='md'>
        <Typography component='h1' variant='h4' align='center' gutterBottom>
          Регистрация
        </Typography>

        {error && (
          <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body1' sx={{ mb: 1 }}>
              Выберите роль
            </Typography>
            <ToggleButtonGroup
              color='primary'
              value={role}
              exclusive
              onChange={handleRoleChange}
              aria-label='role selection'
              fullWidth
              disabled={loading}
            >
              <ToggleButton value='student' aria-label='student'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize='small' /> Ученик
                </Box>
              </ToggleButton>
              <ToggleButton value='teacher' aria-label='teacher'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School fontSize='small' /> Репетитор
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Основные поля формы */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Person fontSize='small' /> Логин
            </Typography>
            <TextField
              required
              fullWidth
              id='login'
              name='login'
              value={formData.login}
              onChange={handleChange}
              placeholder='Введите логин'
              variant='outlined'
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Lock fontSize='small' /> Пароль
            </Typography>
            <TextField
              required
              fullWidth
              name='password'
              type={showPassword ? 'text' : 'password'}
              id='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Введите пароль'
              variant='outlined'
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={() => setShowPassword(!showPassword)}
                      edge='end'
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Lock fontSize='small' /> Подтверждение пароля
            </Typography>
            <TextField
              required
              fullWidth
              name='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              id='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='Подтвердите пароль'
              variant='outlined'
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge='end'
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Badge fontSize='small' /> Фамилия
            </Typography>
            <TextField
              required
              fullWidth
              id='lastName'
              name='lastName'
              value={formData.lastName}
              onChange={handleChange}
              placeholder='Введите фамилию'
              variant='outlined'
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <AccountCircle fontSize='small' /> Имя
            </Typography>
            <TextField
              required
              fullWidth
              id='firstName'
              name='firstName'
              value={formData.firstName}
              onChange={handleChange}
              placeholder='Введите имя'
              variant='outlined'
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <AccountCircle fontSize='small' /> Отчество
            </Typography>
            <TextField
              fullWidth
              id='middleName'
              name='middleName'
              value={formData.middleName}
              onChange={handleChange}
              placeholder='Введите отчество'
              variant='outlined'
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CalendarToday fontSize='small' /> Дата рождения
            </Typography>
            <TextField
              fullWidth
              type='date'
              id='birthDate'
              name='birthDate'
              value={formData.birthDate}
              onChange={handleChange}
              placeholder='Выберите дату рождения'
              variant='outlined'
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Person fontSize='small' /> Пол
            </Typography>
            <FormControl component='fieldset' fullWidth sx={{ marginLeft: '12px' }}>
              <RadioGroup
                row
                aria-label='gender'
                name='gender'
                value={gender}
                onChange={handleGenderChange}
              >
                <FormControlLabel
                  value='male'
                  control={<Radio />}
                  label='Мужской'
                  sx={{
                    flex: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mr: 1,
                    p: 1,
                  }}
                  disabled={loading}
                />
                <FormControlLabel
                  value='female'
                  control={<Radio />}
                  label='Женский'
                  sx={{
                    flex: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 1,
                  }}
                  disabled={loading}
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PhotoCamera fontSize='small' /> Фото
            </Typography>
            <Button
              variant='outlined'
              component='label'
              fullWidth
              startIcon={<PhotoCamera />}
              sx={{ py: 1.5, justifyContent: 'flex-start' }}
              disabled={loading}
            >
              {formData.photo ? formData.photo.name : 'Выберите файл'}
              <input
                type='file'
                accept='image/*'
                hidden
                onChange={handleFileChange}
                disabled={loading}
              />
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body1'
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Chat fontSize='small' /> Контактная информация
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              id='contactInfo'
              name='contactInfo'
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder='Телефон, Telegram, WhatsApp, VK и т.д.'
              variant='outlined'
              disabled={loading}
            />
            <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
              Здесь вы можете указать любую контактную информацию (не обязательно)
            </Typography>
          </Box>

          {/* Дополнительные поля для репетитора */}
          {role === 'teacher' && (
            <>
              <Alert
                severity='info'
                icon={<Info />}
                sx={{ mb: 3, bgcolor: 'rgba(144, 202, 249, 0.2)' }}
              >
                <Typography variant='subtitle1' fontWeight={500}>
                  Обратите внимание!
                </Typography>
                <Typography variant='body2'>
                  Для регистрации в качестве репетитора необходимо заполнить следующие поля:
                </Typography>
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body1'
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <School fontSize='small' /> Образование
                </Typography>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={3}
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  placeholder='Введите информацию об образовании (ВУЗ, факультет, специальность, год окончания)'
                  variant='outlined'
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body1'
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Book fontSize='small' /> Программы подготовки
                </Typography>
                <FormControl fullWidth variant='outlined' sx={{ mb: 1 }}>
                  <Select
                    value={selectedProgram}
                    onChange={handleProgramChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Выберите программу' }}
                    renderValue={value => (value ? value : 'ОГЭ')}
                  >
                    {availablePrograms.map(program => (
                      <MenuItem key={program} value={program}>
                        {program}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant='outlined'
                  color='primary'
                  fullWidth
                  startIcon={<Add />}
                  onClick={addProgram}
                  sx={{ mb: 1 }}
                >
                  Добавить программу
                </Button>
                {programs.length > 0 && (
                  <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {programs.map(program => (
                      <Chip
                        key={program}
                        label={program}
                        onDelete={() => removeProgram(program)}
                        color='primary'
                        variant='outlined'
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body1'
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Timer fontSize='small' /> Опыт работы (лет)
                </Typography>
                <TextField
                  required
                  fullWidth
                  type='number'
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder='Введите опыт работы'
                  variant='outlined'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>лет</InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body1'
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <MonetizationOn fontSize='small' /> Базовая стоимость часа (₽)
                </Typography>
                <TextField
                  required
                  fullWidth
                  type='number'
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  placeholder='Введите стоимость'
                  variant='outlined'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>₽</InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body1'
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Book fontSize='small' /> Предметы
                </Typography>
                <FormControl fullWidth variant='outlined' sx={{ mb: 1 }}>
                  <Select
                    value={selectedSubject}
                    onChange={handleSubjectChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Выберите предмет' }}
                    renderValue={value => (value ? value : 'Математика')}
                  >
                    {availableSubjects.map(subject => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant='outlined'
                  color='primary'
                  fullWidth
                  startIcon={<Add />}
                  onClick={addSubject}
                  sx={{ mb: 1 }}
                >
                  Добавить предмет
                </Button>
                {subjects.length > 0 && (
                  <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {subjects.map(subject => (
                      <Chip
                        key={subject}
                        label={subject}
                        onDelete={() => removeSubject(subject)}
                        color='primary'
                        variant='outlined'
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                color='primary'
                disabled={loading}
              />
            }
            label={
              <Typography variant='body2'>
                Я согласен с условиями пользования и политикой конфиденциальности
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            size='large'
            sx={{ py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Зарегистрироваться'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href='/login' variant='body2' underline='hover'>
              Уже есть аккаунт? Войдите
            </Link>
          </Box>

          {/* Остальные поля формы будут продолжены в следующем редактировании... */}
        </Box>
      </FormContainer>
    </PublicLayout>
  );
};

export default RegisterPage;

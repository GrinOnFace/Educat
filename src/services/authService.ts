import api from './api';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterStudentRequest {
  login: string;
  password: string;
  confirmPassword: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
  gender: string;
  contactInfo?: string;
  photoBase64?: string;
}

export interface RegisterTeacherRequest extends Omit<RegisterStudentRequest, 'photoBase64'> {
  education: string;
  preparationProgramIds: number[];
  experienceYears: number;
  hourlyRate: number;
  subjectIds: number[];
  photoBase64?: string;
}

export interface User {
  id: number;
  email: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
  gender: string;
  contactInfo?: string;
  isTeacher: boolean;
  roles: string[];
  photoBase64?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/Auth/login', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async registerStudent(data: RegisterStudentRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/Auth/register/student', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async registerTeacher(data: RegisterTeacherRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/Auth/register/teacher', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

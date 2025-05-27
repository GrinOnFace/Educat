import api from './api';

export interface StudentRequest {
  id: number;
  studentId: number;
  teacherId: number;
  studentName: string;
  teacherName: string;
  requestDate: string;
  status: string;
}

export interface Student {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

export interface User {
  id: number;
  email: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  gender: string;
  contactInfo: string;
  isTeacher: boolean;
  roles: string[];
  photoBase64: string;
}

export interface TeacherStudentProfile {
  userId: number;
  fullName: string;
  user: User;
}

export const studentService = {
  // Get teacher's students
  getTeacherStudents: async (teacherId: number): Promise<number[]> => {
    const response = await api.get(`/Teacher/${teacherId}/students`);
    return response.data;
  },

  // Get student profile
  getStudentProfile: async (studentId: number): Promise<Student> => {
    const response = await api.get(`/Student/profile/${studentId}`);
    return response.data;
  },

  // Get student profile (new endpoint)
  getTeacherStudentProfile: async (studentId: number): Promise<TeacherStudentProfile> => {
    const response = await api.get(`/Teacher/student-profile/${studentId}`);
    return response.data;
  },

  // Get teacher's requests
  getTeacherRequests: async (teacherId: number): Promise<StudentRequest[]> => {
    const response = await api.get(`/Teacher/${teacherId}/requests`);
    return response.data;
  },

  // Accept student request
  acceptRequest: async (requestId: number): Promise<void> => {
    await api.post(`/Teacher/accept-request/${requestId}`);
  },

  // Reject student request
  rejectRequest: async (requestId: number): Promise<void> => {
    await api.post(`/Teacher/reject-request/${requestId}`);
  },

  // Remove student
  removeStudent: async (teacherId: number, studentId: number): Promise<void> => {
    await api.delete(`/Teacher/remove-student/${teacherId}/${studentId}`);
  },
};

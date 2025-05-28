import api from './api';

export interface CreateLessonRequest {
  teacherId: number;
  studentId: number;
  subjectId: number;
  startTime: string;
  endTime: string;
  conferenceLink: string;
  whiteboardLink: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  size: number;
  base64Content: string;
}

export interface UploadAttachmentRequest {
  fileName: string;
  fileType: string;
  base64Content: string;
}

export interface Lesson {
  id: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  startTime: string;
  endTime: string;
  status: string;
  conferenceLink: string;
  whiteboardLink: string;
  attachments: Attachment[];
}

export interface DaySchedule {
  [key: string]: Lesson[];
}

export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface CreateReviewRequest {
  lessonId: number;
  teacherId: number;
  studentId: number;
  rating: number;
  comment: string;
}

export interface Review {
  id: number;
  lessonId: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface LessonAttachment {
  id: number;
  fileName: string;
  fileType: string;
  size: number;
  base64Content: string;
}

export const lessonService = {
  createLesson: async (lesson: CreateLessonRequest): Promise<Lesson> => {
    const response = await api.post('/Teacher/create-lesson', lesson);
    console.log(response.data);
    return response.data;
  },

  getTeacherLessons: async (teacherId: number): Promise<Lesson[]> => {
    const response = await api.get(`/Teacher/${teacherId}/lessons`);
    console.log(response.data);
    return response.data;
  },

  getStudentLessons: async (studentId: number): Promise<Lesson[]> => {
    const response = await api.get(`/Student/${studentId}/lessons`);
    return response.data;
  },

  getLesson: async (userId: number, lessonId: number, isTeacher: boolean): Promise<Lesson> => {
    const baseUrl = isTeacher ? '/Teacher' : '/Student';
    const response = await api.get(`${baseUrl}/${userId}/lessons/${lessonId}`);
    return response.data;
  },

  uploadAttachment: async (lessonId: number, teacherId: number, data: UploadAttachmentRequest): Promise<void> => {
    await api.post(`/Teacher/lesson/${lessonId}/upload-attachment?teacherId=${teacherId}`, data);
  },

  getLessonAttachments: async (lessonId: number): Promise<LessonAttachment[]> => {
    const response = await api.get(`/Teacher/lesson/${lessonId}/attachments`);
    return response.data;
  },

  deleteAttachment: async (lessonId: number, attachmentId: number): Promise<void> => {
    await api.delete(`/Teacher/lesson/${lessonId}/attachment/${attachmentId}`);
  },

  createReview: async (review: CreateReviewRequest): Promise<Review> => {
    const response = await api.post('/Review/create', review);
    return response.data;
  },
};

import { apiClient } from '@/services/api-client';
import { Test, Question, Option, UserAnswer } from '../types/tests';

export const testsService = {
  // --- Tests ---
  async getTests(): Promise<Test[]> {
    return apiClient.get<Test[]>('/tests');
  },

  async getTestDetail(id: number): Promise<Test> {
    return apiClient.get<Test>(`/tests/${id}`);
  },

  async createTest(data: Partial<Test>): Promise<Test> {
    return apiClient.post<Test>('/tests', { body: data });
  },

  async updateTest(id: number, data: Partial<Test>): Promise<Test> {
    return apiClient.patch<Test>(`/tests/${id}`, { body: data });
  },

  async deleteTest(id: number): Promise<void> {
    return apiClient.delete<void>(`/tests/${id}`);
  },

  // --- Questions ---
  async createQuestion(data: Partial<Question>): Promise<Question> {
    return apiClient.post<Question>(`/tests/questions/${data.test_id}`, { body: data });
  },

  async updateQuestion(id: number, data: Partial<Question>): Promise<Question> {
    return apiClient.patch<Question>(`/tests/questions/${id}`, { body: data });
  },

  async deleteQuestion(id: number): Promise<void> {
    return apiClient.delete<void>(`/tests/questions/${id}`);
  },

  // --- Options ---
  async createOption(data: Partial<Option>): Promise<Option> {
    return apiClient.post<Option>(`/tests/questions/options/${data.question_id}`, { body: data });
  },

  async updateOption(id: number, data: Partial<Option>): Promise<Option> {
    return apiClient.patch<Option>(`/tests/questions/options/${id}`, { body: data });
  },

  async deleteOption(id: number): Promise<void> {
    return apiClient.delete<void>(`/tests/questions/options/${id}`);
  },

  // --- Answers & Participation ---
  async checkAllowed(): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.65.10.20:7575'}/tests/answers/allow`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.status === 200;
    } catch (e) {
      return false;
    }
  },

  async getWorkerTest(): Promise<Test> {
    return apiClient.get<Test>('/worker/tests');
  },

  async submitAnswers(payload: any[]): Promise<void> {
    return apiClient.post<void>('/tests/answers', { body: payload });
  },

  async getTestAnswers(testId: number): Promise<UserAnswer[]> {
    return apiClient.get<UserAnswer[]>(`/tests/answers/${testId}`);
  }
};

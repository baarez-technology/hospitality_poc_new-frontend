import { http, HttpResponse } from 'msw';
import { ENV } from '@/config/env';

export const handlers = [
  // Auth endpoints
  http.post(`${ENV.API_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        },
        accessToken: 'mock-access-token',
      },
    });
  }),

  http.post(`${ENV.API_URL}/auth/signup`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'newuser@example.com',
          fullName: 'New User',
          emailVerified: false,
          createdAt: new Date().toISOString(),
        },
        accessToken: 'mock-access-token',
      },
    });
  }),

  http.post(`${ENV.API_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      data: null,
    });
  }),
];

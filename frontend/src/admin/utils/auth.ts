// src/admin/utils/auth.ts
export function getAuthToken(): string | null {
    return localStorage.getItem('token');
  }
  
  export function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }
  
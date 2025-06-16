// src/admin/utils/api.ts
import { API_BASE } from './constants';
import { getAuthHeaders } from './auth';

export async function fetchUsers() {
  const response = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createUser(user: any) {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(user)
  });
  return response.json();
}

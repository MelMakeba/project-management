// src/admin/utils/projectApi.ts
import { API_BASE } from './constants';
import { getAuthHeaders } from './auth';

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function createProject(project: any) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(project)
  });
  return res.json();
}

export async function deleteProject(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res;
}

export async function assignProject(projectId: string, userId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/assign/${userId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectId, userId })
  });
  return res.json();
}

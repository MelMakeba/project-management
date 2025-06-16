// src/admin/dashboard.ts
import { API_BASE } from './utils/constants';
import { getAuthHeaders } from './utils/auth';

document.addEventListener('DOMContentLoaded', async () => {
  const userCountEl = document.getElementById('totalUsers')!;
  const projectCountEl = document.getElementById('totalProjects')!;
  const assignedCountEl = document.getElementById('assignedProjects')!;
  const unassignedCountEl = document.getElementById('unassignedProjects')!;

  try {
    // Fetch users
    const usersRes = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    const users = await usersRes.json();
    userCountEl.textContent = users.length;

    // Fetch projects
    const projectsRes = await fetch(`${API_BASE}/projects`, {
      headers: getAuthHeaders(),
    });
    const projects = await projectsRes.json();
    projectCountEl.textContent = projects.length;

    const assigned = projects.filter((p: any) => p.assignedTo).length;
    const unassigned = projects.length - assigned;

    assignedCountEl.textContent = assigned.toString();
    unassignedCountEl.textContent = unassigned.toString();
  } catch (err) {
    console.error('Dashboard Load Error:', err);
  }
});

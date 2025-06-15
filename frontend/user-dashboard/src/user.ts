// user.ts

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  isCompleted: boolean;
}

async function fetchUserProjects(userId: number): Promise<Project[]> {
  const response = await fetch(`/api/users/${userId}/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

function renderProjects(projects: Project[]): void {
  const container = document.getElementById('userProjects');
  if (!container) return;

  container.innerHTML = '';

  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = `project-card ${project.isCompleted ? 'complete' : 'incomplete'}`;

    projectCard.innerHTML = `
      <h4 class="project-title">${project.name}</h4>
      <p class="project-desc">${project.description}</p>
      <p class="project-date"><strong>Created At:</strong> ${project.createdAt}</p>
      <button class="status-btn">${project.isCompleted ? 'Completed' : 'Mark as Complete'}</button>
    `;

    container.appendChild(projectCard);
  });
}

function showError(message: string): void {
  const container = document.getElementById('userProjects');
  if (container) {
    container.innerHTML = `<p style="color: red;">${message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const userId = 1; // Get the logged-in user ID dynamically if needed

  try {
    const projects = await fetchUserProjects(userId);
    renderProjects(projects);
  } catch (error) {
    showError((error as Error).message);
  }
});

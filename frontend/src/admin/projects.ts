// src/admin/projects.ts
import { fetchProjects, createProject, deleteProject, assignProject } from './utils/projectApi';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createProjectForm') as HTMLFormElement;
  const projectList = document.getElementById('projectList') as HTMLElement;

  async function loadProjects() {
    const projects = await fetchProjects();
    projectList.innerHTML = '';

    projects.forEach((project: any) => {
      const div = document.createElement('div');
      div.className = 'project-card';
      div.innerHTML = `
        <h4>${project.name}</h4>
        <p>${project.description}</p>
        <p>End Date: ${new Date(project.endDate).toLocaleDateString()}</p>
        <button data-id="${project.id}" class="delete-btn">Delete</button>
        <br />
        <input type="text" placeholder="User ID to assign" class="assign-user" />
        <button data-id="${project.id}" class="assign-btn">Assign to User</button>
      `;
      projectList.appendChild(div);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.target as HTMLButtonElement).dataset.id!;
        await deleteProject(id);
        loadProjects();
      });
    });

    document.querySelectorAll('.assign-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.target as HTMLButtonElement).dataset.id!;
        const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
        const userId = input.value.trim();
        if (!userId) return alert('User ID required');

        await assignProject(id, userId);
        alert('Project assigned!');
      });
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (document.getElementById('projectName') as HTMLInputElement).value;
    const description = (document.getElementById('projectDescription') as HTMLInputElement).value;
    const endDate = (document.getElementById('projectEndDate') as HTMLInputElement).value;

    await createProject({ name, description, endDate });
    form.reset();
    loadProjects();
  });

  loadProjects();
});

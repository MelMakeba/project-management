interface User {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  createdAt: string;
  description: string;
  isAssigned: boolean;
  isCompleted: boolean;
}

interface Assignment {
  userId: number;
  projectId: number;
  userName: string;
  projectName: string;
}


const userSelect = document.getElementById('userSelect') as HTMLSelectElement;
const projectSelect = document.getElementById('projectSelect') as HTMLSelectElement;
const assignedList = document.querySelector('.assigned-projects ul')!;
const projectList = document.querySelector('.all-projects ul')!;

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
});


async function loadDashboard() {
  const [users, projects, assignments] = await Promise.all([
    fetchUsers(),
    fetchProjects(),
    fetchAssignments()
  ]);

  populateUsers(users);
  populateProjects(projects);
  populateAssigned(assignments);
  populateStats(users, projects, assignments);
}


async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  return res.json();
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects');
  return res.json();
}

async function fetchAssignments(): Promise<Assignment[]> {
  const res = await fetch('/api/assignments');
  return res.json();
}


function populateUsers(users: User[]) {
  userSelect.innerHTML = '';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id.toString();
    option.textContent = user.name;
    userSelect.appendChild(option);
  });
}

function populateProjects(projects: Project[]) {
  projectSelect.innerHTML = '';
  projectList.innerHTML = '';
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id.toString();
    option.textContent = project.name;
    projectSelect.appendChild(option);

    const li = document.createElement('li');
    li.textContent = `${project.name} - ${project.createdAt}`;
    projectList.appendChild(li);
  });
}

function populateAssigned(assignments: Assignment[]) {
  assignedList.innerHTML = '';
  assignments.forEach(assign => {
    const li = document.createElement('li');
    li.textContent = `${assign.userName} → ${assign.projectName}`;
    assignedList.appendChild(li);
  });
}

function populateStats(users: User[], projects: Project[], assignments: Assignment[]) {
  const stats = document.querySelectorAll('.card .project-stats h3');
  if (!stats.length) return;

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.isCompleted).length;
  const pendingProjects = projects.filter(p => !p.isCompleted).length;
  const unassignedProjects = projects.filter(p => !p.isAssigned).length;
  const totalUsers = users.length;
  const usersWithProjects = new Set(assignments.map(a => a.userId)).size;
  const usersWithoutProjects = totalUsers - usersWithProjects;

  stats[0].textContent = totalProjects.toString();
  stats[1].textContent = completedProjects.toString();
  stats[2].textContent = pendingProjects.toString();
  stats[3].textContent = unassignedProjects.toString();
  stats[4].textContent = totalUsers.toString();
  stats[5].textContent = usersWithProjects.toString();
  stats[6].textContent = usersWithoutProjects.toString();
}


document.querySelector('.card-project form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = (document.getElementById('name') as HTMLInputElement).value;
  const createdAt = (document.getElementById('createdAt') as HTMLInputElement).value;
  const description = (document.getElementById('description') as HTMLTextAreaElement).value;

  if (!name || !createdAt) return alert('Project name and date required');

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, createdAt, description }),
  });

  if (res.ok) {
    await loadDashboard();
  } else {
    alert('Failed to create project');
  }
});


document.querySelector('.assign-projects form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userId = Number(userSelect.value);
  const projectId = Number(projectSelect.value);

  const res = await fetch('/api/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, projectId }),
  });

  if (res.ok) {
    await loadDashboard();
  } else {
    alert('Failed to assign project');
  }
});

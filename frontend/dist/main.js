"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
const userSelect = document.getElementById('userSelect');
const projectSelect = document.getElementById('projectSelect');
const assignedList = document.querySelector('.assigned-projects ul');
const projectList = document.querySelector('.all-projects ul');
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    yield loadDashboard();
}));
function loadDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const [users, projects, assignments] = yield Promise.all([
            fetchUsers(),
            fetchProjects(),
            fetchAssignments()
        ]);
        populateUsers(users);
        populateProjects(projects);
        populateAssigned(assignments);
        populateStats(users, projects, assignments);
    });
}
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch('/api/users');
        return res.json();
    });
}
function fetchProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch('/api/projects');
        return res.json();
    });
}
function fetchAssignments() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch('/api/assignments');
        return res.json();
    });
}
function populateUsers(users) {
    userSelect.innerHTML = '';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id.toString();
        option.textContent = user.name;
        userSelect.appendChild(option);
    });
}
function populateProjects(projects) {
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
function populateAssigned(assignments) {
    assignedList.innerHTML = '';
    assignments.forEach(assign => {
        const li = document.createElement('li');
        li.textContent = `${assign.userName} → ${assign.projectName}`;
        assignedList.appendChild(li);
    });
}
function populateStats(users, projects, assignments) {
    const stats = document.querySelectorAll('.card .project-stats h3');
    if (!stats.length)
        return;
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
(_a = document.querySelector('.card-project form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const createdAt = document.getElementById('createdAt').value;
    const description = document.getElementById('description').value;
    if (!name || !createdAt)
        return alert('Project name and date required');
    const res = yield fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, createdAt, description }),
    });
    if (res.ok) {
        yield loadDashboard();
    }
    else {
        alert('Failed to create project');
    }
}));
(_b = document.querySelector('.assign-projects form')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const userId = Number(userSelect.value);
    const projectId = Number(projectSelect.value);
    const res = yield fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectId }),
    });
    if (res.ok) {
        yield loadDashboard();
    }
    else {
        alert('Failed to assign project');
    }
}));

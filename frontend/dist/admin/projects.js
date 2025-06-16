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
Object.defineProperty(exports, "__esModule", { value: true });
// src/admin/projects.ts
const projectApi_1 = require("./utils/projectApi");
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createProjectForm');
    const projectList = document.getElementById('projectList');
    function loadProjects() {
        return __awaiter(this, void 0, void 0, function* () {
            const projects = yield (0, projectApi_1.fetchProjects)();
            projectList.innerHTML = '';
            projects.forEach((project) => {
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
                btn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
                    const id = e.target.dataset.id;
                    yield (0, projectApi_1.deleteProject)(id);
                    loadProjects();
                }));
            });
            document.querySelectorAll('.assign-btn').forEach(btn => {
                btn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
                    const id = e.target.dataset.id;
                    const input = e.target.previousElementSibling;
                    const userId = input.value.trim();
                    if (!userId)
                        return alert('User ID required');
                    yield (0, projectApi_1.assignProject)(id, userId);
                    alert('Project assigned!');
                }));
            });
        });
    }
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const name = document.getElementById('projectName').value;
        const description = document.getElementById('projectDescription').value;
        const endDate = document.getElementById('projectEndDate').value;
        yield (0, projectApi_1.createProject)({ name, description, endDate });
        form.reset();
        loadProjects();
    }));
    loadProjects();
});

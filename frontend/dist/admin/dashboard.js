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
// src/admin/dashboard.ts
const constants_1 = require("./utils/constants");
const auth_1 = require("./utils/auth");
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    const userCountEl = document.getElementById('totalUsers');
    const projectCountEl = document.getElementById('totalProjects');
    const assignedCountEl = document.getElementById('assignedProjects');
    const unassignedCountEl = document.getElementById('unassignedProjects');
    try {
        // Fetch users
        const usersRes = yield fetch(`${constants_1.API_BASE}/users`, {
            headers: (0, auth_1.getAuthHeaders)(),
        });
        const users = yield usersRes.json();
        userCountEl.textContent = users.length;
        // Fetch projects
        const projectsRes = yield fetch(`${constants_1.API_BASE}/projects`, {
            headers: (0, auth_1.getAuthHeaders)(),
        });
        const projects = yield projectsRes.json();
        projectCountEl.textContent = projects.length;
        const assigned = projects.filter((p) => p.assignedTo).length;
        const unassigned = projects.length - assigned;
        assignedCountEl.textContent = assigned.toString();
        unassignedCountEl.textContent = unassigned.toString();
    }
    catch (err) {
        console.error('Dashboard Load Error:', err);
    }
}));

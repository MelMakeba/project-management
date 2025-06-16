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
exports.fetchProjects = fetchProjects;
exports.createProject = createProject;
exports.deleteProject = deleteProject;
exports.assignProject = assignProject;
// src/admin/utils/projectApi.ts
const constants_1 = require("./constants");
const auth_1 = require("./auth");
function fetchProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${constants_1.API_BASE}/projects`, {
            headers: (0, auth_1.getAuthHeaders)()
        });
        return res.json();
    });
}
function createProject(project) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${constants_1.API_BASE}/projects`, {
            method: 'POST',
            headers: (0, auth_1.getAuthHeaders)(),
            body: JSON.stringify(project)
        });
        return res.json();
    });
}
function deleteProject(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${constants_1.API_BASE}/projects/${projectId}`, {
            method: 'DELETE',
            headers: (0, auth_1.getAuthHeaders)()
        });
        return res;
    });
}
function assignProject(projectId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${constants_1.API_BASE}/projects/${projectId}/assign/${userId}/`, {
            method: 'PATCH',
            headers: (0, auth_1.getAuthHeaders)(),
            body: JSON.stringify({ projectId, userId })
        });
        return res.json();
    });
}

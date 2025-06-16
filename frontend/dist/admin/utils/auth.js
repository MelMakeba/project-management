"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthToken = getAuthToken;
exports.getAuthHeaders = getAuthHeaders;
// src/admin/utils/auth.ts
function getAuthToken() {
    return localStorage.getItem('token');
}
function getAuthHeaders() {
    const token = getAuthToken();
    return Object.assign({ 'Content-Type': 'application/json' }, (token && { Authorization: `Bearer ${token}` }));
}

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
// src/admin/users.ts
const api_1 = require("./utils/api");
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createUserForm');
    const userList = document.getElementById('userList');
    function loadUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield (0, api_1.fetchUsers)();
            userList.innerHTML = '';
            users.forEach((user) => {
                const div = document.createElement('div');
                div.className = 'user-card';
                div.innerHTML = `
        <p><strong>${user.name}</strong> (${user.email})</p>
        <p>Role: ${user.role}</p>
      `;
                userList.appendChild(div);
            });
        });
    }
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const newUser = { name, email, password, role };
        try {
            yield (0, api_1.createUser)(newUser);
            alert('User created successfully');
            form.reset();
            loadUsers();
        }
        catch (err) {
            console.error('Error creating user:', err);
            alert('Failed to create user');
        }
    }));
    loadUsers();
});

// src/admin/users.ts
import { fetchUsers, createUser } from './utils/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createUserForm') as HTMLFormElement;
  const userList = document.getElementById('userList') as HTMLElement;

  async function loadUsers() {
    const users = await fetchUsers();
    userList.innerHTML = '';

    users.forEach((user: any) => {
      const div = document.createElement('div');
      div.className = 'user-card';
      div.innerHTML = `
        <p><strong>${user.name}</strong> (${user.email})</p>
        <p>Role: ${user.role}</p>
      `;
      userList.appendChild(div);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (document.getElementById('name') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const role = (document.getElementById('role') as HTMLSelectElement).value;

    const newUser = { name, email, password, role };

    try {
      await createUser(newUser);
      alert('User created successfully');
      form.reset();
      loadUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user');
    }
  });

  loadUsers();
});

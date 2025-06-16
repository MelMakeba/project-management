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
// Utility to fetch user from localStorage
function getLoggedInUser() {
    const stored = localStorage.getItem('loggedInUser');
    return stored ? JSON.parse(stored) : null;
}
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    const user = getLoggedInUser();
    const userNameEl = document.getElementById('userName');
    const projectSection = document.getElementById('projectSection');
    const markCompletedBtn = document.getElementById('markCompleted');
    if (!user) {
        alert('User not logged in!');
        window.location.href = '../login/login.html';
        return;
    }
    userNameEl.textContent = user.name;
    try {
        const res = yield fetch(`http://localhost:3000/users/${user.id}/project`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        });
        if (!res.ok)
            throw new Error('No project assigned');
        const project = yield res.json();
        projectSection.innerHTML = `
        <h2>${project.name}</h2>
        <p><strong>Description:</strong> ${project.description}</p>
        <p><strong>End Date:</strong> ${new Date(project.endDate).toLocaleDateString()}</p>
      `;
        if (!project.isCompleted) {
            markCompletedBtn.classList.remove('hidden');
            markCompletedBtn.onclick = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const completeRes = yield fetch(`http://localhost:3000/${user.id}/completed`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${user.token}`
                        }
                    });
                    const completeData = yield completeRes.json();
                    if (completeRes.ok) {
                        alert('Project marked as completed. Admin has been notified.');
                        markCompletedBtn.classList.add('hidden');
                    }
                    else {
                        alert(completeData.message || 'Error marking as completed.');
                    }
                }
                catch (err) {
                    alert('Error completing project. Try again later.');
                }
            });
        }
    }
    catch (err) {
        projectSection.innerHTML = `<p>No project assigned yet. Please wait for your admin.</p>`;
    }
}));

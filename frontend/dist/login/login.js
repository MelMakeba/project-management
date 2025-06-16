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
// Helper function to validate email format
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
// Handle login logic
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.register-form');
    form === null || form === void 0 ? void 0 : form.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        const emailInput = document.querySelector('#email');
        const passwordInput = document.querySelector('#password');
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        // Validation
        if (!email || !password) {
            alert('Please fill in both email and password.');
            return;
        }
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        const loginUser = { email, password };
        try {
            const response = yield fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginUser)
            });
            const data = yield response.json();
            if (response.ok) {
                // ✅ Store token & user info
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Login successful!');
                form.reset();
                // ✅ Redirect based on role
                if (data.user.role === 'ADMIN') {
                    window.location.href = '../adminDasboard/admin.html';
                }
                else {
                    window.location.href = '../userDashboard/userDashboard.html';
                }
            }
            else {
                alert(data || 'Login failed. Please try again.');
            }
        }
        catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again later.');
        }
    }));
});

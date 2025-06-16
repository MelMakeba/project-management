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
function isEmailValid(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
// Handle registration logic
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.register-form');
    form === null || form === void 0 ? void 0 : form.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        const nameInput = document.querySelector('#fullname');
        const emailInput = document.querySelector('#email');
        const passwordInput = document.querySelector('#password');
        const confirmPasswordInput = document.querySelector('#confirm-password');
        const submitBtn = document.getElementById('submit-btn');
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
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
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        const newUser = {
            name,
            email,
            password,
            role: 'USER',
            id: "",
            token: ""
        };
        try {
            const response = yield fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            const data = yield response.json();
            if (response.ok) {
                alert('Registration successful!');
                form.reset();
                window.location.href = '../login/login.html';
            }
            else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        }
        catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again later.');
        }
    }));
});

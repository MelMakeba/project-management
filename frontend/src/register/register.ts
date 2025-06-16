// Define User interface
interface User {
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
  }
  
  // Helper function to validate email format
  function isEmailValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // Handle registration logic
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.register-form') as HTMLFormElement;
  
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const nameInput = document.querySelector('#fullname') as HTMLInputElement;
      const emailInput = document.querySelector('#email') as HTMLInputElement;
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = document.querySelector('#confirm-password') as HTMLInputElement;
      const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
  
      // Validation
      if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
      }
  
      if (!isEmailValid(email)) {
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
  
      const newUser: User = {
        name,
        email,
        password,
        role: 'USER',
        id: 0,
        token: ""
      };
  
      try {
        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert('Registration successful!');
          form.reset();
          window.location.href = '../login/login.html';
        } else {
          alert(data.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again later.');
      }
    });
  });
  
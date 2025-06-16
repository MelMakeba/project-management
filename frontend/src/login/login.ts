// Define LoginUser and LoginResponse interfaces
interface LoginUser {
    email: string;
    password: string;
  }
  
  interface LoginResponse {
    access_token: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: 'USER' | 'ADMIN';
    };
  }
  
  // Helper function to validate email format
  function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // Handle login logic
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.register-form') as HTMLFormElement;
  
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const emailInput = document.querySelector('#email') as HTMLInputElement;
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
  
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
  
      const loginUser: LoginUser = { email, password };
  
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginUser)
        });
  
        const data: LoginResponse = await response.json();
  
        if (response.ok) {
          // ✅ Store token & user info
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
  
          alert('Login successful!');
          form.reset();
  
          // ✅ Redirect based on role
          if (data.user.role === 'ADMIN') {
            window.location.href = '../adminDasboard/admin.html';
          } else {
            window.location.href = '../userDashboard/userDashboard.html';
          }
  
        } else {
          alert(data || 'Login failed. Please try again.');
        }
  
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again later.');
      }
    });
  });
  
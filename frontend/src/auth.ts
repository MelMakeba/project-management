
const API_URL = 'http://localhost:3000';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

async function login(credentials: LoginData): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: ApiResponse<any> = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('authToken', data.token);
      
      showNotification('Login successful! Redirecting...', 'success');
      
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
      const userRole = tokenPayload.role;
      
      setTimeout(() => {
        if (userRole === 'ADMIN') {
          window.location.href = '../../admin-dasboard/admin.html';
        } else {
          window.location.href = '../../user-dashboard/user.html';
        }
      }, 1000);
      
    } else {
      showNotification(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('An error occurred during login', 'error');
  }
}

async function register(userData: RegisterData): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data: ApiResponse<any> = await response.json();

    if (data.success) {
      showNotification('Registration successful! Redirecting to login...', 'success');
      
      setTimeout(() => {
        window.location.href = '../Login/login.html';
      }, 1500);
    } else {
      showNotification(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showNotification('An error occurred during registration', 'error');
  }
}

function initializeEventListeners(): void {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      
      const credentials: LoginData = {
        email: emailInput.value,
        password: passwordInput.value,
      };
      
      await login(credentials);
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmPasswordInput = document.getElementById('cpassword') as HTMLInputElement;
      
      if (passwordInput.value !== confirmPasswordInput.value) {
        showNotification('Passwords do not match', 'error');
        return;
      }
      
      const userData: RegisterData = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        role: 'USER', 
      };
      
      await register(userData);
    });
  }
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);
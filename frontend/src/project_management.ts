enum ProjectStatus {
    ISPENDING = 'PENDING',
    ISIN_PROGRESS = 'IN_PROGRESS',
    ISCOMPLETED = 'COMPLETED'
}

enum UserRole {
    ISADMIN = 'ADMIN',
    ISUSER = 'USER'
  }

interface Project {
    id: string;
    name?: string;
    title?: string; 
    description: string;
    status: ProjectStatus;
    endDate?: string;
    dueDate?: string; 
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

class ApiClients {
    private static baseUrl: string = 'http://localhost:3000';
    private static token: string | null = localStorage.getItem('authToken');

    static getUserInfo(): { id: string; role: string; email: string } | null {
        const token = this.token;
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.sub,
                role: payload.role,
                email: payload.email
            };
        } catch (e) {
            console.error("Failed to decode token", e);
            return null;
        }
    }

    static async request<T>(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<ApiResponse<T>> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json();

            if (!response.ok) {
                this.showNotification(data.message || 'An error occurred', 'error');
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            document.body.removeChild(notification);
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '9999';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

        if (type === 'success') {
            notification.style.backgroundColor = '#4CAF50';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#F44336';
        } else {
            notification.style.backgroundColor = '#2196F3';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

class ProjectsService {
    static async getAllProjects(): Promise<Project[]> {
        try {
            const response = await ApiClients.request<Project[]>('/projects');
            return response.data || [];
        } catch (error) {
            ApiClients.showNotification('Failed to load projects', 'error');
            return [];
        }
    }

    static async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
        try {
            const response = await ApiClients.request<Project[]>(`/projects/status/${status.toLowerCase()}`);
            return response.data || [];
        } catch (error) {
            ApiClients.showNotification(`Failed to load ${status.toLowerCase()} projects`, 'error');
            return [];
        }
    }

    static async getProjectById(id: string): Promise<Project | null> {
        try {
            const response = await ApiClients.request<Project>(`/projects/${id}`);
            return response.data || null;
        } catch (error) {
            ApiClients.showNotification('Failed to load project details', 'error');
            return null;
        }
    }

    static async createProject(project: Partial<Project>): Promise<Project | null> {
        try {
            const response = await ApiClients.request<Project>('/projects', 'POST', project);
            ApiClients.showNotification('Project created successfully', 'success');
            return response.data || null;
        } catch (error) {
            ApiClients.showNotification('Failed to create project', 'error');
            return null;
        }
    }

    static async updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
        try {
            const response = await ApiClients.request<Project>(`/projects/${id}`, 'PATCH', project);
            ApiClients.showNotification('Project updated successfully', 'success');
            return response.data || null;
        } catch (error) {
            ApiClients.showNotification('Failed to update project', 'error');
            return null;
        }
    }

    static async deleteProject(id: string): Promise<boolean> {
        try {
            await ApiClients.request(`/projects/${id}`, 'DELETE');
            ApiClients.showNotification('Project deleted successfully', 'success');
            return true;
        } catch (error) {
            ApiClients.showNotification('Failed to delete project', 'error');
            return false;
        }
    }

    static async assignProject(projectId: string, userId: string): Promise<Project | null> {
        try {
            const response = await ApiClients.request<Project>(`/projects/${projectId}/assign/${userId}`, 'PATCH');
            ApiClients.showNotification('Project assigned successfully', 'success');
            return response.data || null;
        } catch (error) {
            ApiClients.showNotification('Failed to assign project', 'error');
            return null;
        }
    }

    static async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<Project | null> {
        try {
            const response = await ApiClients.request<Project>(`/projects/${projectId}/status`, 'PATCH', { status });
            ApiClients.showNotification('Project status updated successfully', 'success');
            return response.data || null;
        } catch (error) {
            ApiClients.showNotification('Failed to update project status', 'error');
            return null;
        }
    }
}

class UsersService {
    static async getAllUsers(): Promise<User[]> {
        try {
            const response = await ApiClients.request<User[]>('/users');
            return response.data || [];
        } catch (error) {
            ApiClients.showNotification('Failed to load users', 'error');
            return [];
        }
    }

    static async getUserById(id: string): Promise<User | null> {
        try {
            const response = await ApiClients.request<User>(`/users/${id}`);
            return response.data || null;
        } catch (error) {
            ApiClients.showNotification('Failed to load user details', 'error');
            return null;
        }
    }
}

class ProjectManagementPage {
    private projectNameInput: HTMLInputElement | null = null;
    private projectDescriptionInput: HTMLTextAreaElement | null = null;
    private endDateInput: HTMLInputElement | null = null; 
    private projectList: HTMLUListElement | null = null;
    private userSelect: HTMLSelectElement | null = null;
    private assignForm: HTMLFormElement | null = null;
    private assignedProjectsList: HTMLUListElement | null = null;
    private deleteButton: HTMLButtonElement | null = null;
    private createProjectForm: HTMLFormElement | null = null;
    private deleteProjectSelect: HTMLSelectElement | null = null;
    private projectSelectForAssignment: HTMLSelectElement | null = null;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        const userInfo = ApiClients.getUserInfo();
        if (!userInfo || userInfo.role !== 'ADMIN') {
            ApiClients.showNotification('Access denied. Admin privileges required.', 'error');
            setTimeout(() => {
                window.location.href = '../Login-Register/Login/login.html';
            }, 2000);
            return;
        }

        // Make sure we have consistent references - using correct IDs
        this.projectNameInput = document.getElementById('name') as HTMLInputElement;
        this.projectDescriptionInput = document.getElementById('description') as HTMLTextAreaElement;
        this.endDateInput = document.getElementById('endDate') as HTMLInputElement;
        this.projectList = document.querySelector('.all-projects ul') as HTMLUListElement;
        this.userSelect = document.getElementById('userSelect') as HTMLSelectElement;
        this.assignForm = document.querySelector('.assign-projects form') as HTMLFormElement;
        this.assignedProjectsList = document.querySelector('.assigned-projects ul') as HTMLUListElement;
        // Fix: Use the correct ID from HTML (lowercase)
        this.deleteProjectSelect = document.getElementById('deleteprojectSelect') as HTMLSelectElement;
        this.deleteButton = document.querySelector('.delete-btn') as HTMLButtonElement;
        this.createProjectForm = document.querySelector('.card-project form') as HTMLFormElement;
        this.projectSelectForAssignment = document.getElementById('projectSelect') as HTMLSelectElement;
        
        // Only setup missing elements if they truly don't exist in DOM
        if (!this.userSelect || !this.deleteProjectSelect || !this.deleteButton) {
            this.setupMissingElements();
        }

        await Promise.all([
            this.loadProjects(),
            this.loadUsers(),
            this.loadProjectsForAssignment()
        ]);
        
        // Set up event handlers
        this.setupCreateProjectForm();
        this.setupDeleteProjectButton();
        this.setupAssignProjectForm();
        this.addBackButton();
    }

    private setupMissingElements(): void {
        // Only create user select if it doesn't exist
        if (!this.userSelect && this.assignForm) {
            this.userSelect = document.createElement('select');
            this.userSelect.id = 'userSelect';
            const label = document.createElement('label');
            label.htmlFor = 'userSelect';
            label.textContent = 'Select User';
            this.assignForm.appendChild(label);
            this.assignForm.appendChild(this.userSelect);
        }

        // Only create delete project select if it doesn't exist
        const container = document.querySelector('.delete-project');
        if (!this.deleteProjectSelect && container) {
            this.deleteProjectSelect = document.createElement('select');
            this.deleteProjectSelect.id = 'deleteprojectSelect';
            this.deleteProjectSelect.name = 'delete';
            
            const label = document.createElement('label');
            label.htmlFor = 'deleteprojectSelect';
            label.textContent = 'Select Project to Delete';
            
            container.appendChild(label);
            container.appendChild(this.deleteProjectSelect);
        }

        // Only create delete button if it doesn't exist
        if (!this.deleteButton && container) {
            this.deleteButton = document.createElement('button');
            this.deleteButton.className = 'delete-btn';
            this.deleteButton.textContent = 'Delete';
            container.appendChild(this.deleteButton);
        }
    }

    private setupCreateProjectForm(): void {
        if (!this.createProjectForm) return;

        this.createProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.projectNameInput || !this.projectDescriptionInput || !this.endDateInput) {
                ApiClients.showNotification('Form inputs not found', 'error');
                return;
            }
            
            const name = this.projectNameInput.value.trim();
            const description = this.projectDescriptionInput.value.trim();
            const endDate = this.endDateInput.value; // Get endDate from the correct input
            
            if (!name || !description || !endDate) {
                ApiClients.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            const newProject = {
                name,
                description,
                endDate // Include endDate in the project creation request
            };
            
            const result = await ProjectsService.createProject(newProject);
            if (result) {
                this.createProjectForm?.reset();
                this.loadProjects();
            }
        });
    }

    private setupDeleteProjectButton(): void {
        if (!this.deleteProjectSelect) {
            console.error('Delete project dropdown not found');
            return;
        }
        
        if (!this.deleteButton) {
            console.error('Delete button not found');
            return;
        }
        
        this.deleteButton.addEventListener('click', async () => {
            const projectId = this.deleteProjectSelect?.value;
            
            if (!projectId) {
                ApiClients.showNotification('Please select a project to delete', 'error');
                return;
            }
            
            if (confirm('Are you sure you want to delete this project?')) {
                const deleted = await ProjectsService.deleteProject(projectId);
                if (deleted) {
                    this.loadProjects();
                    ApiClients.showNotification('Project deleted successfully', 'success');
                }
            }
        });
    }

    private setupAssignProjectForm(): void {
        // Get reference to the existing form
        if (!this.assignForm) {
            this.assignForm = document.querySelector('.assign-projects form') as HTMLFormElement;
        }
        
        // Make sure we have references to the select dropdowns
        if (!this.userSelect) {
            this.userSelect = document.getElementById('userSelect') as HTMLSelectElement;
        }
        
        // Use the class property instead of creating a new local variable
        if (!this.projectSelectForAssignment) {
            this.projectSelectForAssignment = document.getElementById('projectSelect') as HTMLSelectElement;
        }
        
        // Add event listener for form submission
        if (this.assignForm) {
            this.assignForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const projectId = this.projectSelectForAssignment?.value;
                const userId = this.userSelect?.value;
                
                if (!projectId) {
                    ApiClients.showNotification('Please select a project', 'error');
                    return;
                }
                
                if (!userId) {
                    ApiClients.showNotification('Please select a user', 'error');
                    return;
                }
                
                const result = await ProjectsService.assignProject(projectId, userId);
                if (result) {
                    // Reload everything to show updated assignments
                    ApiClients.showNotification('Project assigned successfully', 'success');
                    await Promise.all([
                        this.loadProjects(),
                        this.loadProjectsForAssignment(),
                        this.loadUsers()
                    ]);
                    
                    // Reset the form
                    if (this.projectSelectForAssignment) this.projectSelectForAssignment.value = '';
                    if (this.userSelect) this.userSelect.value = '';
                }
            });
        }
    }

    private async loadUsers(): Promise<void> {
        if (!this.userSelect) {
            this.userSelect = document.getElementById('userSelect') as HTMLSelectElement;
        }
        
        if (!this.userSelect) {
            console.error('User selection dropdown not found');
            return;
        }
        
        try {
            // Show loading state
            this.userSelect.innerHTML = '<option value="">Loading users...</option>';
            
            // Get users from the API
            const users = await UsersService.getAllUsers();
            // Fix: Consistent enum usage (ISADMIN)
            const regularUsers = users.filter(user => user.role !== UserRole.ISADMIN);
            
            // Clear and add default option
            this.userSelect.innerHTML = '<option value="">Select a user</option>';
            
            if (regularUsers.length === 0) {
                const option = document.createElement('option');
                option.disabled = true;
                option.textContent = 'No users available';
                this.userSelect.appendChild(option);
            } else {
                // Add each non-admin user as an option
                regularUsers.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.name} (${user.email})`;
                    this.userSelect?.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            if (this.userSelect) {
                this.userSelect.innerHTML = '<option value="">Error loading users</option>';
            }
            ApiClients.showNotification('Failed to load users', 'error');
        }
    }

    private async loadProjects(): Promise<void> {
        try {
            // Fetch all projects
            const projects = await ProjectsService.getAllProjects();
            
            // Update project list
            if (this.projectList) {
                this.projectList.innerHTML = '';
                
                if (projects.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No projects available';
                    this.projectList.appendChild(li);
                } else {
                    // Fix: Actually populate the projects list instead of placeholder comment
                    projects.forEach(project => {
                        const li = document.createElement('li');
                        const projectName = project.name || project.title || 'Unnamed Project';
                        
                        li.innerHTML = `
                            <strong>${projectName}</strong>
                            <p>${project.description}</p>
                            <p>Status: ${project.status}</p>
                            <p>Due: ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
                        `;
                        this.projectList?.appendChild(li);
                    });
                }
            }
            
            // Populate the delete dropdown
            if (this.deleteProjectSelect) {
                this.deleteProjectSelect.innerHTML = '<option value="">Select a project</option>';
                
                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name || project.title || 'Unnamed Project';
                    this.deleteProjectSelect?.appendChild(option);
                });
            } else {
                console.error('Delete project dropdown not found. Check the ID: deleteprojectSelect');
            }
            
            this.loadAssignedProjects(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            ApiClients.showNotification('Failed to load projects', 'error');
            
            if (this.projectList) {
                this.projectList.innerHTML = '<li>Error loading projects</li>';
            }
        }
    }

    private async loadProjectsForAssignment(): Promise<void> {
        // Use the class property instead of a local variable
        if (!this.projectSelectForAssignment) {
            this.projectSelectForAssignment = document.getElementById('projectSelect') as HTMLSelectElement;
        }
        
        if (!this.projectSelectForAssignment) {
            console.error('Project selection dropdown for assignment not found');
            return;
        }
        
        try {
            // Show loading state
            this.projectSelectForAssignment.innerHTML = '<option value="">Loading projects...</option>';
            
            // Get all projects
            const projects = await ProjectsService.getAllProjects();
            
            // Filter for unassigned projects
            const unassignedProjects = projects.filter(project => !project.userId);
            
            // Clear and add default option
            this.projectSelectForAssignment.innerHTML = '<option value="">Select a project</option>';
            
            if (unassignedProjects.length === 0) {
                const option = document.createElement('option');
                option.disabled = true;
                option.textContent = 'No unassigned projects available';
                this.projectSelectForAssignment.appendChild(option);
            } else {
                // Add each unassigned project as an option
                unassignedProjects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name || project.title || 'Unnamed Project';
                    this.projectSelectForAssignment?.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load projects for assignment:', error);
            this.projectSelectForAssignment.innerHTML = '<option value="">Error loading projects</option>';
            ApiClients.showNotification('Failed to load projects', 'error');
        }
    }

    private loadAssignedProjects(allProjects: Project[]): void {
        if (!this.assignedProjectsList) return;
        
        const assignedProjects = allProjects.filter(project => project.userId);
        
        this.assignedProjectsList.innerHTML = '';
        
        if (assignedProjects.length === 0) {
            this.assignedProjectsList.innerHTML = '<li>No projects are currently assigned</li>';
            return;
        }
        
        assignedProjects.forEach(async project => {
            const li = document.createElement('li');
            const projectName = project.name || project.title || 'Unnamed Project';
            
            let userName = 'User ID: ' + project.userId;
            try {
                const user = project.userId ? await UsersService.getUserById(project.userId) : null;
                if (user) {
                    userName = user.name;
                }
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
            
            li.innerHTML = `
                <strong>${projectName}</strong> - Assigned to: ${userName}
                <p>Status: ${project.status}</p>
            `;
            this.assignedProjectsList?.appendChild(li);
        });
    }

    private addBackButton(): void {
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Dashboard';
        backButton.className = 'back-btn';
        backButton.style.position = 'fixed';
        backButton.style.top = '20px';
        backButton.style.left = '20px';
        backButton.style.padding = '10px 15px';
        backButton.style.backgroundColor = '#2196F3';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '4px';
        backButton.style.cursor = 'pointer';
        
        backButton.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
        
        document.body.appendChild(backButton);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProjectManagementPage();
});
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

interface ApiError {
    status: number;
    data: any;
    message: string;
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
                throw {
                    status: response.status,
                    data: data,
                    message: data.message || 'Request failed'
                };
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

    static async showConfirmation(
        message: string, 
        title: string = 'Confirm Action',
        confirmText: string = 'Confirm', 
        cancelText: string = 'Cancel',
        type: 'delete' | 'warning' | 'info' = 'warning'
    ): Promise<boolean> {
        return new Promise((resolve) => {
            const existingDialogs = document.querySelectorAll('.confirmation-dialog-container');
            existingDialogs.forEach(dialog => document.body.removeChild(dialog));
            
            const container = document.createElement('div');
            container.className = 'confirmation-dialog-container';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.style.zIndex = '9999';
            
            const dialog = document.createElement('div');
            dialog.className = 'confirmation-dialog';
            dialog.style.width = '400px';
            dialog.style.maxWidth = '90%';
            dialog.style.backgroundColor = '#fff';
            dialog.style.borderRadius = '8px';
            dialog.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
            dialog.style.overflow = 'hidden';
            dialog.style.animation = 'slide-up 0.3s ease-out forwards';
            
            const icon = document.createElement('div');
            icon.className = `confirmation-icon ${type}`;
            icon.style.textAlign = 'center';
            icon.style.padding = '20px 0';
            icon.style.fontSize = '48px';
            icon.style.backgroundColor = type === 'delete' ? '#FEE2E2' : 
                                        type === 'warning' ? '#FEF3C7' : '#E0F2FE';
            icon.style.color = type === 'delete' ? '#DC2626' : 
                              type === 'warning' ? '#D97706' : '#0284C7';
            
            icon.innerHTML = type === 'delete' ? '⚠️' : 
                            type === 'warning' ? '⚠️' : 'ℹ️';
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = title;
            titleElement.style.margin = '20px 0 10px';
            titleElement.style.textAlign = 'center';
            titleElement.style.fontWeight = '600';
            titleElement.style.color = '#1a5276';
            
            const messageElement = document.createElement('p');
            messageElement.textContent = message;
            messageElement.style.margin = '0 30px 20px';
            messageElement.style.textAlign = 'center';
            messageElement.style.color = '#4B5563';
            
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.padding = '20px 30px';
            buttonsContainer.style.borderTop = '1px solid #E5E7EB';
            buttonsContainer.style.gap = '10px';
            buttonsContainer.style.justifyContent = 'flex-end';
            
            const cancelButton = document.createElement('button');
            cancelButton.textContent = cancelText;
            cancelButton.className = 'cancel-btn';
            cancelButton.style.padding = '10px 20px';
            cancelButton.style.border = '1px solid #D1D5DB';
            cancelButton.style.borderRadius = '6px';
            cancelButton.style.backgroundColor = '#F9FAFB';
            cancelButton.style.color = '#374151';
            cancelButton.style.cursor = 'pointer';
            cancelButton.style.fontWeight = '500';
            
            const confirmButton = document.createElement('button');
            confirmButton.textContent = confirmText;
            confirmButton.className = 'confirm-btn';
            confirmButton.style.padding = '10px 20px';
            confirmButton.style.border = 'none';
            confirmButton.style.borderRadius = '6px';
            confirmButton.style.color = '#fff';
            confirmButton.style.cursor = 'pointer';
            confirmButton.style.fontWeight = '500';
            
            if (type === 'delete') {
                confirmButton.style.backgroundColor = '#DC2626';
            } else if (type === 'warning') {
                confirmButton.style.backgroundColor = '#D97706';
            } else {
                confirmButton.style.backgroundColor = '#3498db';
            }
            
            cancelButton.addEventListener('click', () => {
                document.body.removeChild(container);
                resolve(false);
            });
            
            confirmButton.addEventListener('click', () => {
                document.body.removeChild(container);
                resolve(true);
            });
            
            document.addEventListener('keydown', function escListener(e) {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escListener);
                    document.body.removeChild(container);
                    resolve(false);
                }
            });
            
            dialog.appendChild(icon);
            dialog.appendChild(titleElement);
            dialog.appendChild(messageElement);
            buttonsContainer.appendChild(cancelButton);
            buttonsContainer.appendChild(confirmButton);
            dialog.appendChild(buttonsContainer);
            container.appendChild(dialog);
            
            document.body.appendChild(container);
            
            confirmButton.focus();
        });
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
            console.log('Updating project:', id);
            console.log('With data:', project);
            
            const response = await ApiClients.request<Project>(`/projects/${id}`, 'PATCH', project);
            console.log('Update response:', response);
            
            ApiClients.showNotification('Project updated successfully', 'success');
            return response.data || null;
        } catch (error) {
            console.error('Error updating project:', error);
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
            const apiError = error as ApiError;
            if (apiError.status === 409) {
                const errorMessage = apiError.data?.error || 'Project or user already has an assignment';
                ApiClients.showNotification(errorMessage, 'error');
            } else if (apiError.status === 404) {
                const errorMessage = apiError.data?.error || 'Project or user not found';
                ApiClients.showNotification(errorMessage, 'error');
            } else {
                ApiClients.showNotification(
                    apiError.data?.error || 'Failed to assign project', 
                    'error'
                );
            }
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
    private projectSelectForUpdate: HTMLSelectElement | null = null; // New select for updating
    private currentProjectId: string | null = null; // Track currently editing project
    private isEditMode: boolean = false; // Track if form is in edit mode
    private formSubmitButton: HTMLButtonElement | null = null; // Form submit button reference

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

        this.projectNameInput = document.getElementById('name') as HTMLInputElement;
        this.projectDescriptionInput = document.getElementById('description') as HTMLTextAreaElement;
        this.endDateInput = document.getElementById('endDate') as HTMLInputElement;
        this.projectList = document.querySelector('.all-projects ul') as HTMLUListElement;
        this.userSelect = document.getElementById('userSelect') as HTMLSelectElement;
        this.assignForm = document.querySelector('.assign-projects form') as HTMLFormElement;
        this.assignedProjectsList = document.querySelector('.assigned-projects ul') as HTMLUListElement;
        this.deleteProjectSelect = document.getElementById('deleteprojectSelect') as HTMLSelectElement;
        this.deleteButton = document.querySelector('.delete-btn') as HTMLButtonElement;
        this.createProjectForm = document.querySelector('.card-project form') as HTMLFormElement;
        this.projectSelectForAssignment = document.getElementById('projectSelect') as HTMLSelectElement;
        
        // Get the submit button
        if (this.createProjectForm) {
            this.formSubmitButton = this.createProjectForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        }
        
        this.createUpdateProjectSelection();
        
        if (!this.userSelect || !this.deleteProjectSelect || !this.deleteButton) {
            this.setupMissingElements();
        }

        await Promise.all([
            this.loadProjects(),
            this.loadUsers(),
            this.loadProjectsForAssignment()
        ]);
        
        this.setupCreateProjectForm();
        this.setupDeleteProjectButton();
        this.setupAssignProjectForm();
        this.addBackButton();
    }

    private createUpdateProjectSelection(): void {
        // Create container for the project update selection
        const formContainer = this.createProjectForm?.parentElement;
        if (!formContainer) return;

        const updateSelectContainer = document.createElement('div');
        updateSelectContainer.className = 'update-project-selection';
        updateSelectContainer.style.marginBottom = '20px';
        
        const label = document.createElement('label');
        label.textContent = 'Select Project to Update:';
        label.style.display = 'block';
        label.style.marginBottom = '8px';
        label.style.fontWeight = 'bold';
        
        this.projectSelectForUpdate = document.createElement('select');
        this.projectSelectForUpdate.style.width = '100%';
        this.projectSelectForUpdate.style.padding = '8px';
        this.projectSelectForUpdate.style.borderRadius = '4px';
        this.projectSelectForUpdate.style.border = '1px solid #ccc';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select a project --';
        this.projectSelectForUpdate.appendChild(defaultOption);
        
        this.projectSelectForUpdate.addEventListener('change', () => this.handleProjectSelectionChange());
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '10px';
        
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Load for Editing';
        updateButton.className = 'load-for-edit-btn';
        updateButton.style.padding = '8px 16px';
        updateButton.style.backgroundColor = '#3498db';
        updateButton.style.color = 'white';
        updateButton.style.border = 'none';
        updateButton.style.borderRadius = '4px';
        updateButton.style.cursor = 'pointer';
        updateButton.style.marginRight = '10px';
        
        updateButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadProjectForEditing();
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel Edit';
        cancelButton.className = 'cancel-edit-btn';
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.backgroundColor = '#e74c3c';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.display = 'none'; // Hidden initially
        
        cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.cancelEditing();
        });
        
        buttonContainer.appendChild(updateButton);
        buttonContainer.appendChild(cancelButton);
        
        updateSelectContainer.appendChild(label);
        updateSelectContainer.appendChild(this.projectSelectForUpdate);
        updateSelectContainer.appendChild(buttonContainer);
        
        // Insert before the project form
        formContainer.insertBefore(updateSelectContainer, this.createProjectForm);
    }

    private async handleProjectSelectionChange(): Promise<void> {
        if (!this.projectSelectForUpdate) return;
        
        const selectedProjectId = this.projectSelectForUpdate.value;
        if (!selectedProjectId) return;
    }

    private async loadProjectForEditing(): Promise<void> {
        if (!this.projectSelectForUpdate || !this.projectNameInput || 
            !this.projectDescriptionInput || !this.endDateInput || !this.formSubmitButton) return;
        
        const selectedProjectId = this.projectSelectForUpdate.value;
        if (!selectedProjectId) {
            ApiClients.showNotification('Please select a project to edit', 'error');
            return;
        }
        
        // Load project details
        const project = await ProjectsService.getProjectById(selectedProjectId);
        if (!project) {
            ApiClients.showNotification('Failed to load project details', 'error');
            return;
        }
        
        // Populate form with project data
        this.projectNameInput.value = project.name || project.title || '';
        this.projectDescriptionInput.value = project.description || '';
        
        if (project.endDate || project.dueDate) {
            // Format date to YYYY-MM-DD for input
            const date = new Date(project.endDate || project.dueDate || '');
            const formattedDate = date.toISOString().split('T')[0];
            this.endDateInput.value = formattedDate;
        } else {
            this.endDateInput.value = '';
        }
        
        // Update UI to indicate edit mode
        this.isEditMode = true;
        this.currentProjectId = selectedProjectId;
        this.formSubmitButton.textContent = 'Update Project';
        
        // Toggle visibility of cancel button
        const cancelButton = document.querySelector('.cancel-edit-btn') as HTMLButtonElement;
        if (cancelButton) cancelButton.style.display = 'block';
        
        // Update form title if it exists
        const formTitle = this.createProjectForm?.querySelector('h2') as HTMLHeadingElement;
        if (formTitle) formTitle.textContent = 'Update Project';
        
        // Optional: Scroll to the form
        this.createProjectForm?.scrollIntoView({ behavior: 'smooth' });
        
        ApiClients.showNotification('Project loaded for editing', 'info');
    }

    private cancelEditing(): void {
        if (!this.createProjectForm || !this.formSubmitButton) return;
        
        // Reset form
        this.createProjectForm.reset();
        this.isEditMode = false;
        this.currentProjectId = null;
        
        // Reset form title if it exists
        const formTitle = this.createProjectForm?.querySelector('h2') as HTMLHeadingElement;
        if (formTitle) formTitle.textContent = 'Create Project';
        
        // Reset button text
        this.formSubmitButton.textContent = 'Create Project';
        
        // Hide cancel button
        const cancelButton = document.querySelector('.cancel-edit-btn') as HTMLButtonElement;
        if (cancelButton) cancelButton.style.display = 'none';
        
        // Reset select
        if (this.projectSelectForUpdate) this.projectSelectForUpdate.value = '';
    }

    private setupCreateProjectForm(): void {
        if (!this.createProjectForm) return;
        
        if (this.endDateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayFormatted = `${yyyy}-${mm}-${dd}`;
            
            this.endDateInput.min = todayFormatted;
            this.endDateInput.setAttribute('min', todayFormatted);
        }

        this.createProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.projectNameInput || !this.projectDescriptionInput || !this.endDateInput) {
                ApiClients.showNotification('Form inputs not found', 'error');
                return;
            }
            
            const name = this.projectNameInput.value.trim();
            const description = this.projectDescriptionInput.value.trim();
            const endDateInput = this.endDateInput.value; // Get the raw input value
            
            if (!name || !description || !endDateInput) {
                ApiClients.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            const selectedDate = new Date(endDateInput);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            
            if (selectedDate < today) {
                ApiClients.showNotification('Project end date cannot be in the past', 'error');
                return;
            }
            
            // Convert the date to ISO format with time
            const endDate = selectedDate.toISOString();
            
            const projectData = {
                name,
                description,
                endDate // Now properly formatted as ISO-8601
            };
            
            let result: Project | null = null;
            
            if (this.isEditMode && this.currentProjectId) {
                // Update existing project
                result = await ProjectsService.updateProject(this.currentProjectId, projectData);
                if (result) {
                    ApiClients.showNotification('Project updated successfully', 'success');
                    this.cancelEditing(); // Reset form and update mode
                }
            } else {
                // Create new project
                result = await ProjectsService.createProject(projectData);
                if (result) {
                    this.createProjectForm?.reset();
                }
            }
            
            if (result) {
                await this.loadProjects();
                // Also reload the update select
                this.populateUpdateProjectSelect();
            }
        });
    }

    private async loadProjects(): Promise<void> {
        try {
            const projects = await ProjectsService.getAllProjects();
            
            if (this.projectList) {
                this.projectList.innerHTML = '';
                
                if (projects.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No projects available';
                    this.projectList.appendChild(li);
                } else {
                    projects.forEach(project => {
                        const li = document.createElement('li');
                        const projectName = project.name || project.title || 'Unnamed Project';
                        
                        li.innerHTML = `
                            <div class="project-info">
                                <strong>${projectName}</strong>
                                <p>${project.description}</p>
                                <p>Status: <span class="status-badge ${project.status.toLowerCase()}">${project.status}</span></p>
                                <p>Due: ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
                            </div>
                        `;
                        
                        const statusButton = document.createElement('button');
                        statusButton.textContent = 'Change Status';
                        statusButton.className = 'status-btn';
                        statusButton.style.marginLeft = '10px';
                        statusButton.style.padding = '5px 10px';
                        statusButton.style.backgroundColor = '#3498db';
                        statusButton.style.color = 'white';
                        statusButton.style.border = 'none';
                        statusButton.style.borderRadius = '4px';
                        statusButton.style.cursor = 'pointer';
                        
                        statusButton.addEventListener('click', () => {
                            this.changeProjectStatus(project.id, project.status);
                        });
                        
                        li.appendChild(statusButton);
                        this.projectList?.appendChild(li);
                    });
                }
            }
            
            // Populate delete select dropdown
            if (this.deleteProjectSelect) {
                this.deleteProjectSelect.innerHTML = '<option value="">Select a project</option>';
                
                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name || project.title || 'Unnamed Project';
                    this.deleteProjectSelect?.appendChild(option);
                });
            }
            
            // Populate update select dropdown
            this.populateUpdateProjectSelect(projects);
            
            this.loadAssignedProjects(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            ApiClients.showNotification('Failed to load projects', 'error');
            
            if (this.projectList) {
                this.projectList.innerHTML = '<li>Error loading projects</li>';
            }
        }
    }

    private populateUpdateProjectSelect(projects?: Project[]): void {
        if (!this.projectSelectForUpdate) return;
        
        const currentValue = this.projectSelectForUpdate.value;
        
        this.projectSelectForUpdate.innerHTML = '<option value="">-- Select a project --</option>';
        
        const projectsToUse = projects || [];
        
        if (projectsToUse.length === 0 && !projects) {
            // If no projects were passed, load them
            ProjectsService.getAllProjects().then(fetchedProjects => {
                this.populateUpdateProjectSelect(fetchedProjects);
            });
            return;
        }
        
        projectsToUse.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name || project.title || 'Unnamed Project';
            this.projectSelectForUpdate?.appendChild(option);
        });
        
        // Restore selected value if possible
        if (currentValue) {
            this.projectSelectForUpdate.value = currentValue;
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
            this.userSelect.innerHTML = '<option value="">Loading users...</option>';
            
            const users = await UsersService.getAllUsers();
            const regularUsers = users.filter(user => user.role !== UserRole.ISADMIN);
            
            this.userSelect.innerHTML = '<option value="">Select a user</option>';
            
            if (regularUsers.length === 0) {
                const option = document.createElement('option');
                option.disabled = true;
                option.textContent = 'No users available';
                this.userSelect.appendChild(option);
            } else {
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

    private async changeProjectStatus(projectId: string, currentStatus: ProjectStatus): Promise<void> {
        const statuses = [ProjectStatus.ISPENDING, ProjectStatus.ISIN_PROGRESS, ProjectStatus.ISCOMPLETED];
        const currentIndex = statuses.indexOf(currentStatus);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        
        const formatStatus = (status: ProjectStatus): string => {
            return status.replace('IS', '').replace('_', ' ').toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase());
        };
        
        const currentStatusDisplay = formatStatus(currentStatus);
        const nextStatusDisplay = formatStatus(nextStatus as unknown as ProjectStatus);
        
        const confirmed = await ApiClients.showConfirmation(
            `Change project status from ${currentStatusDisplay} to ${nextStatusDisplay}?`,
            'Update Project Status',
            'Update Status',
            'Cancel',
            'info'
        );
        
        if (confirmed) {
            const updated = await ProjectsService.updateProjectStatus(projectId, nextStatus as unknown as ProjectStatus);
            if (updated) {
                this.loadProjects();
            }
        }
    }

    private setupMissingElements(): void {
      // Create missing UI elements if they don't exist
      
      // Create user select if missing
      if (!this.userSelect) {
        const assignContainer = document.querySelector('.assign-projects');
        if (assignContainer) {
          const selectContainer = document.createElement('div');
          selectContainer.className = 'form-group';
          
          const label = document.createElement('label');
          label.setAttribute('for', 'userSelect');
          label.textContent = 'Select User';
          
          this.userSelect = document.createElement('select');
          this.userSelect.id = 'userSelect';
          this.userSelect.className = 'form-control';
          
          selectContainer.appendChild(label);
          selectContainer.appendChild(this.userSelect);
          
          const form = assignContainer.querySelector('form') || document.createElement('form');
          form.appendChild(selectContainer);
          assignContainer.appendChild(form);
        }
      }
      
      // Create delete project select if missing
      if (!this.deleteProjectSelect) {
        const deleteContainer = document.querySelector('.delete-project');
        if (deleteContainer) {
          const selectContainer = document.createElement('div');
          selectContainer.className = 'form-group';
          
          const label = document.createElement('label');
          label.setAttribute('for', 'deleteprojectSelect');
          label.textContent = 'Select Project to Delete';
          
          this.deleteProjectSelect = document.createElement('select');
          this.deleteProjectSelect.id = 'deleteprojectSelect';
          this.deleteProjectSelect.className = 'form-control';
          
          selectContainer.appendChild(label);
          selectContainer.appendChild(this.deleteProjectSelect);
          
          deleteContainer.appendChild(selectContainer);
        }
      }
      
      // Create delete button if missing
      if (!this.deleteButton) {
        const deleteContainer = document.querySelector('.delete-project');
        if (deleteContainer && this.deleteProjectSelect) {
          this.deleteButton = document.createElement('button');
          this.deleteButton.className = 'delete-btn';
          this.deleteButton.textContent = 'Delete Project';
          this.deleteButton.style.backgroundColor = '#e74c3c';
          this.deleteButton.style.color = 'white';
          this.deleteButton.style.border = 'none';
          this.deleteButton.style.borderRadius = '4px';
          this.deleteButton.style.padding = '10px 15px';
          this.deleteButton.style.cursor = 'pointer';
          this.deleteButton.style.marginTop = '10px';
          
          deleteContainer.appendChild(this.deleteButton);
        }
      }
    }

    private async loadProjectsForAssignment(): Promise<void> {
      if (!this.projectSelectForAssignment) {
        this.projectSelectForAssignment = document.getElementById('projectSelect') as HTMLSelectElement;
      }
      
      if (!this.projectSelectForAssignment) {
        console.error('Project selection dropdown for assignment not found');
        return;
      }
      
      try {
        this.projectSelectForAssignment.innerHTML = '<option value="">Loading projects...</option>';
        
        // Get unassigned projects
        const allProjects = await ProjectsService.getAllProjects();
        const unassignedProjects = allProjects.filter(project => !project.userId);
        
        this.projectSelectForAssignment.innerHTML = '<option value="">Select a project</option>';
        
        if (unassignedProjects.length === 0) {
          const option = document.createElement('option');
          option.disabled = true;
          option.textContent = 'No unassigned projects available';
          this.projectSelectForAssignment.appendChild(option);
        } else {
          unassignedProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name || project.title || 'Unnamed Project';
            this.projectSelectForAssignment?.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Failed to load projects for assignment:', error);
        if (this.projectSelectForAssignment) {
          this.projectSelectForAssignment.innerHTML = '<option value="">Error loading projects</option>';
        }
        ApiClients.showNotification('Failed to load projects for assignment', 'error');
      }
    }

    private setupDeleteProjectButton(): void {
      if (!this.deleteButton || !this.deleteProjectSelect) return;
      
      this.deleteButton.addEventListener('click', async () => {
        const projectId = this.deleteProjectSelect?.value;
        if (!projectId) {
          ApiClients.showNotification('Please select a project to delete', 'error');
          return;
        }
        
        const confirmed = await ApiClients.showConfirmation(
          'Are you sure you want to delete this project? This action cannot be undone.',
          'Delete Project',
          'Delete',
          'Cancel',
          'delete'
        );
        
        if (confirmed) {
          const success = await ProjectsService.deleteProject(projectId);
          if (success) {
            await this.loadProjects();
            this.loadProjectsForAssignment();
            if (this.deleteProjectSelect)this.deleteProjectSelect.value = '';
          }
        }
      });
    }

    private setupAssignProjectForm(): void {
      if (!this.assignForm) {
        this.assignForm = document.querySelector('.assign-projects form') as HTMLFormElement;
      }
      
      if (!this.assignForm) return;
      
      this.assignForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = this.userSelect?.value;
        const projectId = this.projectSelectForAssignment?.value;
        
        if (!userId || !projectId) {
          ApiClients.showNotification('Please select both a user and a project', 'error');
          return;
        }
        
        const result = await ProjectsService.assignProject(projectId, userId);
        if (result) {
          await Promise.all([
            this.loadProjects(),
            this.loadProjectsForAssignment()
          ]);
          
          if (this.userSelect) this.userSelect.value = '';
          if (this.projectSelectForAssignment) this.projectSelectForAssignment.value = '';
        }
      });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProjectManagementPage();
});
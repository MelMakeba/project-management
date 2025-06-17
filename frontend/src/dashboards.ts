// Dashboard functionality for both user and admin views

enum ProjectStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
  }
  
  enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
  }
  
  interface Project {
    id: string;
    title?: string;
    name?: string;
    description: string;
    status: ProjectStatus;
    dueDate?: string;
    endDate?: string; 
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
  }
  
  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
  }
  
  interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }
  
  class ApiClient {
    private static baseUrl: string = 'http://localhost:3000';
    private static token: string | null = localStorage.getItem('authToken');
  
    static getUserInfo(): { id: string; role: string; email: string; name?: string } | null {
      const token = this.token;
      if (!token) return null;
  
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.sub,
          role: payload.role,
          email: payload.email,
          name: payload.name
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
  
        const data: ApiResponse<T> = await response.json();
  
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
  
    static logout(): void {
      localStorage.removeItem('authToken');
      window.location.href = '../Login-Register/Login/login.html';
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
  
  class ProjectService {
    static async getAllProjects(): Promise<Project[]> {
      try {
        const response = await ApiClient.request<Project[]>('/projects');
        return response.data || [];
      } catch (error) {
        ApiClient.showNotification('Failed to load projects', 'error');
        return [];
      }
    }
  
    static async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
      try {
        const response = await ApiClient.request<Project[]>(`/projects/status/${status.toLowerCase()}`);
        return response.data || [];
      } catch (error) {
        ApiClient.showNotification(`Failed to load ${status.toLowerCase()} projects`, 'error');
        return [];
      }
    }
  
    static async getUserProjects(userId: string): Promise<Project[]> {
      try {
        const response = await ApiClient.request<Project[]>(`/projects/user/${userId}`);
        return response.data || [];
      } catch (error) {
        ApiClient.showNotification('Failed to load your projects', 'error');
        return [];
      }
    }
  
    static async markProjectComplete(projectId: string): Promise<Project | null> {
      try {
        const response = await ApiClient.request<Project>(`/projects/user/${projectId}/complete`, 'PATCH');
        ApiClient.showNotification('Project marked as complete successfully', 'success');
        return response.data || null;
      } catch (error) {
        ApiClient.showNotification('Failed to mark project as complete', 'error');
        return null;
      }
    }
  }
  
  class UserService {
    static async getAllUsers(): Promise<User[]> {
      try {
        const response = await ApiClient.request<User[]>('/users');
        return response.data || [];
      } catch (error) {
        ApiClient.showNotification('Failed to load users', 'error');
        return [];
      }
    }
  }
  
  class AdminDashboard {
    private projectsCard: HTMLElement | null = null;
    private completedProjectsCard: HTMLElement | null = null;
    private pendingProjectsCard: HTMLElement | null = null;
    private unassignedProjectsCard: HTMLElement | null = null;
    private allUsersCard: HTMLElement | null = null;
    private usersWithPendingCard: HTMLElement | null = null;
    private usersWithoutProjectsCard: HTMLElement | null = null;
    
    constructor() {
      const userInfo = ApiClient.getUserInfo();
      if (!userInfo || userInfo.role !== 'ADMIN') {
        ApiClient.showNotification('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
          window.location.href = '../Login-Register/Login/login.html';
        }, 2000);
        return;
      }
      
      this.init();
    }
    
    private async init(): Promise<void> {
      this.setupCardReferences();
      
      this.setupLogout();
      
      await this.loadDashboardData();
      
      this.setupViewButtons();
    }
    
    private setupCardReferences(): void {
      const cards = document.querySelectorAll('.card');
      
      if (cards.length >= 7) {
        this.projectsCard = cards[0] as HTMLElement;
        this.completedProjectsCard = cards[1] as HTMLElement;
        this.pendingProjectsCard = cards[2] as HTMLElement;
        this.unassignedProjectsCard = cards[3] as HTMLElement;
        this.allUsersCard = cards[4] as HTMLElement;
        this.usersWithPendingCard = cards[5] as HTMLElement;
        this.usersWithoutProjectsCard = cards[6] as HTMLElement;
      }
    }
    
    private setupLogout(): void {
      const logoutLink = document.querySelector('a[href="#"]:has(ion-icon[name="log-in-outline"])');
      if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
          e.preventDefault();
          ApiClient.logout();
        });
      }
    }
    
    private async loadDashboardData(): Promise<void> {
      this.showLoadingState();
      
      try {
        const [allProjects, users] = await Promise.all([
          ProjectService.getAllProjects(),
          UserService.getAllUsers()
        ]);
        
        const completedProjects = allProjects.filter(p => p.status === ProjectStatus.COMPLETED);
        const pendingProjects = allProjects.filter(p => p.status === ProjectStatus.PENDING);
        const unassignedProjects = allProjects.filter(p => !p.userId);
        
        
        const userIdsWithPendingProjects = new Set(
          pendingProjects.filter(p => p.userId).map(p => p.userId)
        );
        const usersWithPending = users.filter(u => u.id && userIdsWithPendingProjects.has(u.id));
        
        const assignedUserIds = new Set(
          allProjects.filter(p => p.userId).map(p => p.userId)
        );
        const usersWithoutProjects = users.filter(u => u.role === UserRole.USER && !assignedUserIds.has(u.id));
        
        this.updateCardValue(this.projectsCard, allProjects.length);
        this.updateCardValue(this.completedProjectsCard, completedProjects.length);
        this.updateCardValue(this.pendingProjectsCard, pendingProjects.length);
        this.updateCardValue(this.unassignedProjectsCard, unassignedProjects.length);
        this.updateCardValue(this.allUsersCard, users.length);
        this.updateCardValue(this.usersWithPendingCard, usersWithPending.length);
        this.updateCardValue(this.usersWithoutProjectsCard, usersWithoutProjects.length);
        
        this.storeProjectData(allProjects, completedProjects, pendingProjects, unassignedProjects);
        this.storeUserData(users, usersWithPending, usersWithoutProjects);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        ApiClient.showNotification('Failed to load dashboard data', 'error');
      }
    }
    
    private showLoadingState(): void {
      const cards = [
        this.projectsCard,
        this.completedProjectsCard,
        this.pendingProjectsCard,
        this.unassignedProjectsCard,
        this.allUsersCard,
        this.usersWithPendingCard,
        this.usersWithoutProjectsCard
      ];
      
      cards.forEach(card => {
        if (card) {
          const statsElement = card.querySelector('.project-stats h3');
          if (statsElement) {
            statsElement.textContent = '...';
          }
        }
      });
    }
    
    private updateCardValue(card: HTMLElement | null, value: number): void {
      if (!card) return;
      
      const statsElement = card.querySelector('.project-stats h3');
      if (statsElement) {
        statsElement.textContent = value.toString();
      }
    }
    
    private storeProjectData(
      allProjects: Project[],
      completedProjects: Project[],
      pendingProjects: Project[],
      unassignedProjects: Project[]
    ): void {
      if (this.projectsCard) {
        this.projectsCard.dataset.projects = JSON.stringify(allProjects);
      }
      if (this.completedProjectsCard) {
        this.completedProjectsCard.dataset.projects = JSON.stringify(completedProjects);
      }
      if (this.pendingProjectsCard) {
        this.pendingProjectsCard.dataset.projects = JSON.stringify(pendingProjects);
      }
      if (this.unassignedProjectsCard) {
        this.unassignedProjectsCard.dataset.projects = JSON.stringify(unassignedProjects);
      }
    }
    
    private storeUserData(
      allUsers: User[],
      usersWithPending: User[],
      usersWithoutProjects: User[]
    ): void {
      if (this.allUsersCard) {
        this.allUsersCard.dataset.users = JSON.stringify(allUsers);
      }
      if (this.usersWithPendingCard) {
        this.usersWithPendingCard.dataset.users = JSON.stringify(usersWithPending);
      }
      if (this.usersWithoutProjectsCard) {
        this.usersWithoutProjectsCard.dataset.users = JSON.stringify(usersWithoutProjects);
      }
    }
    
    private setupViewButtons(): void {
      const viewButtons = document.querySelectorAll('#view-btn');
      viewButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          this.handleViewButtonClick(index);
        });
      });
    }
    
    private handleViewButtonClick(index: number): void {
      switch (index) {
        case 0: 
          this.showProjectsModal('All Projects', this.projectsCard?.dataset.projects);
          break;
        case 1: 
          this.showProjectsModal('Completed Projects', this.completedProjectsCard?.dataset.projects);
          break;
        case 2:
          this.showProjectsModal('Pending Projects', this.pendingProjectsCard?.dataset.projects);
          break;
        case 3: 
          this.showProjectsModal('Unassigned Projects', this.unassignedProjectsCard?.dataset.projects);
          break;
        case 4: 
          this.showUsersModal('All Users', this.allUsersCard?.dataset.users);
          break;
        case 5: 
          this.showUsersModal('Users with Pending Projects', this.usersWithPendingCard?.dataset.users);
          break;
        case 6: 
          this.showUsersModal('Users without Projects', this.usersWithoutProjectsCard?.dataset.users);
          break;
      }
    }
    
    private showProjectsModal(title: string, projectsJson?: string): void {
      if (!projectsJson) {
        ApiClient.showNotification('No project data available', 'error');
        return;
      }
      
      const projects: Project[] = JSON.parse(projectsJson);
      
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
      modal.style.zIndex = '1000';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.style.backgroundColor = '#23242b';
      modalContent.style.color = '#fff';
      modalContent.style.borderRadius = '8px';
      modalContent.style.padding = '20px';
      modalContent.style.width = '80%';
      modalContent.style.maxWidth = '800px';
      modalContent.style.maxHeight = '80vh';
      modalContent.style.overflow = 'auto';
      
      const modalTitle = document.createElement('h2');
      modalTitle.textContent = title;
      modalTitle.style.color = '#127b8e';
      modalTitle.style.marginBottom = '20px';
      modalTitle.style.textAlign = 'center';
      
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.position = 'absolute';
      closeButton.style.right = '20px';
      closeButton.style.top = '20px';
      closeButton.style.padding = '5px 10px';
      closeButton.style.backgroundColor = '#127b8e';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '4px';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => document.body.removeChild(modal);
      
      const projectList = document.createElement('div');
      projectList.style.marginTop = '20px';
      
      if (projects.length === 0) {
        const noProjects = document.createElement('p');
        noProjects.textContent = 'No projects found';
        noProjects.style.textAlign = 'center';
        noProjects.style.color = '#ccc';
        projectList.appendChild(noProjects);
      } else {
        projects.forEach(project => {
          const projectItem = document.createElement('div');
          projectItem.style.backgroundColor = '#333';
          projectItem.style.padding = '15px';
          projectItem.style.borderRadius = '4px';
          projectItem.style.marginBottom = '10px';
          
          const projectTitle = document.createElement('h3');
          projectTitle.textContent = project.name || project.title || 'Unnamed Project';
          projectTitle.style.color = '#127b8e';
          projectTitle.style.marginBottom = '10px';
          
          const projectDesc = document.createElement('p');
          projectDesc.textContent = project.description;
          projectDesc.style.marginBottom = '8px';
          projectDesc.style.color = '#ccc';
          
          const projectStatus = document.createElement('p');
          projectStatus.innerHTML = `<strong>Status:</strong> ${project.status}`;
          projectStatus.style.marginBottom = '5px';
          
          const projectDate = document.createElement('p');
          projectDate.innerHTML = `<strong>Due Date:</strong> ${project.endDate || project.dueDate ? new Date(project.endDate || project.dueDate || '').toLocaleDateString() : 'Not set'}`;
          
          projectItem.appendChild(projectTitle);
          projectItem.appendChild(projectDesc);
          projectItem.appendChild(projectStatus);
          projectItem.appendChild(projectDate);
          
          projectList.appendChild(projectItem);
        });
      }
      
      modalContent.appendChild(closeButton);
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(projectList);
      modal.appendChild(modalContent);
      
      document.body.appendChild(modal);
    }
    
    private showUsersModal(title: string, usersJson?: string): void {
      if (!usersJson) {
        ApiClient.showNotification('No user data available', 'error');
        return;
      }
      
      const users: User[] = JSON.parse(usersJson);
      
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
      modal.style.zIndex = '1000';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.style.backgroundColor = '#23242b';
      modalContent.style.color = '#fff';
      modalContent.style.borderRadius = '8px';
      modalContent.style.padding = '20px';
      modalContent.style.width = '80%';
      modalContent.style.maxWidth = '800px';
      modalContent.style.maxHeight = '80vh';
      modalContent.style.overflow = 'auto';
      
      const modalTitle = document.createElement('h2');
      modalTitle.textContent = title;
      modalTitle.style.color = '#127b8e';
      modalTitle.style.marginBottom = '20px';
      modalTitle.style.textAlign = 'center';
      
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.position = 'absolute';
      closeButton.style.right = '20px';
      closeButton.style.top = '20px';
      closeButton.style.padding = '5px 10px';
      closeButton.style.backgroundColor = '#127b8e';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '4px';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => document.body.removeChild(modal);
      
      const userList = document.createElement('div');
      userList.style.marginTop = '20px';
      
      if (users.length === 0) {
        const noUsers = document.createElement('p');
        noUsers.textContent = 'No users found';
        noUsers.style.textAlign = 'center';
        noUsers.style.color = '#ccc';
        userList.appendChild(noUsers);
      } else {
        users.forEach(user => {
          const userItem = document.createElement('div');
          userItem.style.backgroundColor = '#333';
          userItem.style.padding = '15px';
          userItem.style.borderRadius = '4px';
          userItem.style.marginBottom = '10px';
          
          const userName = document.createElement('h3');
          userName.textContent = user.name;
          userName.style.color = '#127b8e';
          userName.style.marginBottom = '10px';
          
          const userEmail = document.createElement('p');
          userEmail.textContent = user.email;
          userEmail.style.marginBottom = '8px';
          userEmail.style.color = '#ccc';
          
          const userRole = document.createElement('p');
          userRole.innerHTML = `<strong>Role:</strong> ${user.role}`;
          
          userItem.appendChild(userName);
          userItem.appendChild(userEmail);
          userItem.appendChild(userRole);
          
          userList.appendChild(userItem);
        });
      }
      
      modalContent.appendChild(closeButton);
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(userList);
      modal.appendChild(modalContent);
      
      document.body.appendChild(modal);
    }
  }
  
  class UserDashboard {
    private userProjectsContainer: HTMLElement | null = null;
    
    constructor() {
      const userInfo = ApiClient.getUserInfo();
      if (!userInfo || userInfo.role !== 'USER') {
        ApiClient.showNotification('Access denied or session expired.', 'error');
        setTimeout(() => {
          window.location.href = '../Login-Register/Login/login.html';
        }, 2000);
        return;
      }
      
      this.init();
    }
    
    private async init(): Promise<void> {
      this.userProjectsContainer = document.getElementById('userProjects');
      
      this.setupLogout();
      
      await this.loadUserProjects();
    }
    
    private setupLogout(): void {
      const logoutLink = document.querySelector('a[href="#"]:has(ion-icon[name="log-in-outline"])');
      if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
          e.preventDefault();
          ApiClient.logout();
        });
      }
    }
    
    private async loadUserProjects(): Promise<void> {
      if (!this.userProjectsContainer) {
        console.error('User projects container not found');
        return;
      }
      
      this.userProjectsContainer.innerHTML = '<p style="text-align:center;color:#ccc;">Loading your projects...</p>';
      
      const userInfo = ApiClient.getUserInfo();
      if (!userInfo) return;
      
      try {
        const projects = await ProjectService.getUserProjects(userInfo.id);
        
        if (projects.length === 0) {
          this.userProjectsContainer.innerHTML = `
            <div style="text-align:center;padding:20px;">
              <h3 style="color:#127b8e;margin-bottom:10px;">No Projects Assigned</h3>
              <p style="color:#ccc;">You don't have any projects assigned to you yet.</p>
            </div>
          `;
          return;
        }
        
        this.userProjectsContainer.innerHTML = '';
        
        projects.forEach(project => {
          const projectCard = document.createElement('div');
          projectCard.className = `project-card ${project.status.toLowerCase() === 'completed' ? 'complete' : 'incomplete'}`;
          projectCard.dataset.projectId = project.id;
          
          const projectHeader = document.createElement('div');
          projectHeader.className = 'project-header';
          
          const projectTitle = document.createElement('h4');
          projectTitle.className = 'project-title';
          projectTitle.textContent = project.name || project.title || 'Unnamed Project';
          
          const statusBadge = document.createElement('span');
          statusBadge.className = `status-badge ${project.status.toLowerCase()}`;
          statusBadge.textContent = this.formatStatus(project.status);
          statusBadge.id = `status-${project.id}`;
          
          projectHeader.appendChild(projectTitle);
          projectHeader.appendChild(statusBadge);
          
          const projectDesc = document.createElement('p');
          projectDesc.className = 'project-desc';
          projectDesc.textContent = project.description;
          
          const projectDate = document.createElement('p');
          projectDate.className = 'project-date';
          projectDate.innerHTML = `<strong>Due Date:</strong> ${project.endDate || project.dueDate ? 
            new Date(project.endDate || project.dueDate || '').toLocaleDateString() : 'Not set'}`;
          
          const statusBtn = document.createElement('button');
          statusBtn.className = 'status-btn';
          
          if (project.status === ProjectStatus.COMPLETED) {
            statusBtn.textContent = 'Completed';
            statusBtn.disabled = true;
            statusBtn.classList.add('completed-btn');
            
            const completedBadge = document.createElement('div');
            completedBadge.className = 'completed-badge';
            completedBadge.innerHTML = '✓';
            projectCard.appendChild(completedBadge);
          } else {
            statusBtn.textContent = 'Mark as Complete';
            statusBtn.addEventListener('click', () => this.markProjectComplete(project.id, statusBtn));
          }
          
          projectCard.appendChild(projectHeader);
          projectCard.appendChild(projectDesc);
          projectCard.appendChild(projectDate);
          projectCard.appendChild(statusBtn);
          
          this.userProjectsContainer?.appendChild(projectCard);
        });
        
      } catch (error) {
        console.error('Failed to load user projects:', error);
        this.userProjectsContainer.innerHTML = `
          <div style="text-align:center;padding:20px;">
            <h3 style="color:#e74c3c;margin-bottom:10px;">Error</h3>
            <p style="color:#ccc;">Failed to load your projects. Please try again later.</p>
          </div>
        `;
      }
    }
    private formatStatus(status: ProjectStatus): string {
      switch (status) {
        case ProjectStatus.PENDING:
          return 'Pending';
        case ProjectStatus.IN_PROGRESS:
          return 'In Progress';
        case ProjectStatus.COMPLETED:
          return 'Completed';
        default:
          return status;
      }
    }
    
    private async markProjectComplete(projectId: string, button: HTMLButtonElement): Promise<void> {
      const originalText = button.textContent;
      
      // Create custom confirmation dialog instead of using basic browser confirm()
      const confirmed = await this.showConfirmationDialog(
        'Complete Project', 
        'Are you sure you want to mark this project as complete?',
        'This action cannot be undone.'
      );
      
      if (confirmed) {
        try {
          button.textContent = 'Updating...';
          button.disabled = true;
          
          const result = await ProjectService.markProjectComplete(projectId);
          
          if (result) {
            const card = button.closest('.project-card') as HTMLElement;
            this.updateCardToCompletedState(card, result);
          }
        } catch (error) {
          console.error('Error completing project:', error);
          button.textContent = originalText;
          button.disabled = false;
        }
      }
    }
    
    private updateCardToCompletedState(card: HTMLElement, project: Project): void {
      card.classList.remove('incomplete');
      card.classList.add('complete', 'completion-animation');
      
      const statusBtn = card.querySelector('.status-btn') as HTMLButtonElement;
      if (statusBtn) {
        statusBtn.textContent = 'Completed';
        statusBtn.disabled = true;
        statusBtn.classList.add('completed-btn');
      }
      
      const completedBadge = document.createElement('div');
      completedBadge.className = 'completed-badge';
      completedBadge.innerHTML = '✓';
      
      const completedTimestamp = document.createElement('p');
      completedTimestamp.className = 'completion-timestamp';
      completedTimestamp.textContent = `Completed on: ${new Date().toLocaleDateString()}`;
      
      card.appendChild(completedBadge);
      card.appendChild(completedTimestamp);
    }
    
    private showConfirmationDialog(title: string, message: string, subtext?: string): Promise<boolean> {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        overlay.style.zIndex = '1000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.style.backgroundColor = '#23242b';
        modal.style.color = '#fff';
        modal.style.borderRadius = '8px';
        modal.style.padding = '20px';
        modal.style.width = '80%';
        modal.style.maxWidth = '400px';
        modal.style.textAlign = 'center';
        
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.style.color = '#127b8e';
        titleEl.style.marginBottom = '15px';
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.marginBottom = subtext ? '10px' : '20px';
        
        modal.appendChild(titleEl);
        modal.appendChild(messageEl);
        
        if (subtext) {
          const subtextEl = document.createElement('p');
          subtextEl.textContent = subtext;
          subtextEl.style.fontSize = '0.9rem';
          subtextEl.style.color = '#999';
          subtextEl.style.marginBottom = '20px';
          modal.appendChild(subtextEl);
        }
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '15px';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '8px 15px';
        cancelBtn.style.border = '1px solid #666';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.backgroundColor = 'transparent';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.cursor = 'pointer';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Complete';
        confirmBtn.style.padding = '8px 15px';
        confirmBtn.style.border = 'none';
        confirmBtn.style.borderRadius = '4px';
        confirmBtn.style.backgroundColor = '#4CAF50';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.cursor = 'pointer';
        
        cancelBtn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(false);
        };
        
        confirmBtn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(true);
        };
        
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(confirmBtn);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '../Login-Register/Login/login.html';
      return;
    }
    
    const path = window.location.pathname;
    
    if (path.includes('admin-dasboard')) {
      new AdminDashboard();
    } else if (path.includes('user-dashboard')) {
      new UserDashboard();
    }
  });
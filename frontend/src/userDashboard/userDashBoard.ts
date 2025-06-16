interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    token: string;
  }
  
  interface Project {
    id: string;
    name: string;
    description: string;
    endDate: string;
    assignedTo?: string;
    isCompleted?: boolean;
  }
  
  // Utility to fetch user from localStorage
  function getLoggedInUser(): User | null {
    const stored = localStorage.getItem('loggedInUser');
    return stored ? JSON.parse(stored) : null;
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    const user = getLoggedInUser();
    const userNameEl = document.getElementById('userName') as HTMLElement;
    const projectSection = document.getElementById('projectSection') as HTMLElement;
    const markCompletedBtn = document.getElementById('markCompleted') as HTMLButtonElement;
  
    if (!user) {
      alert('User not logged in!');
      window.location.href = '../login/login.html';
      return;
    }
  
    userNameEl.textContent = user.name;
  
    try {
      const res = await fetch(`http://localhost:3000/users/${user.id}/project`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
  
      if (!res.ok) throw new Error('No project assigned');
  
      const project: Project = await res.json();
  
      projectSection.innerHTML = `
        <h2>${project.name}</h2>
        <p><strong>Description:</strong> ${project.description}</p>
        <p><strong>End Date:</strong> ${new Date(project.endDate).toLocaleDateString()}</p>
      `;
  
      if (!project.isCompleted) {
        markCompletedBtn.classList.remove('hidden');
        markCompletedBtn.onclick = async () => {
          try {
            const completeRes = await fetch(`http://localhost:3000/${user.id}/completed`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              }
            });
  
            const completeData = await completeRes.json();
  
            if (completeRes.ok) {
              alert('Project marked as completed. Admin has been notified.');
              markCompletedBtn.classList.add('hidden');
            } else {
              alert(completeData.message || 'Error marking as completed.');
            }
          } catch (err) {
            alert('Error completing project. Try again later.');
          }
        };
      }
    } catch (err) {
      projectSection.innerHTML = `<p>No project assigned yet. Please wait for your admin.</p>`;
    }
  });
  
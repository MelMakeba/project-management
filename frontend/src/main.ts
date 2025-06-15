// scroll bar admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  const projectLink = document.getElementById('projects-link');
  const projectSection = document.getElementById('projects');

  if (projectLink && projectSection) {
    projectLink.addEventListener('click', (event) => {
      event.preventDefault();
      projectSection.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

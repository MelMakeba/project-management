// scroll bar admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  const projectLink = document.getElementById('projects-link') as HTMLAnchorElement;
  const projectSection = document.getElementById('projects') as HTMLElement;

  if (projectLink && projectSection) {
    projectLink.addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      projectSection.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

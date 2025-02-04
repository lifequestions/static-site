// Add any interactive features here
document.addEventListener('DOMContentLoaded', () => {
    // Example: Highlight current page in navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.style.fontWeight = 'bold';
        }
    });
}); 
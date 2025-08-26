// Fayonics Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    initializeNavigation();
    initializeContactForm();
    initializeAdminLogin();
    checkAdminAuth();
    updateDashboardStats();
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.navbar-link');
    const sections = document.querySelectorAll('.section');
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
    
    // Handle mobile navigation toggle
    const navToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Handle scroll to update active nav item
    window.addEventListener('scroll', debounce(updateActiveNavItem, 100));
    
    // Show home section by default
    navigateTo('home');
}

// Navigate to specific section
function navigateTo(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.navbar-link');

    // Hide all sections
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update active nav item
    navLinks.forEach(link => {
        // Remove active from all
        link.classList.remove('active');
        // Add active to the clicked/current link
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update active navigation item based on scroll position
function updateActiveNavItem() {
    const sections = document.querySelectorAll('.section:not(.hidden)');
    const navLinks = document.querySelectorAll('.navbar-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100 && sectionTop >= -section.offsetHeight + 100) {
            currentSection = section.id;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmission();
        });
    }
}

/* Responsive Contact Form */
.contact-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
@media (max-width: 600px) {
  .contact-form {
    padding: 1rem;
    max-width: 100%;
  }
  .contact-form .form-group {
    flex-direction: column;
    align-items: stretch;
  }
  .contact-form input,
  .contact-form textarea,
  .contact-form button {
    width: 100%;
    font-size: 1rem;
  }
}

/* WhatsApp button style (optional) */
.btn-whatsapp {
  background: #25D366;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-whatsapp:hover {
  background: #1ebe5b;
}

// Handle contact form submission
function handleContactFormSubmission() {
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();
    
    if (!name || !email || !message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Create lead object
    const lead = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        name: name,
        email: email,
        company: formData.get('company') || 'Not specified',
        project: formData.get('project') || 'Not specified',
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    saveLeadToStorage(lead);
    
    // WhatsApp integration
    const whatsappNumber = '918940569561'; // Country code + number, no plus sign
    const whatsappMessage = encodeURIComponent(
      `Name: ${name}
Email: ${email}
Company: ${lead.company}
Project Type: ${lead.project}

Message:
${message}

--
This inquiry was submitted through the Fayonics website contact form.`
    );
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    // Open WhatsApp chat
    window.open(whatsappLink, '_blank');
    
    // Show success message
    showNotification('Thank you for your inquiry! WhatsApp will open to send your message.', 'success');
    
    // Reset form
    form.reset();
    
    // Update dashboard stats if admin is logged in
    updateDashboardStats();
}

// Save lead to localStorage
function saveLeadToStorage(lead) {
    try {
        const existingLeads = JSON.parse(localStorage.getItem('fayonicsLeads') || '[]');
        existingLeads.push(lead);
        localStorage.setItem('fayonicsLeads', JSON.stringify(existingLeads));
    } catch (error) {
        console.error('Error saving lead to storage:', error);
    }
}

// Get leads from localStorage
function getLeadsFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('fayonicsLeads') || '[]');
    } catch (error) {
        console.error('Error retrieving leads from storage:', error);
        return [];
    }
}

// Admin login functionality
function initializeAdminLogin() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAdminLogin();
        });
    }
}

// Handle admin login
function handleAdminLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('adminError');
    const password = passwordInput.value.trim();
    
    // Clear previous errors
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
    
    // Check password (demo password: admin123)
    if (password === 'admin123') {
        // Store session token
        sessionStorage.setItem('fayonicsAdminToken', 'authenticated_' + Date.now());
        
        // Clear password
        passwordInput.value = '';
        
        // Show dashboard
        navigateTo('admin-dashboard');
        updateDashboardStats();
        loadLeadsTable();
        
        showNotification('Login successful! Welcome to the admin dashboard.', 'success');
    } else {
        // Show error
        errorDiv.textContent = 'Invalid password. Please try again.';
        errorDiv.classList.remove('hidden');
        passwordInput.focus();
    }
}

// Check admin authentication
function checkAdminAuth() {
    const token = sessionStorage.getItem('fayonicsAdminToken');
    const adminSection = document.getElementById('admin');
    const dashboardSection = document.getElementById('admin-dashboard');
    
    if (token && token.startsWith('authenticated_')) {
        // User is authenticated, show admin link
        const adminLinks = document.querySelectorAll('.admin-link');
        adminLinks.forEach(link => link.style.display = 'block');
    }
}

// Admin logout
function adminLogout() {
    sessionStorage.removeItem('fayonicsAdminToken');
    navigateTo('home');
    showNotification('Logged out successfully.', 'info');
}

// Update dashboard statistics
function updateDashboardStats() {
    const leads = getLeadsFromStorage();
    const totalLeadsElement = document.getElementById('totalLeads');
    const monthlyLeadsElement = document.getElementById('monthlyLeads');
    
    if (totalLeadsElement) {
        totalLeadsElement.textContent = leads.length;
    }
    
    if (monthlyLeadsElement) {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const monthlyLeads = leads.filter(lead => 
            lead.date && lead.date.startsWith(currentMonth)
        );
        monthlyLeadsElement.textContent = monthlyLeads.length;
    }
}

// Load leads table
function loadLeadsTable() {
    const leads = getLeadsFromStorage();
    const tableBody = document.getElementById('leadsTableBody');
    const noLeadsMessage = document.getElementById('noLeadsMessage');
    
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (leads.length === 0) {
        if (noLeadsMessage) {
            noLeadsMessage.classList.remove('hidden');
        }
        return;
    }
    
    if (noLeadsMessage) {
        noLeadsMessage.classList.add('hidden');
    }
    
    // Sort leads by date (newest first)
    leads.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    
    // Populate table
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td title="${lead.date}">${lead.date}</td>
            <td title="${lead.name}">${lead.name}</td>
            <td title="${lead.email}">${lead.email}</td>
            <td title="${lead.company}">${lead.company}</td>
            <td title="${lead.project}">${lead.project}</td>
            <td title="${lead.message}">${truncateText(lead.message, 50)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Export leads to CSV
function exportLeadsCSV() {
    const leads = getLeadsFromStorage();
    
    if (leads.length === 0) {
        showNotification('No leads to export.', 'info');
        return;
    }
    
    // CSV headers
    const headers = ['Date', 'Name', 'Email', 'Company', 'Project Type', 'Message'];
    
    // Convert leads to CSV format
    const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
            lead.date,
            `"${lead.name.replace(/"/g, '""')}"`,
            lead.email,
            `"${lead.company.replace(/"/g, '""')}"`,
            `"${lead.project.replace(/"/g, '""')}"`,
            `"${lead.message.replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `fayonics-leads-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`Exported ${leads.length} leads to CSV file.`, 'success');
    } else {
        showNotification('CSV export is not supported in this browser.', 'error');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-surface);
        color: var(--color-text);
        padding: var(--space-16);
        border-radius: var(--radius-base);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        max-width: 400px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Apply type-specific styling
    if (type === 'success') {
        notification.style.borderColor = 'var(--color-success)';
        notification.style.backgroundColor = 'rgba(var(--color-success-rgb), 0.1)';
    } else if (type === 'error') {
        notification.style.borderColor = 'var(--color-error)';
        notification.style.backgroundColor = 'rgba(var(--color-error-rgb), 0.1)';
    } else if (type === 'info') {
        notification.style.borderColor = 'var(--color-info)';
        notification.style.backgroundColor = 'rgba(var(--color-info-rgb), 0.1)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Add CSS animations if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle mobile navigation
function toggleMobileNav() {
    const navMenu = document.querySelector('.navbar-menu');
    if (navMenu) {
        navMenu.classList.toggle('mobile-active');
    }
}

// Smooth scrolling for anchor links
function smoothScroll(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize tooltips for truncated table cells
function initializeTooltips() {
    const tableCells = document.querySelectorAll('.leads-table td');
    tableCells.forEach(cell => {
        if (cell.scrollWidth > cell.clientWidth) {
            cell.title = cell.textContent;
        }
    });
}

// Handle window resize for responsive design
window.addEventListener('resize', debounce(function() {
    // Update mobile navigation visibility
    const navMenu = document.querySelector('.navbar-menu');
    if (window.innerWidth > 768 && navMenu) {
        navMenu.classList.remove('mobile-active');
    }
    
    // Re-initialize tooltips
    initializeTooltips();
}, 250));

// Handle keyboard navigation
document.addEventListener('keydown', function(e) {
    // Escape key to close mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.navbar-menu');
        if (navMenu && navMenu.classList.contains('mobile-active')) {
            navMenu.classList.remove('mobile-active');
        }
    }
    
    // Enter key to submit forms
    if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.target.click();
    }
});

// Auto-refresh dashboard stats every 30 seconds when admin is logged in
setInterval(function() {
    const token = sessionStorage.getItem('fayonicsAdminToken');
    const dashboardSection = document.getElementById('admin-dashboard');
    
    if (token && dashboardSection && !dashboardSection.classList.contains('hidden')) {
        updateDashboardStats();
        loadLeadsTable();
    }
}, 30000);

// Expose global functions for HTML onclick handlers
window.navigateTo = navigateTo;
window.adminLogout = adminLogout;
window.exportLeadsCSV = exportLeadsCSV;
window.toggleMobileNav = toggleMobileNav;

// In your contact section
<button
  type="button"
  class="btn btn-whatsapp"
  onclick="window.open('https://wa.me/918940569561','_blank')"
>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width:20px;vertical-align:middle;">
  Chat on WhatsApp
</button>
// Dark Mode Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        // Check if theme toggle button exists
        if (!this.themeToggle) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Check for saved theme preference or default to 'auto'
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (systemPrefersDark) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        // Listen for theme toggle clicks
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            this.updateToggleIcon(theme);
            this.updateNavbarBackground();
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error('Error setting theme:', error);
        }
    }

    toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    updateToggleIcon(theme) {
        try {
            if (!this.themeToggle) return;
            const icon = this.themeToggle.querySelector('i');
            if (!icon) return;
            
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        } catch (error) {
            console.error('Error updating toggle icon:', error);
        }
    }    updateNavbarBackground() {
        try {
            // Update navbar background based on current theme and scroll position
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;
            
            const theme = document.documentElement.getAttribute('data-theme');
            
            if (window.scrollY > 100) {
                if (theme === 'dark') {
                    navbar.style.background = 'rgba(26, 26, 26, 0.98)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                }
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = '';
                navbar.style.boxShadow = '';
            }
        } catch (error) {
            console.error('Error updating navbar background:', error);
        }
    }
}

// Prevent multiple initialization
let themeManagerInitialized = false;

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!themeManagerInitialized) {
        try {
            window.themeManager = new ThemeManager();
            themeManagerInitialized = true;
        } catch (error) {
            console.error('Error initializing theme manager:', error);
        }
    }
});

// Initialize AOS (Animate On Scroll) with error handling
try {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1200,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            delay: 100
        });
    } else {
        console.warn('AOS library not loaded');
    }
} catch (error) {
    console.error('Error initializing AOS:', error);
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', mobileMenu);
}

function mobileMenu() {
    try {
        if (hamburger && navMenu) {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        }
    } catch (error) {
        console.error('Error in mobile menu:', error);
    }
}

// Close mobile menu when clicking on a link
const navLink = document.querySelectorAll('.nav-link');

navLink.forEach(n => n.addEventListener('click', closeMenu));

function closeMenu() {
    try {
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    } catch (error) {
        console.error('Error closing menu:', error);
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    try {
        if (window.themeManager) {
            window.themeManager.updateNavbarBackground();
        }
    } catch (error) {
        console.error('Error in scroll handler:', error);
    }
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 150;
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    try {
        const typingElement = document.querySelector('.typing-text');
        if (typingElement) {
            const text = typingElement.textContent;
            typeWriter(typingElement, text, 80);
        }
    } catch (error) {
        console.error('Error initializing typing animation:', error);
    }
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.floor(current);

        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.getAttribute('data-count'));
            animateCounter(counter, target);
            counterObserver.unobserve(counter);
        }
    });
}, observerOptions);

// Observe all counter elements
document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
    counterObserver.observe(counter);
});

// Optimized floating elements animation - Better performance
function createFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        // Add will-change for better performance
        element.style.willChange = 'transform';
        element.style.transform = 'translateZ(0)'; // Force hardware acceleration
        
        const speed = parseFloat(element.getAttribute('data-speed')) || 1;
        let startTime = Date.now() + (index * 300); // Stagger start times
        
        function animate() {
            const elapsed = (Date.now() - startTime) * 0.001; // Convert to seconds
            const y = Math.sin(elapsed * speed * 0.5) * 15; // Reduced movement range
            const rotation = elapsed * speed * 10; // Slower rotation
            
            element.style.transform = `translate3d(0, ${y}px, 0) rotate(${rotation}deg)`;
            requestAnimationFrame(animate);
        }
        
        // Start immediately with staggered timing
        requestAnimationFrame(animate);
    });
}

// Start floating animation when page loads
window.addEventListener('load', createFloatingAnimation);

// Optimized parallax effect - Throttled for better performance
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroHeight = hero.offsetHeight;
    
    if (scrolled < heroHeight) {
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-speed')) || 1;
            const translateY = scrolled * speed * 0.02; // Reduced effect intensity
            element.style.transform += ` translateY(${translateY}px)`;
        });
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Skill tags hover effect
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(2deg)';
    });
    
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Project cards tilt effect
document.querySelectorAll('.project-card').forEach(card => {
    // Add CSS transition for smooth tilt animations
    card.style.transition = 'transform 0.1s ease-out';
    
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Reduced tilt intensity for faster, subtler effect
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)';
    });
});

// Contact form handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');            const message = formData.get('message');
    
            // Validate form fields
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields before sending.', 'error');
                return;
            }
    
            // Direct Gmail opening with pre-filled data
            const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=anssaleem504@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;
            window.open(gmailUrl, '_blank');
            
            // Reset form and show success message
            contactForm.reset();
            showNotification('Gmail opened with your message! Please click Send in Gmail to deliver your message.', 'success');
        } catch (error) {
            console.error('Error handling form submission:', error);
            showNotification('An error occurred. Please try again.', 'error');
        }
    });
} else {
    console.warn('Contact form not found');
}

// Function to show contact modal with message details
function showContactModal(name, email, subject, message) {
    const modal = document.createElement('div');
    modal.className = 'contact-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>📧 Your Message is Ready!</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Here's what you can do:</strong></p>
                
                <div class="contact-options">
                    <div class="contact-option">
                        <h4>📋 Option 1: Copy & Send</h4>
                        <div class="message-preview">
                            <p><strong>To:</strong> anssaleem504@gmail.com</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong></p>
                            <div class="message-content">
From: ${name} (${email})

${message}
                            </div>
                        </div>
                        <button class="btn btn-primary copy-btn" onclick="copyMessage('${name}', '${email}', '${subject}', '${message}')">
                            📋 Copy Message
                        </button>
                    </div>
                    
                    <div class="contact-option">
                        <h4>📱 Option 2: Direct Contact</h4>
                        <p>Contact me directly using:</p>
                        <div class="direct-contacts">
                            <a href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=anssaleem504@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\\n\\n' + message)}" class="contact-link" target="_blank">
                                📧 Open in Gmail
                            </a>
                            <a href="mailto:anssaleem504@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\\n\\n' + message)}" class="contact-link" target="_blank">
                                📧 Default Email App
                            </a>
                            <a href="https://www.linkedin.com/in/anas-saleem2004/" class="contact-link" target="_blank">
                                💼 LinkedIn Profile
                            </a>
                            <a href="tel:+923072936880" class="contact-link">
                                📞 +92 307 2936880
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
        
        // Reset and show success message
        contactForm.reset();
        showNotification('Thank you for your message! Please use one of the contact options above.', 'success');
    }
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
}

// Function to copy message to clipboard
function copyMessage(name, email, subject, message) {
    const messageText = `To: anssaleem504@gmail.com
Subject: ${subject}

From: ${name} (${email})

${message}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(messageText).then(() => {
            showNotification('✅ Message copied to clipboard! Now paste it in your email app.', 'success');
        }).catch(() => {
            fallbackCopy(messageText);
        });
    } else {
        fallbackCopy(messageText);
    }
}

// Fallback copy function
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('✅ Message copied to clipboard! Now paste it in your email app.', 'success');
    } catch (err) {
        showNotification('❌ Unable to copy. Please manually copy the message above.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    let backgroundColor;
    switch(type) {
        case 'success':
            backgroundColor = '#28a745';
            break;
        case 'error':
            backgroundColor = '#dc3545';
            break;
        case 'info':
        default:
            backgroundColor = '#17a2b8';
            break;
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        font-size: 0.9rem;
        line-height: 1.4;
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 7000);
}

// Form field animations
document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
    field.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    field.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Preloader
function createPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <div class="preloader-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-family: 'Inter', sans-serif;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .preloader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .preloader-content {
            text-align: center;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(preloader);
    
    // Hide preloader when page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(preloader);
            }, 500);
        }, 1000);
    });
}

// Initialize preloader
createPreloader();

// Custom cursor effect
function createCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
        opacity: 0;
    `;
    
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
        cursor.style.opacity = '0.7';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '0.7';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    // Scale cursor on hover over interactive elements
    document.querySelectorAll('a, button, .btn, .skill-tag, .project-card').forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
}

// Initialize custom cursor (only on desktop)
if (window.innerWidth > 768) {
    createCustomCursor();
}

// Easter egg - Konami code
let konamiCode = [];
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.toString() === konami.toString()) {
        // Easter egg activated!
        document.body.style.animation = 'rainbow 2s infinite';
        showNotification('🎉 Konami Code activated! You found the easter egg!', 'success');
        
        // Add rainbow animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Remove effect after 5 seconds
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
        
        konamiCode = [];
    }
});

// Function to open Gmail with pre-filled email
function openGmailCompose(subject = '', body = '') {
    const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=anssaleem504@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
}

// Update all email links to open Gmail instead of default email client
document.addEventListener('DOMContentLoaded', () => {
    // Find all email links and update them to open Gmail
    const emailLinks = document.querySelectorAll('a[href^="mailto:anssaleem504@gmail.com"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openGmailCompose('Hello from your portfolio visitor!', 'Hi Anas,\n\nI visited your portfolio website and would like to connect with you.\n\nBest regards');
        });
    });
    
    // Also handle any email icons or contact buttons
    const contactButtons = document.querySelectorAll('.contact-link, .social-link');
    contactButtons.forEach(button => {
        if (button.href && button.href.includes('mailto:anssaleem504@gmail.com')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                openGmailCompose('Hello from your portfolio visitor!', 'Hi Anas,\n\nI visited your portfolio website and would like to connect with you.\n\nBest regards');
            });
        }
    });
});

// Performance optimization - Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Console message
console.log('%c👋 Hello there!', 'color: #667eea; font-size: 2em; font-weight: bold;');
console.log('%cThanks for checking out my portfolio! If you have any questions, feel free to reach out.', 'color: #764ba2; font-size: 1.2em;');
console.log('%c📧 anssaleem504@gmail.com', 'color: #667eea; font-size: 1em;');

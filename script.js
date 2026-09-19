// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Apply fade-in animation to sections
const animateElements = () => {
    const elements = document.querySelectorAll('.section, .expertise-card, .note-card, .experience-item');
    elements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
};

// Initialize animations after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    animateElements();
});

// Enhanced divider animation with scroll trigger
const dividers = document.querySelectorAll('.section-divider');

const dividerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const line = entry.target.querySelector('.divider-line');
            if (line && !line.classList.contains('animated')) {
                line.classList.add('animated');
                // Trigger animation restart
                line.style.animation = 'none';
                setTimeout(() => {
                    line.style.animation = '';
                }, 10);
            }
        }
    });
}, {
    threshold: 0.5
});

dividers.forEach(divider => {
    dividerObserver.observe(divider);
});

// Active navigation link on scroll
let sections = document.querySelectorAll('section[id]');
let navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = 'var(--text-primary)';
        }
    });
});

// Add subtle parallax effect to divider lines (optional, very minimal)
let lastScrollY = window.scrollY;
let ticking = false;

function updateDividers() {
    const scrollY = window.scrollY;
    
    dividers.forEach((divider, index) => {
        const rect = divider.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Only apply effect when divider is near viewport
        if (rect.top < viewportHeight && rect.bottom > 0) {
            const line = divider.querySelector('.divider-line::before');
            // Very subtle effect - just adjusting animation timing
            if (line) {
                const progress = (viewportHeight - rect.top) / viewportHeight;
                // This creates a very subtle speed variation
                divider.style.setProperty('--scroll-progress', progress);
            }
        }
    });
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    
    if (!ticking) {
        window.requestAnimationFrame(updateDividers);
        ticking = true;
    }
});

// Prevent animation jank on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Keyboard accessibility improvements
document.addEventListener('keydown', (e) => {
    // Allow Escape to blur focused elements
    if (e.key === 'Escape') {
        document.activeElement.blur();
    }
});

// Performance optimization: Lazy load sections that are below the fold
const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Mark as loaded
            entry.target.setAttribute('data-loaded', 'true');
            lazyLoadObserver.unobserve(entry.target);
        }
    });
}, {
    rootMargin: '200px'
});

// Apply lazy loading to sections
document.querySelectorAll('.section').forEach(section => {
    lazyLoadObserver.observe(section);
});


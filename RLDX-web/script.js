/**
 * RLWRLD Tech Blog - Interactive Features
 * Pure vanilla JavaScript for modern web interactions
 */

// ==========================================
// Reading Progress Bar
// ==========================================
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');

    // Calculate scroll progress
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calculate percentage
    const progress = (scrollTop / documentHeight) * 100;

    // Update progress bar width
    progressBar.style.width = `${Math.min(progress, 100)}%`;
}

// ==========================================
// Smooth Scroll for Navigation Links
// ==========================================
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            e.preventDefault();

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Calculate offset for sticky header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================
// Lazy Loading for Images
// ==========================================
function initLazyLoading() {
    // Check if browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Add loaded class for fade-in effect
                    img.classList.add('loaded');

                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with loading="lazy"
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// ==========================================
// Add Animation on Scroll
// ==========================================
function initScrollAnimations() {
    // Check if browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe sections for animation
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            animationObserver.observe(section);
        });

        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==========================================
// Header Shadow on Scroll
// ==========================================
function initHeaderShadow() {
    const header = document.querySelector('.header');

    function updateHeaderShadow() {
        if (window.scrollY > 10) {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    }

    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
}

// ==========================================
// Copy Code Functionality (if needed)
// ==========================================
function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 12px;
            font-size: 0.875rem;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
        `;

        const pre = block.parentElement;
        pre.style.position = 'relative';
        pre.appendChild(button);

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

// ==========================================
// External Links - Open in New Tab
// ==========================================
function initExternalLinks() {
    const links = document.querySelectorAll('a[href^="http"]');

    links.forEach(link => {
        // Skip if it's a link to the same domain
        if (!link.href.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

// ==========================================
// Performance Optimization - Throttle Scroll
// ==========================================
function throttle(func, wait) {
    let timeout;
    let previous = 0;

    return function executedFunction(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

// ==========================================
// Initialize All Features on DOM Load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize smooth scrolling
    initSmoothScroll();

    // Initialize lazy loading
    initLazyLoading();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize header shadow
    initHeaderShadow();

    // Initialize external links
    initExternalLinks();

    // Initialize code copy buttons (if any code blocks exist)
    initCodeCopy();

    console.log('🤖 RLWRLD Tech Blog loaded successfully!');
});

// ==========================================
// Scroll Events with Throttling
// ==========================================
const throttledProgressBar = throttle(updateProgressBar, 10);
window.addEventListener('scroll', throttledProgressBar, { passive: true });

// ==========================================
// Resize Handler
// ==========================================
window.addEventListener('resize', throttle(() => {
    updateProgressBar();
}, 100), { passive: true });

// ==========================================
// Print Optimization
// ==========================================
window.addEventListener('beforeprint', () => {
    // Expand all collapsed sections before printing
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// ==========================================
// Performance Monitoring (Optional)
// ==========================================
if ('PerformanceObserver' in window) {
    try {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Log performance metrics for debugging
                if (entry.entryType === 'navigation') {
                    console.log(`⚡ Page Load Time: ${entry.loadEventEnd - entry.fetchStart}ms`);
                }
            }
        });

        perfObserver.observe({ entryTypes: ['navigation'] });
    } catch (e) {
        // Performance observer not supported
    }
}

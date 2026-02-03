// Common Header and Footer Management
// This script dynamically generates the header and footer for all pages

(function() {
    'use strict';

    // Detect if we're in a subdirectory
    const isSubDirectory = window.location.pathname.includes('/RLDX-web/') ||
                           window.location.pathname.includes('/news/') ||
                           window.location.pathname.includes('/research/');

    const basePath = isSubDirectory ? '../' : '';
    const rldxPath = isSubDirectory ? '../RLDX-web/index.html' : 'RLDX-web/index.html';

    // Header HTML structure
    const headerHTML = `
        <div class="container">
            <div class="header-content">
                <a href="${basePath}index.html" class="logo">
                    <img src="${basePath}assets/logos/RLWRLD-compact-logo-white.svg" alt="RLWRLD" class="logo-img">
                </a>
                <nav class="nav">
                    <a href="${basePath}company.html" class="nav-link">Company</a>
                    <a href="${rldxPath}" class="nav-link">RLDX</a>
                    <a href="${basePath}news.html" class="nav-link">News</a>
                    <a href="${basePath}business.html" class="nav-link">Business</a>
                    <a href="${basePath}research.html" class="nav-link">Research</a>
                    <a href="${basePath}careers.html" class="nav-link">Careers</a>
                    <a href="${basePath}contact.html" class="nav-link">Contact</a>
                </nav>
            </div>
        </div>
    `;

    // Footer HTML structure
    const footerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <img src="${basePath}assets/logos/RLWRLD-compact-logo-white.svg" alt="RLWRLD" class="footer-logo-img">
                </div>
                <div style="display: flex; gap: 1.5rem; margin: 1rem 0;">
                    <a href="https://x.com/RLWRLD_ai" target="_blank" style="color: var(--text-secondary); transition: var(--transition);">X (Twitter)</a>
                    <a href="https://www.linkedin.com/company/rlwrld/" target="_blank" style="color: var(--text-secondary); transition: var(--transition);">LinkedIn</a>
                    <a href="https://www.youtube.com/@rlwrld.dexterity" target="_blank" style="color: var(--text-secondary); transition: var(--transition);">YouTube</a>
                </div>
                <p class="footer-text">&copy; 2025 RLWRLD Inc. All rights reserved.</p>
            </div>
        </div>
    `;

    // Function to inject header
    function injectHeader() {
        const headerElement = document.querySelector('header.header');
        if (headerElement) {
            headerElement.innerHTML = headerHTML;
        }
    }

    // Function to inject footer
    function injectFooter() {
        const footerElement = document.querySelector('footer.footer');
        if (footerElement) {
            footerElement.innerHTML = footerHTML;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            injectHeader();
            injectFooter();
        });
    } else {
        injectHeader();
        injectFooter();
    }
})();

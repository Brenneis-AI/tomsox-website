/*
  File: page.js
  Page: team-records-data
  Section: Team Records — accordion toggle, sidebar/chip nav, search, scroll-to-top
  Last Updated: 2026-03-08
*/

// ==========================================
// ACCORDION TOGGLE
// ==========================================
function toggleAccordion(header) {
    const section = header.parentElement;
    const isOpen = section.classList.contains('open');
    
    if (isOpen) {
        // Close this accordion
        section.classList.remove('open');
    } else {
        // Open this accordion
        section.classList.add('open');
    }
}

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const chipLinks = document.querySelectorAll('.chip-link');
const accordions = document.querySelectorAll('.accordion');

// Function to handle navigation (works for both sidebar and chips)
function handleNavClick(e, targetId) {
    e.preventDefault();
    
    const targetAccordion = document.getElementById(targetId);
    
    if (targetAccordion) {
        // Open target accordion if not already open
        if (!targetAccordion.classList.contains('open')) {
            targetAccordion.classList.add('open');
        }
        
        // Scroll to target with offset
        setTimeout(() => {
            const yOffset = -100;
            const element = targetAccordion;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        }, 100);
    }
}

// Sidebar link clicks
sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('data-target');
        handleNavClick(e, targetId);
    });
});

// Chip link clicks
chipLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('data-target');
        handleNavClick(e, targetId);
    });
});

// ==========================================
// ACTIVE SECTION TRACKING ON SCROLL
// ==========================================
function updateActiveSection() {
    const scrollPosition = window.scrollY + 150;
    
    accordions.forEach(accordion => {
        const sectionTop = accordion.offsetTop;
        const sectionHeight = accordion.offsetHeight;
        const sectionId = accordion.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Update sidebar links
            sidebarLinks.forEach(link => {
                if (link.getAttribute('data-target') === sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            // Update chip links
            chipLinks.forEach(link => {
                if (link.getAttribute('data-target') === sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveSection);
window.addEventListener('load', updateActiveSection);

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================
const searchInput = document.getElementById('searchInput');
let searchTimeout;

searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const searchTerm = this.value.toLowerCase().trim();
        
        // Clear previous highlights
        document.querySelectorAll('.search-highlight').forEach(row => {
            row.classList.remove('search-highlight');
        });
        
        if (searchTerm.length < 2) {
            return;
        }
        
        let firstMatch = null;
        const allRows = document.querySelectorAll('.records-table tbody tr');
        
        allRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            
            if (rowText.includes(searchTerm)) {
                // Highlight the row
                row.classList.add('search-highlight');
                
                // Track first match
                if (!firstMatch) {
                    firstMatch = row;
                }
                
                // Open parent accordion
                const parentAccordion = row.closest('.accordion');
                if (parentAccordion && !parentAccordion.classList.contains('open')) {
                    parentAccordion.classList.add('open');
                }
            }
        });
        
        // Scroll to first match
        if (firstMatch) {
            setTimeout(() => {
                const yOffset = -120;
                const y = firstMatch.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }, 200);
        }
        
    }, 300);
});

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==========================================
// INITIALIZE - ALL ACCORDIONS CLOSED
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Ensure all accordions start closed
    accordions.forEach(accordion => {
        accordion.classList.remove('open');
    });
    updateActiveSection();
});

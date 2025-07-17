// unit_test_server/static/js/header.js
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;

    const isHidden = menu.classList.contains('hidden');

    if (isHidden) {
        menu.classList.remove('hidden');
        // Small delay to ensure the element is rendered before animation
        requestAnimationFrame(() => {
            menu.classList.remove('translate-x-full');
        });
    } else {
        menu.classList.add('translate-x-full');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 300);
    }
}

function toggleMobileSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    const input = document.getElementById('mobile-search-input');

    overlay.classList.remove('hidden');
    // Focus the input after a short delay to ensure it's visible
    setTimeout(() => {
        input.focus();
    }, 100);
}

function closeMobileSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    overlay.classList.add('hidden');
}

// Close mobile search when clicking outside or pressing escape
document.addEventListener('click', function (event) {
    const overlay = document.getElementById('mobile-search-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;

    const searchBtn = event.target.closest('button[onclick="toggleMobileSearch()"]');
    if (searchBtn) return;

    const content = overlay.querySelector('.flex.flex-col.h-full');
    if (content && !content.contains(event.target)) {
        closeMobileSearch();
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeMobileSearch();

        // Also close mobile menu if open
        const menu = document.getElementById('mobile-menu');
        if (menu && !menu.classList.contains('hidden')) {
            toggleMobileMenu();
        }
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', function (event) {
    const menu = document.getElementById('mobile-menu');
    if (!menu || menu.classList.contains('hidden')) return;

    const toggleBtn = event.target.closest('button[onclick="toggleMobileMenu()"]');
    if (toggleBtn) return;

    if (!menu.contains(event.target)) {
        toggleMobileMenu();
    }
});

// Enhanced touch gesture support
let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (touchStartX === null || touchStartY === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const endX = e.changedTouches[0].clientX;

    // Only respond to primarily horizontal swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
        touchStartX = null;
        touchStartY = null;
        return;
    }

    const menu = document.getElementById('mobile-menu');

    // Swipe from right edge to open menu
    if (deltaX < -80 && Math.abs(deltaX) > 60 && endX > (window.innerWidth - 100)) {
        if (menu && menu.classList.contains('hidden')) {
            toggleMobileMenu();
        }
    }

    // Swipe right to close menu
    if (deltaX > 80 && menu && !menu.classList.contains('hidden')) {
        toggleMobileMenu();
    }

    touchStartX = null;
    touchStartY = null;
});

// Auto-close mobile menu on window resize
window.addEventListener('resize', () => {
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden') && window.innerWidth >= 640) {
        toggleMobileMenu();
    }
});
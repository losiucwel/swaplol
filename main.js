class SwapLol {
    constructor() {
        this.init();
    }

    init() {
        this.initScrollAnimations();
        this.initPricingToggle();
        this.initProfileCustomization();
        this.initMobileMenu();
        this.initCounters();
        this.initTabs();
        this.initNotifications();
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });
    }

    initPricingToggle() {
        const toggle = document.getElementById('pricing-toggle');
        const monthlyPrices = document.querySelectorAll('.monthly-price');
        const yearlyPrices = document.querySelectorAll('.yearly-price');

        if (toggle) {
            toggle.addEventListener('change', () => {
                const isYearly = toggle.checked;
                monthlyPrices.forEach(price => {
                    price.style.display = isYearly ? 'none' : 'inline-block';
                });
                yearlyPrices.forEach(price => {
                    price.style.display = isYearly ? 'inline-block' : 'none';
                });
            });
        }
    }

    initProfileCustomization() {
        const tabs = document.querySelectorAll('.sidebar-nav-item[data-tab]');
        const tabContents = {
            'customize': document.getElementById('tab-customize'),
            'links': document.getElementById('tab-links'),
            'shop': document.getElementById('tab-shop')
        };

        if (tabs.length) {
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    Object.values(tabContents).forEach(content => content.classList.add('hidden'));

                    tab.classList.add('active');
                    const tabName = tab.dataset.tab;
                    if (tabContents[tabName]) {
                        tabContents[tabName].classList.remove('hidden');
                    }
                });
            });
        }

        const previewContainer = document.getElementById('preview-container');
        const previewCard = document.querySelector('.preview-card');
        const previewUsername = document.getElementById('preview-username');
        const previewBio = document.getElementById('preview-bio');
        const previewAvatar = document.getElementById('preview-avatar');

        const inputs = {
            username: document.getElementById('input-username'),
            bio: document.getElementById('input-bio'),
            avatar: document.getElementById('input-avatar'),
            background: document.getElementById('input-background'),
            opacity: document.querySelector('input[type="range"][min="0"][max="100"]'),
            blur: document.querySelector('input[type="range"][min="0"][max="20"]'),
        };

        if (inputs.username) {
            inputs.username.addEventListener('input', (e) => {
                if (previewUsername) previewUsername.textContent = e.target.value || 'Nazwa użytkownika';
            });
        }

        if (inputs.bio) {
            inputs.bio.addEventListener('input', (e) => {
                if (previewBio) previewBio.textContent = e.target.value || 'Bio / Opis';
            });
        }

        if (inputs.avatar) {
            inputs.avatar.addEventListener('input', (e) => {
                if (previewAvatar && e.target.value) previewAvatar.src = e.target.value;
            });
        }

        if (inputs.background) {
            inputs.background.addEventListener('input', (e) => {
                if (previewContainer && e.target.value) {
                    previewContainer.style.backgroundImage = `url('${e.target.value}')`;
                }
            });
        }

        if (inputs.opacity) {
            inputs.opacity.addEventListener('input', (e) => {
                if (previewCard) {
                    const opacity = e.target.value / 100;
                    previewCard.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
                }
            });
        }

        if (inputs.blur) {
            inputs.blur.addEventListener('input', (e) => {
                if (previewCard) {
                    previewCard.style.backdropFilter = `blur(${e.target.value}px)`;
                }
            });
        }

        const colorOptions = document.querySelectorAll('.color-option');
        if (colorOptions.length) {
            colorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    colorOptions.forEach(o => o.style.borderColor = 'transparent');
                    option.style.borderColor = '#FFFFFF';

                    const color = option.dataset.color;
                    const badges = document.querySelectorAll('.preview-badge');
                    badges.forEach(badge => {
                        badge.style.backgroundColor = color === '#FFFFFF' ? 'rgba(255,255,255,0.1)' : color;
                        badge.style.color = color === '#FFFFFF' ? '#FFFFFF' : '#000000';
                    });
                });
            });
        }

        const btnAddBadge = document.getElementById('btn-add-badge');
        const inputBadgeEmoji = document.getElementById('badge-emoji');
        const inputBadgeText = document.getElementById('badge-text');
        const badgeList = document.getElementById('badge-list');
        const previewBadgesContainer = document.getElementById('preview-badges');

        window.updatePreviewBadges = () => {
            if (!badgeList || !previewBadgesContainer) return;

            previewBadgesContainer.innerHTML = '';
            const currentBadges = badgeList.querySelectorAll('div.flex.items-center.justify-between');

            currentBadges.forEach(badgeEl => {
                const emoji = badgeEl.querySelector('span.text-lg').textContent;
                const text = badgeEl.querySelector('span.text-sm').textContent;

                const badgeHTML = `
                    <span class="preview-badge"><span class="text-xs">${emoji}</span> ${text}</span>
                `;
                previewBadgesContainer.insertAdjacentHTML('beforeend', badgeHTML);
            });
        };

        if (btnAddBadge) {
            btnAddBadge.addEventListener('click', () => {
                const emoji = inputBadgeEmoji.value.trim();
                const text = inputBadgeText.value.trim();

                if (emoji && text) {
                    const newBadgeHTML = `
                        <div class="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">${emoji}</span>
                                <span class="text-sm">${text}</span>
                            </div>
                            <button class="text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onclick="this.parentElement.remove(); updatePreviewBadges();">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    `;
                    badgeList.insertAdjacentHTML('beforeend', newBadgeHTML);

                    inputBadgeEmoji.value = '';
                    inputBadgeText.value = '';

                    updatePreviewBadges();
                }
            });
        }
    }

    initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Only animate if there's a data-target attribute
                    const targetAttr = entry.target.dataset.target;
                    if (!targetAttr) {
                        observer.unobserve(entry.target);
                        return; // Skip animation for counters without data-target
                    }
                    
                    const target = parseInt(targetAttr);
                    if (!isNaN(target)) {
                        this.animateCounter(entry.target, target);
                    }
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    initTabs() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.addEventListener('click', () => {
                this.switchAuthTab('login');
            });

            registerTab.addEventListener('click', () => {
                this.switchAuthTab('register');
            });

            if (window.location.hash === '#register') {
                this.switchAuthTab('register');
            }
        }

        const sidebarItems = document.querySelectorAll('.sidebar-item');
        if (sidebarItems.length) {
            sidebarItems.forEach(item => {
                item.addEventListener('click', () => {
                    const sectionName = item.dataset.section;
                    if (!sectionName) return;

                    sidebarItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    document.querySelectorAll('.section-content').forEach(section => {
                        section.classList.add('hidden');
                    });
                    const targetSection = document.getElementById(`${sectionName}-section`);
                    if (targetSection) {
                        targetSection.classList.remove('hidden');
                        this.initScrollAnimations();
                    }
                });
            });
        }
    }

    switchAuthTab(type) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (type === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    initNotifications() {
        window.showNotification = (message, type = 'info') => {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;

            document.body.appendChild(notification);

            notification.offsetHeight;

            setTimeout(() => {
                notification.classList.add('show');
            }, 10);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new SwapLol();
});
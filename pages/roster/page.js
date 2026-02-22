<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
<script>
/*
  File: page.js
  Page: Roster
  Last Updated: 2026-02-20
*/

/* =========================================================
   TOM SOX ROSTER — PAGE JS
   No modal, everything on card
   ========================================================= */

const CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSel5a7jlW41WyAERTJVyta-yh88PkFCqRIVq_37jeuWkDhedBkQ_PQVpkUo_Ke_zPPrjc5v4aN6_A6/pub?gid=521946990&single=true&output=csv',
    ANIMATION_DURATION: 500,
    DEFAULT_PLAYER_INDEX: 0,
    TOM_SOX_LOGO: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908ddd580d6c26157bbf5.png',
    DEFAULT_PLAYER_IMAGE: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E'
};

// State management
let playersData = [];
let coachesData = [];
let filteredPlayers = [];
let currentPlayerIndex = -1;
let showingFavoritesOnly = false;
let favoritePlayerIds = new Set();
let currentFilters = {
    position: '',
    college: '',
    year: '',
    search: ''
};

// DOM references
const playerMenu = document.getElementById('player-list-menu');
const cardsContainer = document.getElementById('player-cards-container');
const playerIndicator = document.getElementById('player-indicator');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function validatePlayerData(player) {
    return player.playerName && player.playerName.trim() !== '';
}

function isCoach(person) {
    return person.playerType && person.playerType.toLowerCase() === 'coach';
}

function isMobileView() {
    return window.innerWidth <= 768;
}

function formatStatValue(label, value) {
    if (!value || value === '') return '--';
    if (label && label.toUpperCase() === 'AVG') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            return num.toFixed(3).replace(/^0/, '');
        }
    }
    return value;
}

function formatBioText(bioText) {
    if (!bioText) return '';
    return bioText.replace(/\n/g, '<br>');
}

function getYearClass(classYear) {
    if (!classYear) return '';
    const year = classYear.toLowerCase();
    if (year.includes('fr') || year.includes('freshman')) return 'freshman';
    if (year.includes('so') || year.includes('sophomore')) return 'sophomore';
    if (year.includes('jr') || year.includes('junior')) return 'junior';
    if (year.includes('sr') || year.includes('senior')) return 'senior';
    return '';
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

/* =========================================================
   FAVORITES MANAGEMENT
   ========================================================= */

async function loadFavorites() {
    try {
        if (window.storage && typeof window.storage.list === 'function') {
            const keys = await window.storage.list('favorite-');
            if (keys && keys.keys) {
                keys.keys.forEach(key => {
                    favoritePlayerIds.add(key.replace('favorite-', ''));
                });
            }
        } else {
            const favoritesJson = localStorage.getItem('tom-sox-favorites');
            if (favoritesJson) {
                JSON.parse(favoritesJson).forEach(id => favoritePlayerIds.add(id));
            }
        }
    } catch (error) {
        console.log('Favorites system not available');
    }
}

async function toggleFavorite(playerId) {
    const key = `favorite-${playerId}`;
    try {
        if (window.storage && typeof window.storage.set === 'function') {
            if (favoritePlayerIds.has(playerId)) {
                await window.storage.delete(key);
                favoritePlayerIds.delete(playerId);
                return false;
            } else {
                await window.storage.set(key, 'true');
                favoritePlayerIds.add(playerId);
                return true;
            }
        } else {
            if (favoritePlayerIds.has(playerId)) {
                favoritePlayerIds.delete(playerId);
            } else {
                favoritePlayerIds.add(playerId);
            }
            localStorage.setItem('tom-sox-favorites', JSON.stringify(Array.from(favoritePlayerIds)));
            return favoritePlayerIds.has(playerId);
        }
    } catch (error) {
        console.error('Storage error:', error);
        return null;
    }
}

function updateFavoriteButton(playerId) {
    const btn = document.querySelector(`.favorite-btn[data-player-id="${playerId}"]`);
    if (btn) {
        if (favoritePlayerIds.has(playerId)) {
            btn.classList.add('favorited');
            btn.setAttribute('aria-label', 'Remove from favorites');
        } else {
            btn.classList.remove('favorited');
            btn.setAttribute('aria-label', 'Add to favorites');
        }
    }
}

/* =========================================================
   NUMBER ANIMATION
   ========================================================= */

function animateNumber(element, finalValue, duration = 1000) {
    if (isMobileView()) {
        element.textContent = finalValue;
        return;
    }

    const isDecimal = finalValue.toString().includes('.');
    const numericValue = parseFloat(finalValue.toString().replace(/[^0-9.-]/g, ''));

    if (isNaN(numericValue)) {
        element.textContent = finalValue;
        return;
    }

    const startValue = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuad = progress * (2 - progress);
        const current = startValue + (numericValue - startValue) * easeOutQuad;

        if (isDecimal) {
            element.textContent = current.toFixed(3).replace(/^0/, '');
        } else {
            element.textContent = Math.floor(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = finalValue;
        }
    }

    requestAnimationFrame(update);
}

/* =========================================================
   DATA LOADING
   ========================================================= */

async function loadRosterData() {
    await loadFavorites();

    Papa.parse(CONFIG.SHEET_URL, {
        download: true,
        header: true,
        complete: function(results) {
            if (!results || !results.data) {
                showError('Failed to parse roster data');
                return;
            }

            // Separate players and coaches
            playersData = results.data.filter(person => validatePlayerData(person) && !isCoach(person));
            coachesData = results.data.filter(person => validatePlayerData(person) && isCoach(person));

            playersData.sort((a, b) => a.playerName.localeCompare(b.playerName));

            if (playersData.length === 0) {
                showError('No player data available');
                return;
            }

            populateFilterOptions();
            filterPlayers();
            setupEventListeners();
            showPlayer(CONFIG.DEFAULT_PLAYER_INDEX);
            renderCoachingStaff();
        },
        error: function(error) {
            showError('Failed to load roster data');
            console.error('Parse error:', error);
        }
    });
}

function showError(message) {
    cardsContainer.innerHTML = `
        <div class="loading-container" style="justify-content: center; align-items: center;">
            <p style="color: #e74c3c; font-size: 1.2rem;">${message}</p>
            <p style="color: #777;">Please try refreshing the page</p>
        </div>
    `;
}

/* =========================================================
   FILTER MANAGEMENT
   ========================================================= */

function populateFilterOptions() {
    const positions = [...new Set(playersData.map(p => p.position).filter(Boolean))].sort();
    const colleges = [...new Set(playersData.map(p => p.college).filter(Boolean))].sort();

    const positionSelect = document.getElementById('filter-position');
    const collegeSelect = document.getElementById('filter-college');

    if (positionSelect) {
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
    }

    if (collegeSelect) {
        colleges.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;
            collegeSelect.appendChild(option);
        });
    }
}

function filterPlayers() {
    const searchTerm = currentFilters.search.toLowerCase().trim();

    filteredPlayers = playersData.filter(player => {
        const matchesSearch = !searchTerm ||
            player.playerName.toLowerCase().includes(searchTerm) ||
            (player.hometown && player.hometown.toLowerCase().includes(searchTerm)) ||
            (player.college && player.college.toLowerCase().includes(searchTerm));

        const matchesPosition = !currentFilters.position || player.position === currentFilters.position;
        const matchesCollege = !currentFilters.college || player.college === currentFilters.college;
        const matchesYear = !currentFilters.year || player.classYear === currentFilters.year;

        const globalPlayerId = playersData.indexOf(player).toString();
        const matchesFavorites = !showingFavoritesOnly || favoritePlayerIds.has(globalPlayerId);

        return matchesSearch && matchesPosition && matchesCollege && matchesYear && matchesFavorites;
    });

    const sortBy = document.getElementById('sort-by-select')?.value || 'name-az';
    sortPlayers(sortBy);

    currentPlayerIndex = -1;
    buildRoster(sortBy);

    // Restore filter UI state after buildRoster rebuilds the DOM (fixes dropdown display bug)
    const positionSelect = document.getElementById('filter-position');
    const collegeSelect = document.getElementById('filter-college');
    const yearSelect = document.getElementById('filter-year');
    const searchInput = document.getElementById('player-search');
    if (positionSelect) positionSelect.value = currentFilters.position;
    if (collegeSelect) collegeSelect.value = currentFilters.college;
    if (yearSelect) yearSelect.value = currentFilters.year;
    if (searchInput) searchInput.value = currentFilters.search;

    // Always re-attach listeners after buildRoster rebuilds the DOM (fixes Clear Filters when 0 results)
    setupEventListeners();

    if (filteredPlayers.length > 0) {
        setTimeout(() => showPlayer(0), 50);
    } else {
        const message = showingFavoritesOnly ?
            '<p style="color: #777; font-size: 1.2rem;">No favorite players yet</p><p style="color: #999;">Click the star icon to add players to favorites</p>' :
            '<p style="color: #777; font-size: 1.2rem;">No players match your filters</p><p style="color: #999;">Try adjusting your search or filters</p>';
        cardsContainer.innerHTML = `<div class="loading-container" style="justify-content: center; align-items: center;">${message}</div>`;
    }
}

function sortPlayers(sortBy) {
    switch (sortBy) {
        case 'jersey-asc':
            filteredPlayers.sort((a, b) => {
                const numA = a.jerseyNumber ? parseInt(a.jerseyNumber, 10) : Infinity;
                const numB = b.jerseyNumber ? parseInt(b.jerseyNumber, 10) : Infinity;
                return numA - numB;
            });
            break;
        case 'position-az':
            filteredPlayers.sort((a, b) => (a.position || '').localeCompare(b.position || ''));
            break;
        case 'college-az':
            filteredPlayers.sort((a, b) => (a.college || '').localeCompare(b.college || ''));
            break;
        case 'hometown-az':
            filteredPlayers.sort((a, b) => (a.hometown || '').localeCompare(b.hometown || ''));
            break;
        case 'name-az':
        default:
            filteredPlayers.sort((a, b) => a.playerName.localeCompare(b.playerName));
            break;
    }
}

function clearAllFilters() {
    currentFilters = {
        position: '',
        college: '',
        year: '',
        search: ''
    };

    const positionSelect = document.getElementById('filter-position');
    const collegeSelect = document.getElementById('filter-college');
    const yearSelect = document.getElementById('filter-year');
    const searchInput = document.getElementById('player-search');

    if (positionSelect) positionSelect.value = '';
    if (collegeSelect) collegeSelect.value = '';
    if (yearSelect) yearSelect.value = '';
    if (searchInput) searchInput.value = '';

    filterPlayers();
}

/* =========================================================
   ROSTER BUILDING
   ========================================================= */

function buildRoster(currentSort = 'name-az') {
    // Build menu header
    const menuHeader = playerMenu.querySelector('.menu-header');
    menuHeader.innerHTML = `
        <div class="mobile-favorites-bar">
            <button id="show-favorites-btn-mobile" aria-label="Show favorite players only">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Favorites</span>
            </button>
        </div>

        <select class="mobile-player-dropdown" id="mobile-player-select" aria-label="Select player">
            <option value="">Select a player...</option>
        </select>

        <div class="search-container desktop-only">
            <input type="search" id="player-search" placeholder="Search players..." aria-label="Search players">
        </div>

        <div class="filter-controls-group desktop-only">
            <div class="filter-container">
                <label for="sort-by-select">Sort By</label>
                <select id="sort-by-select" aria-label="Sort players by">
                    <option value="name-az" ${currentSort==='name-az'?'selected':''}>Name (A-Z)</option>
                    <option value="jersey-asc" ${currentSort==='jersey-asc'?'selected':''}>Jersey #</option>
                    <option value="position-az" ${currentSort==='position-az'?'selected':''}>Position</option>
                    <option value="college-az" ${currentSort==='college-az'?'selected':''}>College</option>
                    <option value="hometown-az" ${currentSort==='hometown-az'?'selected':''}>Hometown</option>
                </select>
            </div>

            <div class="filter-container">
                <label for="filter-position">Position</label>
                <select id="filter-position">
                    <option value="">All Positions</option>
                </select>
            </div>

            <div class="filter-container">
                <label for="filter-college">College</label>
                <select id="filter-college">
                    <option value="">All Colleges</option>
                </select>
            </div>

            <div class="filter-container">
                <label for="filter-year">Year</label>
                <select id="filter-year">
                    <option value="">All Years</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                </select>
            </div>

            <button class="clear-filters-btn" id="clear-filters-btn">Clear Filters</button>
        </div>

        <div class="favorites-filter desktop-only">
            <button id="show-favorites-btn" aria-label="Show favorite players only">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Show Favorites</span>
            </button>
        </div>
    `;

    populateFilterOptions();

    // Populate mobile dropdown
    const mobileDropdown = document.getElementById('mobile-player-select');
    if (mobileDropdown) {
        filteredPlayers.forEach((player, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = player.playerName;
            mobileDropdown.appendChild(option);
        });

        mobileDropdown.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value);
            if (!isNaN(selectedIndex)) {
                showPlayer(selectedIndex);
            }
        });
    }

    // Build player list
    const playerListWrapper = document.getElementById('player-list-wrapper');
    playerListWrapper.innerHTML = '';
    cardsContainer.innerHTML = '';

    filteredPlayers.forEach((player, index) => {
        const globalPlayerId = playersData.indexOf(player).toString();

        // Add to menu
        const menuLink = document.createElement('a');
        menuLink.href = '#';
        menuLink.textContent = player.playerName;
        menuLink.dataset.index = index;
        menuLink.dataset.playerId = globalPlayerId;
        menuLink.setAttribute('role', 'button');
        menuLink.setAttribute('aria-label', `View ${player.playerName} profile`);
        playerListWrapper.appendChild(menuLink);

        // Create player card
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.index = index;
        card.dataset.playerId = globalPlayerId;

        if (player.accentImageURL && player.accentImageURL.trim()) {
            card.style.backgroundImage = `url('${player.accentImageURL}')`;
        }

        // Build year badge
        const yearClass = getYearClass(player.classYear);
        const yearBadge = player.classYear ? `<span class="year-badge ${yearClass}">${player.classYear}</span>` : '';

        // Build social icons
        let socialIconsHTML = '';
        if (player.playerTwitter && player.playerTwitter.trim()) {
            const twitterUrl = player.playerTwitter.startsWith('http') ? player.playerTwitter : `https://twitter.com/${player.playerTwitter.replace('@', '')}`;
            socialIconsHTML += `
                <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="X (formerly Twitter)">
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
            `;
        }
        if (player.playerInstagram && player.playerInstagram.trim()) {
            const instaUrl = player.playerInstagram.startsWith('http') ? player.playerInstagram : `https://instagram.com/${player.playerInstagram.replace('@', '')}`;
            socialIconsHTML += `
                <a href="${instaUrl}" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Instagram">
                    <svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
                </a>
            `;
        }

        // Build college link
        let collegeLinkHTML = '';
        if (player.college && player.collegeURL && player.collegeURL.trim()) {
            collegeLinkHTML = `<a href="${player.collegeURL}" target="_blank" rel="noopener noreferrer" class="college-link">View at ${player.college} &rarr;</a>`;
        }

        // Build stats for integrated banner
        const stats = [
            { value: player.keyStat1Value, label: player.keyStat1Label },
            { value: player.keyStat2Value, label: player.keyStat2Label },
            { value: player.keyStat3Value, label: player.keyStat3Label },
            { value: player.keyStat4Value, label: player.keyStat4Label },
            { value: player.keyStat5Value, label: player.keyStat5Label }
        ];

        const statsHTML = stats.map(s => {
            if (!s.label && !s.value) return '';
            return `
                <div class="stat-item">
                    <strong>${formatStatValue(s.label, s.value)}</strong>
                    <span>${s.label || 'Stat'}</span>
                </div>
            `;
        }).join('');

        card.innerHTML = `
            <div class="tom-sox-logo-container">
                <img src="${CONFIG.TOM_SOX_LOGO}" alt="Tom Sox logo">
            </div>

            <button class="favorite-btn" data-player-id="${globalPlayerId}" aria-label="Add to favorites" type="button">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </button>

            <div class="mobile-headshot-section">
                <div class="mobile-headshot-circle">
                    ${player.playerHeadshotURL && player.playerHeadshotURL.trim() ? `
                        <img src="${player.playerHeadshotURL}" alt="${player.playerName} headshot">
                    ` : `
                        <div style="width:100%;height:100%;background:#ddd;display:flex;align-items:center;justify-content:center;color:#999;">No Photo</div>
                    `}
                </div>
                ${player.jerseyNumber ? `
                    <div class="mobile-jersey-badge">
                        <span>${player.jerseyNumber}</span>
                    </div>
                ` : ''}
            </div>

            <div class="player-header">
                ${player.jerseyNumber ? `
                    <div class="jersey-badge">
                        <span>${player.jerseyNumber}</span>
                    </div>
                ` : ''}

                <h2>
                    ${player.playerName || 'Unknown Player'}
                    ${player.collegeLogoURL && player.collegeLogoURL.trim() ? `
                        <img src="${player.collegeLogoURL}" alt="${player.college || ''} logo" class="college-logo-inline" onerror="this.style.display='none'">
                    ` : ''}
                    ${collegeLinkHTML}
                </h2>

                <div class="player-header-line1">
                    <span class="position">${player.position || 'Position N/A'}</span>
                    <span class="separator">&bull;</span>
                    <span>${player.college || 'College N/A'}</span>
                    ${yearBadge}
                </div>

                <div class="player-header-line2">
                    ${player.hometown ? `<span>${player.hometown}</span>` : ''}
                    ${player.bats ? `<span>Bats: ${player.bats}</span>` : ''}
                    ${player.throws ? `<span>Throws: ${player.throws}</span>` : ''}
                    ${player.height ? `<span>Height: ${player.height}</span>` : ''}
                    ${player.weight ? `<span>Weight: ${player.weight}</span>` : ''}
                </div>

                ${socialIconsHTML ? `<div class="player-social-icons">${socialIconsHTML}</div>` : ''}
            </div>

            <div class="player-image-spacer"></div>

            <div class="player-stats-integrated">
                ${statsHTML}
                <div class="mobile-stats-row-1">
                    ${stats[0].label ? `
                        <div class="stat-item">
                            <strong>${formatStatValue(stats[0].label, stats[0].value)}</strong>
                            <span>${stats[0].label}</span>
                        </div>
                    ` : ''}
                    ${stats[1].label ? `
                        <div class="stat-item">
                            <strong>${formatStatValue(stats[1].label, stats[1].value)}</strong>
                            <span>${stats[1].label}</span>
                        </div>
                    ` : ''}
                    ${stats[2].label ? `
                        <div class="stat-item">
                            <strong>${formatStatValue(stats[2].label, stats[2].value)}</strong>
                            <span>${stats[2].label}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="mobile-stats-row-2">
                    ${stats[3].label ? `
                        <div class="stat-item">
                            <strong>${formatStatValue(stats[3].label, stats[3].value)}</strong>
                            <span>${stats[3].label}</span>
                        </div>
                    ` : ''}
                    ${stats[4].label ? `
                        <div class="stat-item">
                            <strong>${formatStatValue(stats[4].label, stats[4].value)}</strong>
                            <span>${stats[4].label}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="player-bio-bottom">
                ${player.bio && player.bio.trim() ? `
                    <div class="bio-text-content">${formatBioText(player.bio)}</div>
                ` : ''}

                ${player.playerHeadshotURL && player.playerHeadshotURL.trim() ? `
                    <div class="player-headshot-corner">
                        <img src="${player.playerHeadshotURL}" alt="${player.playerName} headshot">
                    </div>
                ` : ''}
            </div>

            ${player.playerImageMobile && player.playerImageMobile.trim() ? `
                <div class="mobile-action-image">
                    <img src="${player.playerImageMobile}" alt="${player.playerName} action shot" loading="lazy">
                </div>
            ` : ''}
        `;

        cardsContainer.appendChild(card);
        updateFavoriteButton(globalPlayerId);
    });

    // Setup favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const handleFavoriteClick = async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const playerId = btn.dataset.playerId;
            const isFavorited = await toggleFavorite(playerId);

            if (isFavorited !== null) {
                updateFavoriteButton(playerId);
                if (showingFavoritesOnly && !isFavorited) {
                    setTimeout(() => filterPlayers(), 300);
                }
            }
        };

        btn.addEventListener('click', handleFavoriteClick);
    });

    // Setup favorites buttons — desktop and mobile share one toggle function
    function syncFavoriteBtns() {
        const desktopBtn = document.getElementById('show-favorites-btn');
        const mobileBtn  = document.getElementById('show-favorites-btn-mobile');
        if (desktopBtn) {
            desktopBtn.classList.toggle('active', showingFavoritesOnly);
            desktopBtn.querySelector('span').textContent = showingFavoritesOnly ? 'Show All Players' : 'Show Favorites';
        }
        if (mobileBtn) {
            mobileBtn.classList.toggle('active', showingFavoritesOnly);
            mobileBtn.querySelector('span').textContent = showingFavoritesOnly ? 'All Players' : 'Favorites';
        }
    }

    function onFavoritesToggle() {
        showingFavoritesOnly = !showingFavoritesOnly;
        syncFavoriteBtns();
        filterPlayers();
    }

    const showFavoritesBtn = document.getElementById('show-favorites-btn');
    if (showFavoritesBtn) showFavoritesBtn.addEventListener('click', onFavoritesToggle);

    const showFavoritesBtnMobile = document.getElementById('show-favorites-btn-mobile');
    if (showFavoritesBtnMobile) showFavoritesBtnMobile.addEventListener('click', onFavoritesToggle);

    syncFavoriteBtns();

    updatePlayerCount();
}

function updatePlayerCount() {
    const countEl = document.getElementById('player-count');
    const count = filteredPlayers.length;
    if (countEl) {
        countEl.textContent = `${count} player${count !== 1 ? 's' : ''}`;
    }
}

/* =========================================================
   PLAYER NAVIGATION
   ========================================================= */

function showPlayer(newIndex, direction = null) {
    if (filteredPlayers.length === 0) return;

    const oldIndex = currentPlayerIndex;
    if (newIndex === oldIndex) return;

    newIndex = parseInt(newIndex);
    if (newIndex < 0 || newIndex >= filteredPlayers.length) return;

    if (direction === null) {
        direction = (oldIndex === -1 || newIndex > oldIndex) ? 'next' : 'prev';
    }

    currentPlayerIndex = newIndex;
    const currentPlayer = filteredPlayers[newIndex];

    // Announce player change to screen readers
    const announcement = document.getElementById('player-announcement');
    if (announcement) {
        announcement.textContent = `Now showing ${currentPlayer.playerName}`;
    }

    const allCards = document.querySelectorAll('.player-card');
    const oldCard = document.querySelector(`.player-card[data-index="${oldIndex}"]`);
    const newCard = document.querySelector(`.player-card[data-index="${newIndex}"]`);

    // Update menu
    document.querySelectorAll('.roster-left-menu a').forEach(link => {
        link.classList.remove('active');
        if (parseInt(link.dataset.index) === currentPlayerIndex) {
            link.classList.add('active');
            if (window.innerWidth > 1024) {
                link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });

    // Handle card transitions
    if (isMobileView()) {
        allCards.forEach(card => card.classList.remove('active'));
        if (newCard) newCard.classList.add('active');
    } else {
        if (oldCard) {
            oldCard.classList.remove('active', 'from-left', 'from-right');
            oldCard.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');
        }

        if (newCard) {
            newCard.classList.remove('slide-left', 'slide-right');
            newCard.classList.add('active', direction === 'next' ? 'from-right' : 'from-left');
        }

        if (oldCard) {
            setTimeout(() => {
                oldCard.classList.remove('slide-left', 'slide-right');
            }, CONFIG.ANIMATION_DURATION);
        }
    }

    updatePlayerIndicator();
}

function updatePlayerIndicator() {
    if (playerIndicator) {
        playerIndicator.textContent = `${currentPlayerIndex + 1} / ${filteredPlayers.length}`;
    }
}

function navigatePlayer(direction) {
    let newIndex = currentPlayerIndex + direction;
    if (newIndex < 0) newIndex = filteredPlayers.length - 1;
    if (newIndex >= filteredPlayers.length) newIndex = 0;
    showPlayer(newIndex, direction > 0 ? 'next' : 'prev');
}

/* =========================================================
   COACHING STAFF
   ========================================================= */

function renderCoachingStaff() {
    if (coachesData.length === 0) return;

    const section = document.getElementById('coaching-staff-section');
    const grid = document.getElementById('coaching-staff-grid');

    grid.innerHTML = coachesData.map(coach => `
        <div class="coach-card">
            ${coach.playerHeadshotURL && coach.playerHeadshotURL.trim() ? `
                <div class="coach-headshot">
                    <img src="${coach.playerHeadshotURL}" alt="${coach.playerName} headshot">
                </div>
            ` : ''}
            <div class="coach-name">${coach.playerName}</div>
            <div class="coach-title">${coach.position || 'Coach'}</div>
            ${coach.bio && coach.bio.trim() ? `
                <div class="coach-bio-preview">${coach.bio}</div>
            ` : ''}
        </div>
    `).join('');

    section.style.display = 'block';
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {
    const searchInput = document.getElementById('player-search');
    if (searchInput) {
        searchInput.removeEventListener('input', debouncedSearch);
        searchInput.addEventListener('input', debouncedSearch);
    }

    const sortSelect = document.getElementById('sort-by-select');
    if (sortSelect) {
        sortSelect.removeEventListener('change', handleSortChange);
        sortSelect.addEventListener('change', handleSortChange);
    }

    const filterPosition = document.getElementById('filter-position');
    const filterCollege = document.getElementById('filter-college');
    const filterYear = document.getElementById('filter-year');

    if (filterPosition) {
        filterPosition.removeEventListener('change', handleFilterChange);
        filterPosition.addEventListener('change', handleFilterChange);
    }
    if (filterCollege) {
        filterCollege.removeEventListener('change', handleFilterChange);
        filterCollege.addEventListener('change', handleFilterChange);
    }
    if (filterYear) {
        filterYear.removeEventListener('change', handleFilterChange);
        filterYear.addEventListener('change', handleFilterChange);
    }

    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

const debouncedSearch = debounce((e) => {
    currentFilters.search = e.target.value;
    filterPlayers();
}, 300);

function handleSortChange(e) {
    filterPlayers();
}

function handleFilterChange(e) {
    const id = e.target.id;
    if (id === 'filter-position') currentFilters.position = e.target.value;
    if (id === 'filter-college') currentFilters.college = e.target.value;
    if (id === 'filter-year') currentFilters.year = e.target.value;
    filterPlayers();
}

function initializeGlobalListeners() {
    // Player menu clicks
    playerMenu.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const index = parseInt(e.target.dataset.index);
            if (!isNaN(index)) showPlayer(index);
        }
    });

    // Navigation
    if (prevBtn) prevBtn.addEventListener('click', () => navigatePlayer(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigatePlayer(1));

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigatePlayer(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigatePlayer(1);
        }
    });

    // Touch swipe
    let touchStartX = 0;
    cardsContainer.addEventListener('touchstart', e => {
        if (isMobileView()) touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    cardsContainer.addEventListener('touchend', e => {
        if (isMobileView()) {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                navigatePlayer(diff > 0 ? 1 : -1);
            }
        }
    }, { passive: true });
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initRoster() {
    initializeGlobalListeners();
    loadRosterData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoster);
} else {
    initRoster();
}
</script>

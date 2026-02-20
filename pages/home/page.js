<script>
/* ============================================
   TOM SOX V3.5 - WITH OPPONENTCITY FIX
   - Uses OpponentCity column from spreadsheet
   - Responsive opponent names
   ============================================ */

function TomSoxHomePage() {

    // --- CONFIGURATION ---
    const CONFIG = {
        scheduleCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSel5a7jlW41WyAERTJVyta-yh88PkFCqRIVq_37jeuWkDhedBkQ_PQVpkUo_Ke_zPPrjc5v4aN6_A6/pub?output=csv&gid=324326629',
        heroCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSel5a7jlW41WyAERTJVyta-yh88PkFCqRIVq_37jeuWkDhedBkQ_PQVpkUo_Ke_zPPrjc5v4aN6_A6/pub?output=csv&gid=351248241',
        tomSoxLogoUrl: 'https://storage.googleapis.com/msgsndr/xPpGvlvaXWhYtIJUg0CZ/media/686c8a6a1ceb7bf881eb68c4.png',
        // Cache duration in milliseconds (5 minutes)
        cacheDuration: 5 * 60 * 1000
    };

    // --- UTILITY FUNCTIONS ---
    const Utils = {
        parseDate(dateString) { 
            if (!dateString) return null; 
            const parts = dateString.split('/'); 
            if (parts.length !== 3) return null; 
            const [month, day, year] = parts.map(p => parseInt(p, 10)); 
            return new Date(year, month - 1, day); 
        },
        formatDate(date) { 
            if (!(date instanceof Date) || isNaN(date)) return ''; 
            return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }); 
        },
        getDayOfWeek(date) { 
            if (!(date instanceof Date) || isNaN(date)) return ''; 
            return date.toLocaleDateString('en-US', { weekday: 'long' }); 
        },
        parseCsv(csvText) {
            const rows = csvText.trim().split(/\r?\n/);
            if (rows.length < 2) return [];
            const headers = rows.shift().split(',').map(h => h.trim());
            headers[0] = headers[0].replace(/^\uFEFF/, '');
            return rows.map(row => {
                const values = row.split(',');
                return headers.reduce((obj, header, i) => { 
                    obj[header] = (values[i] || '').trim(); 
                    return obj; 
                }, {});
            });
        }
    };

    // --- CACHE MANAGEMENT ---
    const Cache = {
        get(key) {
            try {
                const cached = localStorage.getItem(key);
                if (!cached) return null;
                
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;
                
                // Return cached data if it's fresh
                if (age < CONFIG.cacheDuration) {
                    console.log(`Tom Sox: Using cached ${key} (${Math.round(age/1000)}s old)`);
                    return data;
                }
                
                // Clear expired cache
                localStorage.removeItem(key);
                return null;
            } catch (e) {
                console.warn('Cache read error:', e);
                return null;
            }
        },
        
        set(key, data) {
            try {
                const cacheData = {
                    data: data,
                    timestamp: Date.now()
                };
                localStorage.setItem(key, JSON.stringify(cacheData));
                console.log(`Tom Sox: Cached ${key}`);
            } catch (e) {
                console.warn('Cache write error:', e);
            }
        }
    };

    // --- DOM ELEMENTS ---
    const nextGameInfoEl = document.getElementById('nextGameInfo');
    const heroStatsEl = document.getElementById('heroStats');
    const tickerTrackEl = document.getElementById('tickerTrack');
    const heroHeadlineEl = document.getElementById('heroHeadline');
    const heroSubheadlineEl = document.getElementById('heroSubheadline');
    const primaryCTAEl = document.getElementById('primaryCTA');
    const heroImageEl = document.getElementById('heroImage');

    if (!nextGameInfoEl || !tickerTrackEl) { 
        console.error('Tom Sox: Required elements not found');
        return; 
    }

    // --- HERO CONTENT LOADING - COMMENTED OUT ---
    // Google Sheets integration for hero content disabled for performance
    // To re-enable: uncomment this entire section
    /*
    async function loadHeroContent() {
        try {
            // Try cache first
            const cachedHero = Cache.get('tomsox_hero');
            if (cachedHero) {
                applyHeroContent(cachedHero);
                return;
            }

            // Fetch from Google Sheets
            const response = await fetch(CONFIG.heroCsvUrl);
            if (!response.ok) {
                console.warn('Hero CSV fetch failed');
                return;
            }
            
            const csvText = await response.text();
            const heroData = Utils.parseCsv(csvText);
            const activeHero = heroData.find(row => (row.IsActive || '').toUpperCase() === 'TRUE');
            
            if (!activeHero) {
                console.warn('No active hero content found');
                return;
            }
            
            // Cache the hero data
            Cache.set('tomsox_hero', activeHero);
            
            // Apply to page
            applyHeroContent(activeHero);
            
            console.log('✅ Hero content loaded and cached');
            
        } catch (error) {
            console.error('Error loading hero:', error);
        }
    }

    function applyHeroContent(heroData) {
        // Apply text content immediately
        if (heroData.Headline && heroHeadlineEl) {
            heroHeadlineEl.textContent = heroData.Headline;
        }
        if (heroData.Subheadline && heroSubheadlineEl) {
            heroSubheadlineEl.textContent = heroData.Subheadline;
        }
        if (heroData.PrimaryCTAText && primaryCTAEl) {
            primaryCTAEl.textContent = heroData.PrimaryCTAText;
        }
        if (heroData.PrimaryCTALink && primaryCTAEl) {
            primaryCTAEl.href = heroData.PrimaryCTALink;
        }
        
        // Apply background image IMMEDIATELY (no preloading)
        if (heroData.BackgroundImageURL && heroImageEl) {
            heroImageEl.style.backgroundImage = `url('${heroData.BackgroundImageURL}')`;
            console.log('✅ Hero image applied:', heroData.BackgroundImageURL);
        }
    }
    */

    // --- OPTIMIZED: LOAD SCHEDULE (WITH CACHE) ---
    async function loadSchedule() {
        try {
            // Try cache first
            const cachedGames = Cache.get('tomsox_schedule');
            if (cachedGames) {
                updateHero(cachedGames);
                updateTicker(cachedGames);
                return;
            }

            // Fetch from Google Sheets
            const response = await fetch(CONFIG.scheduleCsvUrl);
            if (!response.ok) {
                console.warn(`Schedule fetch failed: ${response.status}`);
                showComingSoonMessages();
                return;
            }
            
            const csvText = await response.text();
            const allGames = Utils.parseCsv(csvText);
            const validGames = allGames.filter(game => Utils.parseDate(game.Date));
            
            if (validGames.length === 0) {
                console.log('No games found - showing coming soon messages');
                showComingSoonMessages();
                return;
            }
            
            // Cache the schedule data
            Cache.set('tomsox_schedule', validGames);
            
            updateHero(validGames);
            updateTicker(validGames);
            
            console.log('✅ Schedule loaded and cached');
            
        } catch (error) {
            console.error('Schedule error:', error);
            showComingSoonMessages();
        }
    }

    function showComingSoonMessages() {
        const currentYear = new Date().getFullYear();
        
        if (nextGameInfoEl) {
            nextGameInfoEl.textContent = `2026 Schedule Coming Soon`;
        }
        
        if (tickerTrackEl) {
            tickerTrackEl.innerHTML = `
                <div class="ticker-coming-soon" style="
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                    font-family: 'Open Sans', sans-serif;
                ">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📅</div>
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 8px; color: #333;">
                        2026 Season Schedule Coming Soon!
                    </div>
                    <div style="font-size: 0.95rem; line-height: 1.5;">
                        We're finalizing our game schedule for the upcoming season.<br>
                        Check back soon or follow us on social media for updates!
                    </div>
                </div>
            `;
        }
        
        if (heroStatsEl) {
            heroStatsEl.innerHTML = `
                <div class="stat-item"><span class="stat-value">0-0</span><span class="stat-label">Record</span></div>
                <div class="stat-item"><span class="stat-value">.000</span><span class="stat-label">Win %</span></div>
                <div class="stat-item"><span class="stat-value">0</span><span class="stat-label">Games Played</span></div>`;
        }
    }

    function updateHero(games) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextGame = games.find(game => {
            const gameDate = Utils.parseDate(game.Date);
            const status = (game.Status || '').toUpperCase();
            return gameDate && gameDate >= today && status !== 'CANCELLED' && status !== 'POSTPONED';
        });
        
        if (nextGame) {
            const gameDate = Utils.parseDate(nextGame.Date);
            const isHome = (nextGame.IsHomeGame || '').toUpperCase() === 'TRUE';
            const opponent = nextGame.OpponentName || 'TBD';
            const time = nextGame.Time || 'TBD';
            const location = isHome ? `vs ${opponent}` : `@ ${opponent}`;
            const formattedDate = Utils.formatDate(gameDate);
            
            if (gameDate.toDateString() === today.toDateString()) {
                nextGameInfoEl.textContent = `TODAY ${formattedDate} ${time} - ${location}`;
            } else {
                nextGameInfoEl.textContent = `${Utils.getDayOfWeek(gameDate)} ${formattedDate} ${time} - ${location}`;
            }
        }
        
        if (!heroStatsEl) return;
        
        const finalGames = games.filter(g => (g.Status || '').toUpperCase() === 'FINAL');
        let wins = 0, losses = 0;
        
        finalGames.forEach(game => {
            const tsScore = parseInt(game.TomSoxScore, 10);
            const opScore = parseInt(game.OpponentScore, 10);
            if (!isNaN(tsScore) && !isNaN(opScore)) {
                if (tsScore > opScore) wins++;
                else if (tsScore < opScore) losses++;
            }
        });
        
        const total = wins + losses;
        const winPct = total > 0 ? (wins / total).toFixed(3).substring(1) : '.000';
        
        heroStatsEl.innerHTML = `
            <div class="stat-item"><span class="stat-value">${wins}-${losses}</span><span class="stat-label">Record</span></div>
            <div class="stat-item"><span class="stat-value">${winPct}</span><span class="stat-label">Win %</span></div>
            <div class="stat-item"><span class="stat-value">${total}</span><span class="stat-label">Games Played</span></div>`;
    }

    function updateTicker(games) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const allPastGames = games
            .filter(g => Utils.parseDate(g.Date) < today && (g.Status || '').toUpperCase() === 'FINAL')
            .sort((a,b) => Utils.parseDate(b.Date) - Utils.parseDate(a.Date));
            
        const allFutureGames = games
            .filter(g => Utils.parseDate(g.Date) >= today)
            .sort((a,b) => Utils.parseDate(a.Date) - Utils.parseDate(b.Date));
        
        const maxPastGames = Math.min(3, allPastGames.length);
        const pastGames = allPastGames.slice(0, maxPastGames);
        const neededFutureGames = 6 - maxPastGames;
        const futureGames = allFutureGames.slice(0, neededFutureGames);
            
        const tickerGames = [...pastGames.reverse(), ...futureGames];
            
        if (tickerGames.length === 0) {
            showComingSoonMessages();
            return;
        }
            
        tickerTrackEl.innerHTML = tickerGames.map(createGameCard).join('');
    }

    function createGameCard(game) {
        const isHome = (game.IsHomeGame || '').toUpperCase() === 'TRUE';
        const opponent = game.OpponentName || 'TBD';
        const opponentLogo = game.OpponentLogoURL || 'https://via.placeholder.com/60';
        const leftLogo = isHome ? CONFIG.tomSoxLogoUrl : opponentLogo;
        const rightLogo = isHome ? opponentLogo : CONFIG.tomSoxLogoUrl;
        const gameDate = Utils.parseDate(game.Date);
        const dayOfWeek = Utils.getDayOfWeek(gameDate);
        const dateString = Utils.formatDate(gameDate);
        const location = game.Location || 'TBD';
        
        // ONLY CHANGE: Use OpponentCity column, fallback to first word of opponent name
        const cityName = game.OpponentCity || opponent.split(' ')[0];
        const locationStringFull = isHome ? `vs ${opponent}` : `@ ${opponent}`;
        const locationStringShort = isHome ? `vs ${cityName}` : `@ ${cityName}`;
        
        const status = (game.Status || '').toUpperCase();
        const cardUrl = game.GameLink || '/schedule';
        
        // Add home-game class for styling
        const homeGameClass = isHome ? ' home-game' : '';
        
        let bottomHTML = '';

        if (status === 'POSTPONED') {
            const rescheduledText = game.RescheduledDate ? `Rescheduled: ${game.RescheduledDate}` : 'Postponed';
            bottomHTML = `<div class="card-bottom postponed">${rescheduledText}</div>`;
        } else if (status === 'CANCELLED') {
            bottomHTML = `<div class="card-bottom cancelled">Cancelled</div>`;
        } else if (status === 'FINAL') {
            const tsScore = parseInt(game.TomSoxScore, 10);
            const opScore = parseInt(game.OpponentScore, 10);
            if (!isNaN(tsScore) && !isNaN(opScore)) {
                let resultClass = 'tie', resultLabel = 'T';
                if (tsScore > opScore) { resultClass = 'win'; resultLabel = 'W'; }
                else if (tsScore < opScore) { resultClass = 'loss'; resultLabel = 'L'; }
                bottomHTML = `<div class="card-bottom final"><span class="result-badge-simple ${resultClass}">${resultLabel}</span><span class="score-text">${tsScore} - ${opScore}</span></div>`;
            } else {
                bottomHTML = `<div class="card-bottom final">Final</div>`;
            }
        } else {
            bottomHTML = `<div class="card-bottom upcoming">${game.Time || 'TBD'}</div>`;
        }

        return `
            <a href="${cardUrl}" target="_blank" rel="noopener noreferrer" class="ticker-game-card${homeGameClass}">
                <div class="card-top">
                    <img src="${leftLogo}" class="card-logo" alt="" loading="lazy">
                    <div class="card-details">
                        <div class="card-day">${dayOfWeek}</div>
                        <div class="card-date-loc">${dateString}</div>
                        <div class="card-date-loc">
                            <span class="card-opponent-full">${locationStringFull}</span>
                            <span class="card-opponent-short">${locationStringShort}</span>
                        </div>
                    </div>
                    <img src="${rightLogo}" class="card-logo" alt="" loading="lazy">
                </div>
                ${bottomHTML}
            </a>
        `;
    }

    // --- OPTIMIZED: IMMEDIATE INITIALIZATION (NO DELAY) ---
    async function initialize() {
        console.log('🏐 Tom Sox v3.5 - Hero loading from HTML, Schedule from Google Sheets');
        
        // HERO CONTENT: Commented out - now loads from HTML directly
        // SCHEDULE: Still loads from Google Sheets
        Promise.all([
            // loadHeroContent(), // COMMENTED OUT - hero now in HTML
            loadSchedule()
        ]).then(() => {
            console.log('🏐 Tom Sox Complete');
        }).catch(error => {
            console.error('Tom Sox Error:', error);
        });
    }

    initialize();
}

// REMOVED: setTimeout delay - runs immediately on page load
TomSoxHomePage();


/* =========================================
   COUNTDOWN TIMER JAVASCRIPT - TOM SOX (FINAL FIX)
   Season Opener: Friday, May 29, 2026 at 7:00 PM
   FIX: Only seconds animate, days/minutes/hours stay still
   ========================================= */

function TomSoxCountdown() {
    // Target date: May 29, 2026 at 7:00 PM
    const targetDate = new Date('2026-05-29T19:00:00').getTime();
    
    // DOM elements
    const daysEl = document.getElementById('countdownDays');
    const hoursEl = document.getElementById('countdownHours');
    const minutesEl = document.getElementById('countdownMinutes');
    const secondsEl = document.getElementById('countdownSeconds');
    const gridEl = document.getElementById('countdownGrid');
    const expiredEl = document.getElementById('countdownExpired');
    
    // Check if elements exist
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.warn('Tom Sox Countdown: Required elements not found');
        return;
    }
    
    // Store last displayed values to detect actual changes
    let lastDays = '';
    let lastHours = '';
    let lastMinutes = '';
    let lastSeconds = '';
    
    // Pad numbers with leading zero
    function pad(num) {
        return num < 10 ? '0' + num : num;
    }
    
    // Update countdown display
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        // If countdown is finished
        if (distance < 0) {
            if (gridEl) gridEl.style.display = 'none';
            if (expiredEl) expiredEl.style.display = 'block';
            clearInterval(countdownInterval);
            console.log('Tom Sox Countdown: Season has started!');
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Get string values
        const daysStr = pad(days);
        const hoursStr = pad(hours);
        const minutesStr = pad(minutes);
        const secondsStr = pad(seconds);
        
        // Update ONLY if value actually changed
        if (daysStr !== lastDays) {
            updateElement(daysEl, daysStr);
            lastDays = daysStr;
        }
        
        if (hoursStr !== lastHours) {
            updateElement(hoursEl, hoursStr);
            lastHours = hoursStr;
        }
        
        if (minutesStr !== lastMinutes) {
            updateElement(minutesEl, minutesStr);
            lastMinutes = minutesStr;
        }
        
        if (secondsStr !== lastSeconds) {
            updateElement(secondsEl, secondsStr);
            lastSeconds = secondsStr;
        }
    }
    
    // Update individual element with fade effect
    function updateElement(element, newValue) {
        const currentValue = element.textContent;
        
        // First load (element has "--")
        if (currentValue === '--') {
            element.textContent = newValue;
            return;
        }
        
        // Apply smooth transition
        element.classList.add('updating');
        setTimeout(() => {
            element.textContent = newValue;
            element.classList.remove('updating');
        }, 150);
    }
    
    // Initialize countdown
    updateCountdown();
    
    // Update every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    console.log('🏐 Tom Sox Countdown: Initialized (Target: May 29, 2026 7:00 PM)');
}

// Initialize countdown when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TomSoxCountdown);
} else {
    TomSoxCountdown();
}
</script>
<script>
/*
  File: page.js
  Page: Home
  Section: All page-level JavaScript — banner, schedule ticker, countdown timer, photo gallery
  Last Updated: 2026-02-20
*/


/* ============================================
   GAME DAY BANNER
   Fetches banner data from Google Sheets CSV.
   Refreshes every 60 seconds.
   ============================================ */
(function() {
    const SHEET_BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSel5a7jlW41WyAERTJVyta-yh88PkFCqRIVq_37jeuWkDhedBkQ_PQVpkUo_Ke_zPPrjc5v4aN6_A6/pub?output=csv';
    const BANNER_GID     = '1448110381';
    const BASEBALL_ICON  = 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/68a0cb4363e2ad7b7d8af377.png';

    function parseBannerCsv(csvText) {
        const rows = csvText.trim().split(/\r?\n/);
        if (rows.length < 2) return null;

        const headers = rows[0].split(',').map(function(h) { return h.trim(); });
        const fields  = [];
        let current   = '';
        let inQuotes  = false;
        var raw = rows[1];

        for (var i = 0; i < raw.length; i++) {
            var ch = raw[i];
            if (ch === '"' && !inQuotes) {
                inQuotes = true;
            } else if (ch === '"' && inQuotes && raw[i + 1] === '"') {
                current += '"';
                i++;
            } else if (ch === '"' && inQuotes) {
                inQuotes = false;
            } else if (ch === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        fields.push(current.trim());

        return headers.reduce(function(obj, header, idx) {
            obj[header] = fields[idx] || '';
            return obj;
        }, {});
    }

    function isSafeUrl(url) {
        return url && (/^https?:\/\//.test(url) || url.charAt(0) === '/');
    }

    var bannerInterval = null;

    function fetchAndDisplayBanner() {
        var container = document.getElementById('gameDayBanner');
        if (!container) return;

        var iconImg = '<img src="' + BASEBALL_ICON + '" alt="Spinning Baseball" class="gameday-banner-icon">';

        fetch(SHEET_BASE_URL + '&gid=' + BANNER_GID)
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function(csvText) {
                if (!csvText || csvText.trim() === '') throw new Error('Empty CSV');
                var data = parseBannerCsv(csvText);
                if (!data) throw new Error('Could not parse banner CSV');

                var isActive = data.IsActive && data.IsActive.toUpperCase() === 'TRUE';

                if (isActive && data.Message) {
                    var messageSpan = '<span class="gameday-banner-text">' + data.Message + '</span>';
                    if (data.Link && isSafeUrl(data.Link)) {
                        container.innerHTML = '<a href="' + data.Link + '" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:30px;text-decoration:none;">' + iconImg + messageSpan + iconImg + '</a>';
                    } else {
                        container.innerHTML = iconImg + messageSpan + iconImg;
                    }
                    container.classList.add('active');
                } else {
                    container.innerHTML = '';
                    container.classList.remove('active');
                }
            })
            .catch(function(err) {
                console.error('Banner fetch error:', err);
                var container2 = document.getElementById('gameDayBanner');
                if (container2) container2.classList.remove('active');
            });
    }

    function initBanner() {
        fetchAndDisplayBanner();
        bannerInterval = setInterval(fetchAndDisplayBanner, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBanner);
    } else {
        initBanner();
    }
})();


/* ============================================
   SCHEDULE TICKER & HERO BADGE
   Loads game schedule from Google Sheets CSV.
   Populates the game ticker grid and next-game badge.
   Caches results in localStorage for 5 minutes.
   ============================================ */
function TomSoxHomePage() {

    var CONFIG = {
        scheduleCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSel5a7jlW41WyAERTJVyta-yh88PkFCqRIVq_37jeuWkDhedBkQ_PQVpkUo_Ke_zPPrjc5v4aN6_A6/pub?output=csv&gid=324326629',
        tomSoxLogoUrl:  'https://storage.googleapis.com/msgsndr/xPpGvlvaXWhYtIJUg0CZ/media/686c8a6a1ceb7bf881eb68c4.png',
        cacheDuration:  5 * 60 * 1000
    };

    /* --- Utilities --- */
    var Utils = {
        parseDate: function(str) {
            if (!str) return null;
            var parts = str.split('/');
            if (parts.length !== 3) return null;
            var m = parseInt(parts[0], 10);
            var d = parseInt(parts[1], 10);
            var y = parseInt(parts[2], 10);
            if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
            return new Date(y, m - 1, d);
        },

        formatDate: function(date) {
            if (!(date instanceof Date) || isNaN(date)) return '';
            return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
        },

        getDayOfWeek: function(date) {
            if (!(date instanceof Date) || isNaN(date)) return '';
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        },

        /* RFC-4180 compliant CSV parser — handles quoted fields with embedded commas */
        parseCsv: function(csvText) {
            var rows = csvText.trim().split(/\r?\n/);
            if (rows.length < 2) return [];

            var headerRow = rows.shift();
            var headers = this._splitCsvRow(headerRow).map(function(h) { return h.trim(); });
            headers[0] = headers[0].replace(/^\uFEFF/, '');

            var self = this;
            return rows.map(function(row) {
                var values = self._splitCsvRow(row);
                return headers.reduce(function(obj, header, i) {
                    obj[header] = (values[i] || '').trim();
                    return obj;
                }, {});
            });
        },

        _splitCsvRow: function(row) {
            var fields  = [];
            var current = '';
            var inQ     = false;
            for (var i = 0; i < row.length; i++) {
                var ch = row[i];
                if (ch === '"' && !inQ) {
                    inQ = true;
                } else if (ch === '"' && inQ && row[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (ch === '"' && inQ) {
                    inQ = false;
                } else if (ch === ',' && !inQ) {
                    fields.push(current);
                    current = '';
                } else {
                    current += ch;
                }
            }
            fields.push(current);
            return fields;
        }
    };

    /* --- Cache --- */
    var Cache = {
        get: function(key) {
            try {
                var raw = localStorage.getItem(key);
                if (!raw) return null;
                var item = JSON.parse(raw);
                if ((Date.now() - item.timestamp) < CONFIG.cacheDuration) return item.data;
                localStorage.removeItem(key);
                return null;
            } catch(e) { return null; }
        },
        set: function(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify({ data: data, timestamp: Date.now() }));
            } catch(e) {}
        }
    };

    /* --- DOM refs --- */
    var nextGameInfoEl  = document.getElementById('nextGameInfo');
    var heroStatsEl     = document.getElementById('heroStats');
    var tickerTrackEl   = document.getElementById('tickerTrack');

    if (!tickerTrackEl) {
        console.error('Tom Sox: tickerTrack element not found');
        return;
    }

    /* --- Schedule loading --- */
    function loadSchedule() {
        var cached = Cache.get('tomsox_schedule');
        if (cached) {
            updateHero(cached);
            updateTicker(cached);
            return Promise.resolve();
        }

        return fetch(CONFIG.scheduleCsvUrl)
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function(csvText) {
                var allGames   = Utils.parseCsv(csvText);
                var validGames = allGames.filter(function(g) { return Utils.parseDate(g.Date); });

                if (validGames.length === 0) {
                    showComingSoonMessages();
                    return;
                }

                Cache.set('tomsox_schedule', validGames);
                updateHero(validGames);
                updateTicker(validGames);
                console.log('⚾ Tom Sox: Schedule loaded');
            })
            .catch(function(err) {
                console.error('Tom Sox schedule error:', err);
                showComingSoonMessages();
            });
    }

    function showComingSoonMessages() {
        if (nextGameInfoEl) nextGameInfoEl.textContent = '2026 Schedule Coming Soon';

        if (tickerTrackEl) {
            tickerTrackEl.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#666;">'
                + '<div style="font-size:2rem;margin-bottom:10px;">📅</div>'
                + '<div style="font-size:1.2rem;font-weight:600;margin-bottom:8px;color:#333;">2026 Season Schedule Coming Soon!</div>'
                + '<div style="font-size:0.95rem;line-height:1.5;">We\'re finalizing our game schedule for the upcoming season.<br>Check back soon or follow us on social media for updates!</div>'
                + '</div>';
        }
    }

    function updateHero(games) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var nextGame = null;
        for (var i = 0; i < games.length; i++) {
            var g = games[i];
            var gDate  = Utils.parseDate(g.Date);
            var status = (g.Status || '').toUpperCase();
            if (gDate && gDate >= today && status !== 'CANCELLED' && status !== 'POSTPONED') {
                nextGame = g;
                break;
            }
        }

        if (nextGame && nextGameInfoEl) {
            var gd       = Utils.parseDate(nextGame.Date);
            var isHome   = (nextGame.IsHomeGame || '').toUpperCase() === 'TRUE';
            var opponent = nextGame.OpponentName || 'TBD';
            var location = isHome ? 'vs ' + opponent : '@ ' + opponent;
            var label    = gd.toDateString() === today.toDateString()
                ? 'TODAY'
                : Utils.getDayOfWeek(gd);

            nextGameInfoEl.textContent = label + ' ' + Utils.formatDate(gd) + ' ' + (nextGame.Time || 'TBD') + ' - ' + location;
        }

        if (!heroStatsEl) return;

        var wins = 0, losses = 0;
        games.forEach(function(g) {
            if ((g.Status || '').toUpperCase() !== 'FINAL') return;
            var ts = parseInt(g.TomSoxScore, 10);
            var op = parseInt(g.OpponentScore, 10);
            if (isNaN(ts) || isNaN(op)) return;
            if (ts > op) wins++;
            else if (ts < op) losses++;
        });

        var total  = wins + losses;
        var winPct = total > 0 ? (wins / total).toFixed(3).substring(1) : '.000';

        heroStatsEl.innerHTML =
            '<div class="stat-item"><span class="stat-value">' + wins + '-' + losses + '</span><span class="stat-label">Record</span></div>'
            + '<div class="stat-item"><span class="stat-value">' + winPct + '</span><span class="stat-label">Win %</span></div>'
            + '<div class="stat-item"><span class="stat-value">' + total + '</span><span class="stat-label">Games Played</span></div>';
    }

    function updateTicker(games) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var pastGames = games
            .filter(function(g) {
                return Utils.parseDate(g.Date) < today && (g.Status || '').toUpperCase() === 'FINAL';
            })
            .sort(function(a, b) { return Utils.parseDate(b.Date) - Utils.parseDate(a.Date); })
            .slice(0, 3)
            .reverse();

        var futureGames = games
            .filter(function(g) { return Utils.parseDate(g.Date) >= today; })
            .sort(function(a, b) { return Utils.parseDate(a.Date) - Utils.parseDate(b.Date); })
            .slice(0, 6 - pastGames.length);

        var tickerGames = pastGames.concat(futureGames);

        if (tickerGames.length === 0) {
            showComingSoonMessages();
            return;
        }

        tickerTrackEl.innerHTML = tickerGames.map(createGameCard).join('');
    }

    function createGameCard(game) {
        var isHome       = (game.IsHomeGame || '').toUpperCase() === 'TRUE';
        var opponent     = game.OpponentName || 'TBD';
        var opponentLogo = game.OpponentLogoURL || '';
        var leftLogo     = isHome ? CONFIG.tomSoxLogoUrl : opponentLogo;
        var rightLogo    = isHome ? opponentLogo : CONFIG.tomSoxLogoUrl;
        var gameDate     = Utils.parseDate(game.Date);
        var cityName     = game.OpponentCity || opponent.split(' ')[0];
        var locationFull = isHome ? 'vs ' + opponent : '@ ' + opponent;
        var locationShort= isHome ? 'vs ' + cityName  : '@ ' + cityName;
        var status       = (game.Status || '').toUpperCase();
        var cardUrl      = game.GameLink || '/schedule';
        var homeClass    = isHome ? ' home-game' : '';

        var leftAlt  = isHome ? 'Tom Sox logo'    : opponent + ' logo';
        var rightAlt = isHome ? opponent + ' logo' : 'Tom Sox logo';

        var bottomHTML = '';
        if (status === 'POSTPONED') {
            var reschedText = game.RescheduledDate ? 'Rescheduled: ' + game.RescheduledDate : 'Postponed';
            bottomHTML = '<div class="card-bottom postponed">' + reschedText + '</div>';
        } else if (status === 'CANCELLED') {
            bottomHTML = '<div class="card-bottom cancelled">Cancelled</div>';
        } else if (status === 'FINAL') {
            var ts = parseInt(game.TomSoxScore, 10);
            var op = parseInt(game.OpponentScore, 10);
            if (!isNaN(ts) && !isNaN(op)) {
                var rc = ts > op ? 'win' : (ts < op ? 'loss' : 'tie');
                var rl = ts > op ? 'W'   : (ts < op ? 'L'   : 'T');
                bottomHTML = '<div class="card-bottom final"><span class="result-badge-simple ' + rc + '">' + rl + '</span><span class="score-text">' + ts + ' - ' + op + '</span></div>';
            } else {
                bottomHTML = '<div class="card-bottom final">Final</div>';
            }
        } else {
            bottomHTML = '<div class="card-bottom upcoming">' + (game.Time || 'TBD') + '</div>';
        }

        return '<a href="' + cardUrl + '" target="_blank" rel="noopener noreferrer" class="ticker-game-card' + homeClass + '">'
            + '<div class="card-top">'
            + (leftLogo  ? '<img src="' + leftLogo  + '" class="card-logo" alt="' + leftAlt  + '" loading="lazy">' : '')
            + '<div class="card-details">'
            + '<div class="card-day">' + Utils.getDayOfWeek(gameDate) + '</div>'
            + '<div class="card-date-loc">' + Utils.formatDate(gameDate) + '</div>'
            + '<div class="card-date-loc">'
            + '<span class="card-opponent-full">'  + locationFull  + '</span>'
            + '<span class="card-opponent-short">' + locationShort + '</span>'
            + '</div>'
            + '</div>'
            + (rightLogo ? '<img src="' + rightLogo + '" class="card-logo" alt="' + rightAlt + '" loading="lazy">' : '')
            + '</div>'
            + bottomHTML
            + '</a>';
    }

    loadSchedule();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TomSoxHomePage);
} else {
    TomSoxHomePage();
}


/* ============================================
   COUNTDOWN TIMER
   Counts down to the 2026 season opener.
   Target: Friday, May 29, 2026 at 7:00 PM ET
   ============================================ */
function TomSoxCountdown() {
    /* Explicit Eastern Daylight Time offset (-04:00) for the season opener */
    var targetDate = new Date('2026-05-29T19:00:00-04:00').getTime();

    var daysEl    = document.getElementById('countdownDays');
    var hoursEl   = document.getElementById('countdownHours');
    var minutesEl = document.getElementById('countdownMinutes');
    var secondsEl = document.getElementById('countdownSeconds');
    var gridEl    = document.getElementById('countdownGrid');
    var expiredEl = document.getElementById('countdownExpired');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    var lastDays = '', lastHours = '', lastMinutes = '', lastSeconds = '';

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function updateElement(el, val) {
        if (el.textContent === '--') { el.textContent = val; return; }
        el.classList.add('updating');
        setTimeout(function() {
            el.textContent = val;
            el.classList.remove('updating');
        }, 150);
    }

    function updateCountdown() {
        var distance = targetDate - Date.now();

        if (distance < 0) {
            if (gridEl)    gridEl.style.display    = 'none';
            if (expiredEl) expiredEl.style.display = 'block';
            clearInterval(interval);
            return;
        }

        var days    = Math.floor(distance / 86400000);
        var hours   = Math.floor((distance % 86400000) / 3600000);
        var minutes = Math.floor((distance % 3600000)  / 60000);
        var seconds = Math.floor((distance % 60000)    / 1000);

        var ds = pad(days), hs = pad(hours), ms = pad(minutes), ss = pad(seconds);

        if (ds !== lastDays)    { updateElement(daysEl,    ds); lastDays    = ds; }
        if (hs !== lastHours)   { updateElement(hoursEl,   hs); lastHours   = hs; }
        if (ms !== lastMinutes) { updateElement(minutesEl, ms); lastMinutes = ms; }
        if (ss !== lastSeconds) { updateElement(secondsEl, ss); lastSeconds = ss; }
    }

    updateCountdown();
    var interval = setInterval(updateCountdown, 1000);

    console.log('⚾ Tom Sox Countdown: Initialized (Target: May 29, 2026 7:00 PM ET)');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TomSoxCountdown);
} else {
    TomSoxCountdown();
}


/* ============================================
   PHOTO GALLERY
   3D carousel → grid modal → lightbox viewer.
   All data fed from Google Sheets CSV.
   ============================================ */
(function() {
    if (window.photoGalleryInitialized) return;
    window.photoGalleryInitialized = true;

    var SHEET_BASE_URL  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSel5a7jlW41WyAERTJVyta-yh88PkFCqRIVq_37jeuWkDhedBkQ_PQVpkUo_Ke_zPPrjc5v4aN6_A6/pub?output=csv';
    var GALLERIES_GID   = '0';
    var PHOTOS_GID      = '33887480';

    /* RFC-4180 CSV parser */
    function csvToObjects(csvText) {
        var lines = csvText.trim().split(/\r?\n/);
        if (lines.length < 2) return [];
        var headers = splitRow(lines.shift()).map(function(h) { return h.trim(); });
        return lines.map(function(line) {
            var values = splitRow(line);
            return headers.reduce(function(obj, header, i) {
                var v = (values[i] || '').trim();
                if (v.charAt(0) === '"' && v.charAt(v.length - 1) === '"') {
                    v = v.slice(1, -1).replace(/""/g, '"');
                }
                obj[header] = v;
                return obj;
            }, {});
        });
    }

    function splitRow(row) {
        var fields = [], current = '', inQ = false;
        for (var i = 0; i < row.length; i++) {
            var ch = row[i];
            if (ch === '"' && !inQ) {
                inQ = true;
            } else if (ch === '"' && inQ && row[i + 1] === '"') {
                current += '"'; i++;
            } else if (ch === '"' && inQ) {
                inQ = false;
            } else if (ch === ',' && !inQ) {
                fields.push(current); current = '';
            } else {
                current += ch;
            }
        }
        fields.push(current);
        return fields;
    }

    function initializeGallery() {
        var gallerySection = document.querySelector('.photo-gallery-section');
        if (!gallerySection) return;
        var carousel = gallerySection.querySelector('.carousel');
        if (!carousel) return;

        var galleriesUrl = SHEET_BASE_URL + '&gid=' + GALLERIES_GID;
        var photosUrl    = SHEET_BASE_URL + '&gid=' + PHOTOS_GID;

        Promise.all([fetch(galleriesUrl), fetch(photosUrl)])
            .then(function(responses) {
                if (!responses[0].ok || !responses[1].ok) throw new Error('Network error');
                return Promise.all([responses[0].text(), responses[1].text()]);
            })
            .then(function(texts) {
                var galleryData = csvToObjects(texts[0]);
                var photoData   = csvToObjects(texts[1]);

                if (galleryData.length === 0) throw new Error('No gallery data found');

                var galleries   = {};
                var carouselHTML = '';

                galleryData.forEach(function(item) {
                    if (!item.galleryID || !item.coverImageURL) return;
                    var title = item.title || 'Gallery';
                    var sub   = item.subtitle || '';
                    carouselHTML += '<div class="carousel-item">'
                        + '<a href="#" data-gallery-id="' + item.galleryID + '">'
                        + '<img src="' + item.coverImageURL + '" alt="' + title + ' cover photo">'
                        + '<div class="carousel-item-title">' + title + (sub ? '<br>' + sub : '') + '</div>'
                        + '</a></div>';

                    galleries[item.galleryID] = {
                        title:  title + (sub ? ' (' + sub + ')' : ''),
                        images: photoData
                            .filter(function(p) { return p.galleryID === item.galleryID && p.imageURL; })
                            .map(function(p) { return p.imageURL; })
                    };
                });

                if (!carouselHTML) throw new Error('No valid gallery items');

                carousel.innerHTML = carouselHTML;
                setupGalleryLogic(galleries, gallerySection);
            })
            .catch(function(err) {
                console.error('Photo Gallery Error:', err);
                carousel.innerHTML = '<p style="color:#84BD00;text-align:center;padding:20px;"><strong>Gallery unavailable.</strong> Please try again later.</p>';
            });
    }

    function setupGalleryLogic(galleries, gallerySection) {
        var modalOverlay   = gallerySection.querySelector('.modal-overlay');
        var lightboxOverlay= gallerySection.querySelector('.lightbox-overlay');

        if (!modalOverlay || !lightboxOverlay) {
            console.error('Gallery: modal/lightbox elements not found');
            return;
        }

        /* Move overlays to body for correct stacking context */
        document.body.appendChild(modalOverlay);
        document.body.appendChild(lightboxOverlay);

        var carousel    = gallerySection.querySelector('.carousel');
        var items       = gallerySection.querySelectorAll('.carousel-item');
        var prevBtn     = gallerySection.querySelector('#gallery-prev-btn');
        var nextBtn     = gallerySection.querySelector('#gallery-next-btn');

        var modalCloseBtn  = modalOverlay.querySelector('.modal-close-btn');
        var modalTitle     = modalOverlay.querySelector('.modal-gallery-title');
        var modalGrid      = modalOverlay.querySelector('.modal-grid');

        var lightboxImage    = lightboxOverlay.querySelector('.lightbox-image');
        var lightboxCloseBtn = lightboxOverlay.querySelector('.lightbox-close-btn');
        var lightboxNextBtn  = lightboxOverlay.querySelector('.lightbox-next-btn');
        var lightboxPrevBtn  = lightboxOverlay.querySelector('.lightbox-prev-btn');

        var selectedIndex        = 0;
        var currentImages        = [];
        var currentLightboxIndex = 0;
        var totalItems           = items.length;

        if (totalItems === 0) return;

        var angle = 360 / totalItems;

        function getRadius() {
            var w = window.innerWidth;
            if (w <= 480) return 400;
            if (w <= 768) return 500;
            return 750;
        }

        function setupCarousel() {
            var r = getRadius();
            items.forEach(function(item, i) {
                item.style.transform = 'rotateY(' + (i * angle) + 'deg) translateZ(' + r + 'px)';
            });
            updateCarouselState();
        }

        function updateCarouselState() {
            var r = getRadius();
            carousel.style.transform = 'translateZ(-' + r + 'px) rotateY(' + (-selectedIndex * angle) + 'deg)';
            items.forEach(function(item, i) {
                item.classList.toggle('is-selected', i === selectedIndex);
            });
        }

        function rotate(dir) {
            selectedIndex = (selectedIndex + dir + totalItems) % totalItems;
            updateCarouselState();
        }

        nextBtn.addEventListener('click', function() { rotate(1); });
        prevBtn.addEventListener('click', function() { rotate(-1); });

        /* --- Modal --- */
        function openModal(data) {
            if (!data) return;
            document.documentElement.classList.add('gallery-is-open');
            document.body.classList.add('gallery-is-open');
            modalTitle.textContent = data.title;
            modalGrid.innerHTML    = '';
            currentImages          = data.images;

            if (currentImages.length === 0) {
                modalGrid.innerHTML = '<p style="color:#fff;">No photos found.</p>';
            } else {
                currentImages.forEach(function(src, idx) {
                    var img         = document.createElement('img');
                    img.src         = src;
                    img.loading     = 'lazy';
                    img.alt         = 'Gallery photo ' + (idx + 1);
                    img.dataset.index = String(idx);
                    modalGrid.appendChild(img);
                });
            }

            modalOverlay.classList.add('active');
            modalCloseBtn.focus();
        }

        function closeModal() {
            document.documentElement.classList.remove('gallery-is-open');
            document.body.classList.remove('gallery-is-open');
            modalOverlay.classList.remove('active');
        }

        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });

        /* --- Lightbox --- */
        function showLightboxImage(idx) {
            currentLightboxIndex    = idx;
            lightboxImage.src       = currentImages[currentLightboxIndex];
            lightboxImage.alt       = 'Gallery photo ' + (currentLightboxIndex + 1) + ' of ' + currentImages.length;
            lightboxOverlay.classList.add('active');
            lightboxCloseBtn.focus();
        }

        function closeLightbox() {
            lightboxOverlay.classList.remove('active');
        }

        function showNext() {
            currentLightboxIndex = (currentLightboxIndex + 1) % currentImages.length;
            lightboxImage.src    = currentImages[currentLightboxIndex];
            lightboxImage.alt    = 'Gallery photo ' + (currentLightboxIndex + 1) + ' of ' + currentImages.length;
        }

        function showPrev() {
            currentLightboxIndex = (currentLightboxIndex - 1 + currentImages.length) % currentImages.length;
            lightboxImage.src    = currentImages[currentLightboxIndex];
            lightboxImage.alt    = 'Gallery photo ' + (currentLightboxIndex + 1) + ' of ' + currentImages.length;
        }

        /* Open modal on carousel item click */
        items.forEach(function(item) {
            var link = item.querySelector('a');
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var gid = link.dataset.galleryId;
                if (galleries[gid]) openModal(galleries[gid]);
            });
        });

        /* Open lightbox from modal grid — use data-index to avoid URL resolution mismatch */
        modalGrid.addEventListener('click', function(e) {
            if (e.target.tagName === 'IMG') {
                var idx = parseInt(e.target.dataset.index, 10);
                if (!isNaN(idx)) showLightboxImage(idx);
            }
        });

        lightboxCloseBtn.addEventListener('click', closeLightbox);
        lightboxNextBtn.addEventListener('click', showNext);
        lightboxPrevBtn.addEventListener('click', showPrev);

        /* Lightbox overlay click to close */
        lightboxOverlay.addEventListener('click', function(e) {
            if (e.target === lightboxOverlay) closeLightbox();
        });

        /* Keyboard navigation */
        document.addEventListener('keydown', function(e) {
            if (lightboxOverlay.classList.contains('active')) {
                if (e.key === 'ArrowRight') showNext();
                if (e.key === 'ArrowLeft')  showPrev();
                if (e.key === 'Escape')     closeLightbox();
            } else if (modalOverlay.classList.contains('active') && e.key === 'Escape') {
                closeModal();
            }
        });

        /* Debounced resize handler */
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setupCarousel, 150);
        });

        setupCarousel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGallery);
    } else {
        initializeGallery();
    }
})();
</script>

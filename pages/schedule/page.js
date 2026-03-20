<script>
/*
  File: page.js
  Page: Schedule
  Last Updated: 2026-03-08
*/

/* =========================================================
   TOM SOX SCHEDULE — PAGE JS
   ========================================================= */

const SCHEDULE_CONFIG = {
    SHEET_ID: '2PACX-1vSel5a7jlW41WyAERTJVyta-yh88PkFCqRIVq_37jeuWkDhedBkQ_PQVpkUo_Ke_zPPrjc5v4aN6_A6',
    SHEET_GID: '324326629'
};

/* =========================================================
   PRINT HANDLER
   ========================================================= */

function triggerCleanPrint() {
    const chat = document.querySelector('chat-widget')
        || document.querySelector('.chat-widget')
        || document.querySelector('[id*="chat"]');
    if (chat) {
        chat.style.display = 'none';
        window.print();
        setTimeout(() => { chat.style.display = ''; }, 1000);
    } else {
        window.print();
    }
}

/* =========================================================
   CSV PARSING — RFC-4180 COMPLIANT
   ========================================================= */

function parseCsvRow(row) {
    const fields = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (inQuotes) {
            if (ch === '"' && row[i + 1] === '"') {
                field += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                field += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                fields.push(field.trim());
                field = '';
            } else {
                field += ch;
            }
        }
    }
    fields.push(field.trim());
    return fields;
}

function parseCsv(csvText) {
    const lines = csvText.trim().replace(/^\uFEFF/, '').split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = parseCsvRow(lines[0]);
    return lines.slice(1).map(line => {
        if (!line || !line.trim()) return null;
        const values = parseCsvRow(line);
        return headers.reduce((obj, header, i) => {
            obj[header] = (values[i] !== undefined ? values[i] : '').trim();
            return obj;
        }, {});
    }).filter(Boolean);
}

/* =========================================================
   DATE PARSING
   ========================================================= */

function parseGameDate(dateStr, timeStr) {
    if (!dateStr) return null;
    const dateParts = dateStr.split('/');
    if (dateParts.length < 3) return null;
    let hours = 0, minutes = 0;
    if (timeStr) {
        let [timeValue, modifier] = timeStr.split(' ');
        [hours, minutes] = timeValue.split(':').map(Number);
        if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return new Date(dateParts[2], dateParts[0] - 1, dateParts[1], hours, minutes || 0);
}

/* Formats Date object as "Fri, June 6" */
function formatDisplayDate(dateObj) {
    if (!dateObj) return '';
    return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric'
    });
}

/* =========================================================
   GAME RESULT LOGIC
   ========================================================= */

function getGameResult(game) {
    const status = (game.Status || '').toUpperCase();
    if (status === 'FORFEIT - WIN') return 'W';
    if (status === 'FORFEIT - LOSS') return 'L';
    if (status === 'FINAL' && game.TomSoxScore && game.OpponentScore) {
        return parseInt(game.TomSoxScore) > parseInt(game.OpponentScore) ? 'W' : 'L';
    }
    return null;
}

function isGameCompleted(game) {
    return getGameResult(game) !== null;
}

function isGameUpcoming(game, today) {
    const d = parseGameDate(game.Date, game.Time);
    return d && d >= today;
}

/* =========================================================
   STATS CALCULATION
   ========================================================= */

function calculateStreak(games) {
    const completed = games.filter(g => getGameResult(g) !== null);
    if (!completed.length) return '--';
    const lastResult = getGameResult(completed[completed.length - 1]);
    let count = 0;
    for (let i = completed.length - 1; i >= 0; i--) {
        if (getGameResult(completed[i]) === lastResult) {
            count++;
        } else {
            break;
        }
    }
    return lastResult + count;
}

function calculateAndDisplayStats(games) {
    const updateStat = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    const completed = games.filter(g => getGameResult(g) !== null);
    if (!completed.length) return;

    let wins = 0, losses = 0, hW = 0, hL = 0, aW = 0, aL = 0;
    completed.forEach(g => {
        const isHome = (g.IsHomeGame || '').toUpperCase() === 'TRUE';
        if (getGameResult(g) === 'W') {
            wins++;
            isHome ? hW++ : aW++;
        } else {
            losses++;
            isHome ? hL++ : aL++;
        }
    });

    const total = wins + losses;
    const pct = total > 0 ? (wins / total).toFixed(3).replace(/^0/, '') : '.000';

    updateStat('stat-overall', `${wins}-${losses}`);
    updateStat('stat-pct', pct);
    updateStat('stat-streak', calculateStreak(games));
    updateStat('stat-home', `${hW}-${hL}`);
    updateStat('stat-away', `${aW}-${aL}`);
}

/* =========================================================
   MEDIA LINKS — SVG ICONS
   ========================================================= */

const ICONS = {
    article: `<svg fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" aria-hidden="true"><path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`,
    stats: `<svg fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" aria-hidden="true"><path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/></svg>`,
    play: `<svg fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/></svg>`,
    mic: `<svg fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" aria-hidden="true"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/><path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/></svg>`,
    clipboard: `<svg fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" aria-hidden="true"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>`,
    ticket: `<svg fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" aria-hidden="true"><path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5zm4 1a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5zm0 5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5zm0-3a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5z"/></svg>`
};

function buildMediaLinksHTML(game) {
    const links = [];

    if (game.RecapLink) {
        links.push(`<a href="${game.RecapLink}" target="_blank" rel="noopener" class="media-link media-link-recap">${ICONS.article} Recap</a>`);
    }
    if (game.BoxScoreLink) {
        links.push(`<a href="${game.BoxScoreLink}" target="_blank" rel="noopener" class="media-link media-link-boxscore">${ICONS.stats} Box Score</a>`);
    }
    if (game.YouTubeLink) {
        links.push(`<a href="${game.YouTubeLink}" target="_blank" rel="noopener" class="media-link media-link-watch">${ICONS.play} Watch</a>`);
    }
    if (game.ListenLiveLink) {
        links.push(`<a href="${game.ListenLiveLink}" target="_blank" rel="noopener" class="media-link media-link-listen">${ICONS.mic} Listen Live</a>`);
    }
    if (game.GameNotesLink) {
        links.push(`<a href="${game.GameNotesLink}" target="_blank" rel="noopener" class="media-link media-link-notes">${ICONS.clipboard} Game Notes</a>`);
    }
    if (game.GameLink) {
        links.push(`<a href="${game.GameLink}" target="_blank" rel="noopener" class="media-link media-link-info">${ICONS.ticket} Info / Tickets</a>`);
    }

    if (!links.length) return '';
    return `<div class="game-media-links">${links.join('')}</div>`;
}

/* =========================================================
   ICS CALENDAR GENERATION
   ========================================================= */

function generateICSContent(games, today) {
    const upcoming = games.filter(function(g) {
        var d = parseGameDate(g.Date, g.Time);
        return d && d >= today;
    });
    if (!upcoming.length) return null;

    function pad(n) { return String(n).padStart(2, '0'); }
    function toICSDate(dateObj) {
        return '' + dateObj.getFullYear() + pad(dateObj.getMonth() + 1) + pad(dateObj.getDate()) + 'T' + pad(dateObj.getHours()) + pad(dateObj.getMinutes()) + '00';
    }

    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tom Sox//Schedule//EN', 'CALSCALE:GREGORIAN'];

    upcoming.forEach(function(g) {
        var start = parseGameDate(g.Date, g.Time);
        if (!start) return;
        var end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
        var isHome = (g.IsHomeGame || '').toUpperCase() === 'TRUE';
        var summary = 'Tom Sox ' + (isHome ? 'vs' : 'at') + ' ' + g.OpponentName;
        var location = g.LocationName ? g.LocationName.replace(/,/g, '\\,') : '';
        var uid = 'tomsox-' + g.Date.replace(/\//g, '') + '-' + g.OpponentName.replace(/\s+/g, '-').toLowerCase() + '@tomsox';

        lines.push('BEGIN:VEVENT');
        lines.push('DTSTART:' + toICSDate(start));
        lines.push('DTEND:' + toICSDate(end));
        lines.push('SUMMARY:' + summary);
        if (location) lines.push('LOCATION:' + location);
        lines.push('UID:' + uid);
        lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

/* =========================================================
   GAME CARD RENDERING
   ========================================================= */

function createGameItemHTML(game, isNextGame) {
    const isHome = (game.IsHomeGame || '').toUpperCase() === 'TRUE';
    const status = (game.Status || '').toUpperCase();

    /* --- Result badge --- */
    let resultHTML = '';
    if (status === 'POSTPONED') {
        resultHTML = `<div class="result-postponed">Postponed</div>`;
    } else if (status === 'CANCELLED') {
        resultHTML = `<div class="result-badge result-cancelled">Cancelled</div>`;
    } else if (status === 'FORFEIT - WIN') {
        resultHTML = `<div class="result-badge result-forfeit-win">Forfeit W</div>`;
    } else if (status === 'FORFEIT - LOSS') {
        resultHTML = `<div class="result-badge result-forfeit-loss">Forfeit L</div>`;
    } else if (status === 'FINAL' && game.TomSoxScore && game.OpponentScore) {
        const isWin = parseInt(game.TomSoxScore) > parseInt(game.OpponentScore);
        const label = isWin ? 'W' : 'L';
        resultHTML = `<div class="result-score${isWin ? '' : ' loss'}">${label} ${game.TomSoxScore}&#8211;${game.OpponentScore}</div>`;
    }

    /* --- Logo --- */
    const logoHTML = game.OpponentLogoURL && game.OpponentLogoURL.trim()
        ? `<div class="game-logo"><img src="${game.OpponentLogoURL}" alt="${game.OpponentName} logo" loading="lazy" width="56" height="56"></div>`
        : '';

    /* --- GameTitle badge --- */
    const gameTitleHTML = game.GameTitle && game.GameTitle.trim()
        ? `<div class="game-title-badge">${game.GameTitle}</div>`
        : '';

    /* --- Date display: MM/DD prefix + prefer Day column, fall back to formatted Date --- */
    const parsedDate = parseGameDate(game.Date, game.Time);
    const dateParts = game.Date ? game.Date.split('/') : [];
    const mmdd = dateParts.length >= 2 ? `${dateParts[0]}/${dateParts[1]}` : '';
    const mmddPrefix = mmdd ? `${mmdd} ` : '';
    const dateDisplay = game.Day && game.Day.trim()
        ? `${mmddPrefix}${game.Day}${game.Time ? ' &bull; ' + game.Time : ''}`
        : `${mmddPrefix}${formatDisplayDate(parsedDate)}${game.Time ? ' &bull; ' + game.Time : ''}`;

    /* --- Rescheduled note --- */
    const reschedHTML = (status === 'POSTPONED' && game.RescheduledDate && game.RescheduledDate.trim())
        ? `<div class="game-rescheduled-note">Rescheduled: ${game.RescheduledDate}</div>`
        : '';

    /* --- Venue line (below opponent name) --- */
    const venueName = (game.LocationName || '').trim();
    const venueURL = (game.LocationMapURL || '').trim();
    let venueHTML = '';
    if (venueName) {
        const pinIcon = `<svg fill="currentColor" viewBox="0 0 16 16" height="0.85em" width="0.85em" aria-hidden="true" style="flex-shrink:0;position:relative;top:-1px"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>`;
        const venueInner = venueURL
            ? `<a href="${venueURL}" target="_blank" rel="noopener" class="game-venue-link">${pinIcon} ${venueName}</a>`
            : `<span class="game-venue-text">${pinIcon} ${venueName}</span>`;
        venueHTML = `<div class="game-venue">${venueInner}</div>`;
    }

    /* --- Next Game banner --- */
    const nextGameBanner = isNextGame
        ? `<div class="next-game-banner">&#9654; Next Game</div>`
        : '';

    /* --- Media links --- */
    const mediaLinksHTML = buildMediaLinksHTML(game);

    const nextGameClass = isNextGame ? ' next-game' : '';
    const nextGameId = isNextGame ? ' id="next-game-marker"' : '';

    return `
        <div class="game-item ${isHome ? 'is-home' : 'is-away'}${nextGameClass}"${nextGameId} data-home="${isHome}" data-completed="${isGameCompleted(game)}">
            ${nextGameBanner}
            <div class="game-main-info">
                <div class="game-info-left">
                    ${logoHTML}
                    <div class="game-details">
                        ${gameTitleHTML}
                        <div class="game-date-line">${dateDisplay}</div>
                        <div class="game-opponent-info">
                            <span class="game-at-vs ${isHome ? 'vs' : 'at'}">${isHome ? 'VS' : 'AT'}</span>
                            <span class="game-opponent-name">${game.OpponentName}</span>
                        </div>
                        ${venueHTML}
                        ${reschedHTML}
                    </div>
                </div>
                <div class="game-result-col">${resultHTML}</div>
            </div>
            ${mediaLinksHTML}
        </div>`.trim();
}

/* =========================================================
   GROUP HEADER RENDERING
   ========================================================= */

function createGroupHeaderHTML(label) {
    return `
        <div class="game-group-header">
            <span class="game-group-header-text">${label}</span>
            <span class="game-group-header-line" aria-hidden="true"></span>
        </div>`.trim();
}

/* =========================================================
   FILTER LOGIC
   ========================================================= */

function applyFilter(filter, today) {
    const container = document.getElementById('game-list-container');
    const announcement = document.getElementById('filter-announcement');
    const items = container.querySelectorAll('.game-item');
    const headers = container.querySelectorAll('.game-group-header');
    let visible = 0;

    items.forEach(item => {
        const isHome = item.dataset.home === 'true';
        const isCompleted = item.dataset.completed === 'true';
        let show = true;

        if (filter === 'home') show = isHome;
        else if (filter === 'away') show = !isHome;
        else if (filter === 'upcoming') show = !isCompleted;
        else if (filter === 'results') show = isCompleted;

        item.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    /* Hide group headers that have no visible games below them */
    headers.forEach(header => {
        let sibling = header.nextElementSibling;
        let hasVisible = false;
        while (sibling && !sibling.classList.contains('game-group-header')) {
            if (sibling.classList.contains('game-item') && sibling.style.display !== 'none') {
                hasVisible = true;
                break;
            }
            sibling = sibling.nextElementSibling;
        }
        header.style.display = hasVisible ? '' : 'none';
    });

    /* Show empty state if nothing matches */
    let emptyState = container.querySelector('.schedule-empty-state');
    if (visible === 0) {
        if (!emptyState) {
            emptyState = document.createElement('p');
            emptyState.className = 'schedule-empty-state';
            container.appendChild(emptyState);
        }
        emptyState.textContent = 'No games match this filter.';
        emptyState.style.display = '';
    } else if (emptyState) {
        emptyState.style.display = 'none';
    }

    if (announcement) {
        announcement.textContent = `Showing ${visible} game${visible !== 1 ? 's' : ''}.`;
    }
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initSchedule() {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/e/${SCHEDULE_CONFIG.SHEET_ID}/pub?output=csv&gid=${SCHEDULE_CONFIG.SHEET_GID}`;

    const gameListContainer = document.getElementById('game-list-container');
    const jumpToGameBtn = document.getElementById('jump-to-game-btn');
    const printBtn = document.getElementById('print-schedule-btn');
    const calBtn = document.getElementById('add-to-calendar-btn');

    if (printBtn) {
        printBtn.addEventListener('click', triggerCleanPrint);
    }

    /* Filter bar wiring */
    const filterBtns = document.querySelectorAll('.filter-btn');
    let activeFilter = 'all';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            applyFilter(activeFilter, today);
        });
    });

    fetch(sheetUrl)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.text();
        })
        .then(csv => {
            const games = parseCsv(csv).filter(g => g.OpponentName && g.Date);

            if (!games.length) {
                gameListContainer.innerHTML = '<p class="schedule-empty-state">No games scheduled yet. Check back soon.</p>';
                return;
            }

            const sorted = games.sort((a, b) =>
                parseGameDate(a.Date, a.Time) - parseGameDate(b.Date, b.Time)
            );

            const nextIdx = sorted.findIndex(g => {
                const d = parseGameDate(g.Date, g.Time);
                return d && d >= today;
            });

            /* Build HTML — insert GroupHeader dividers where GroupHeader value changes */
            let html = '';
            let lastGroup = null;

            sorted.forEach((g, i) => {
                const groupLabel = g.GroupHeader && g.GroupHeader.trim() ? g.GroupHeader.trim() : null;
                if (groupLabel && groupLabel !== lastGroup) {
                    html += createGroupHeaderHTML(groupLabel);
                    lastGroup = groupLabel;
                }
                html += createGameItemHTML(g, i === nextIdx);
            });

            gameListContainer.innerHTML = html;
            calculateAndDisplayStats(sorted);

            if (calBtn) {
                const icsContent = generateICSContent(sorted, today);
                if (icsContent) {
                    calBtn.disabled = false;
                    calBtn.addEventListener('click', function() {
                        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'tomsox-schedule-2025.ics';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    });
                }
            }

            if (nextIdx !== -1 && jumpToGameBtn) {
                jumpToGameBtn.style.display = 'inline-flex';
                jumpToGameBtn.addEventListener('click', () => {
                    const marker = document.getElementById('next-game-marker');
                    if (marker) marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            }
        })
        .catch(() => {
            gameListContainer.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 30px;">Failed to load schedule. Please refresh the page.</p>';
        });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSchedule);
} else {
    initSchedule();
}
</script>

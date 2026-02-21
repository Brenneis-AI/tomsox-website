<script>
/*
  File: page.js
  Page: Schedule
  Last Updated: 2026-02-21
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
    if (!dateStr || !timeStr) return null;
    const dateParts = dateStr.split('/');
    if (dateParts.length < 3) return null;
    let [timeValue, modifier] = timeStr.split(' ');
    let [hours, minutes] = timeValue.split(':').map(Number);
    if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return new Date(dateParts[2], dateParts[0] - 1, dateParts[1], hours, minutes || 0);
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
   GAME CARD RENDERING
   ========================================================= */

function createGameItemHTML(game, index, nextGameIndex) {
    const isHome = (game.IsHomeGame || '').toUpperCase() === 'TRUE';
    const status = (game.Status || '').toUpperCase();
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

    const logoHTML = game.OpponentLogoURL && game.OpponentLogoURL.trim()
        ? `<div class="game-logo"><img src="${game.OpponentLogoURL}" alt="${game.OpponentName} logo" loading="lazy" width="60" height="60"></div>`
        : '';

    const gameTitleHTML = game.GameTitle
        ? `<div class="game-title">${game.GameTitle}</div>`
        : '';

    const isNextGame = index === nextGameIndex;

    return `
        <div class="game-item ${isHome ? 'is-home' : 'is-away'}"${isNextGame ? ' id="next-game-marker"' : ''}>
            <div class="game-main-info">
                <div class="game-info-left">
                    ${logoHTML}
                    <div class="game-details">
                        ${gameTitleHTML}
                        <div class="game-date-time">${game.Date} &bull; ${game.Time}</div>
                        <div class="game-opponent-info">
                            <span class="game-at-vs ${isHome ? 'vs' : 'at'}">${isHome ? 'VS' : 'AT'}</span>
                            <span class="game-opponent-name">${game.OpponentName}</span>
                        </div>
                    </div>
                </div>
                <div class="game-location">${game.LocationName || ''}</div>
                <div class="game-result">${resultHTML}</div>
            </div>
        </div>`.trim();
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initSchedule() {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/e/${SCHEDULE_CONFIG.SHEET_ID}/pub?output=csv&gid=${SCHEDULE_CONFIG.SHEET_GID}`;

    const gameListContainer = document.getElementById('game-list-container');
    const jumpToGameBtn = document.getElementById('jump-to-game-btn');
    const printBtn = document.getElementById('print-schedule-btn');

    if (printBtn) {
        printBtn.addEventListener('click', triggerCleanPrint);
    }

    fetch(sheetUrl)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.text();
        })
        .then(csv => {
            const games = parseCsv(csv).filter(g => g.OpponentName && g.Date);

            if (!games.length) {
                gameListContainer.innerHTML = '<p style="color: #777; text-align: center; padding: 30px;">No games scheduled yet. Check back soon.</p>';
                return;
            }

            const sorted = games.sort((a, b) =>
                parseGameDate(a.Date, a.Time) - parseGameDate(b.Date, b.Time)
            );

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextIdx = sorted.findIndex(g => {
                const d = parseGameDate(g.Date, g.Time);
                return d && d >= today;
            });

            gameListContainer.innerHTML = sorted
                .map((g, i) => createGameItemHTML(g, i, nextIdx))
                .join('');

            calculateAndDisplayStats(sorted);

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

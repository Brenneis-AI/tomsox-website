/*
  File: page.js
  Page: year-by-year-uc
  Section: Year by Year — per-season API stat leaders, dynamic game cards, box score expand/collapse
  Last Updated: 2026-02-28
*/
<script>
(function () {
    'use strict';

    /* =========================================================
       CONSTANTS
       ========================================================= */
    var API   = 'https://q7x4enwpcj.execute-api.us-east-1.amazonaws.com/prod';
    var YEARS = [2025, 2024, 2023, 2022, 2021, 2019, 2018, 2017, 2016, 2015];
    var TOP_N = 5;

    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    /* =========================================================
       STATE
       ========================================================= */
    var batting  = {};   // { year: [game rows] }
    var pitching = {};   // { year: [game rows] }
    var games    = {};   // { year: [game objects] }
    var loaded   = {};   // { year: true } — batting + pitching + games fetched
    var loading  = {};   // { year: true } — fetch in-flight guard

    /* =========================================================
       UTILITIES
       ========================================================= */

    function parseIP(ip) {
        var s = String(ip || 0);
        var parts = s.split('.');
        var inn  = parseInt(parts[0], 10) || 0;
        var outs = parseInt(parts[1], 10) || 0;
        return inn * 3 + outs;
    }

    function formatIP(totalOuts) {
        return Math.floor(totalOuts / 3) + '.' + (totalOuts % 3);
    }

    function fmtAvg(h, ab) {
        if (!ab || ab < 1) return '.000';
        return (h / ab).toFixed(3).replace(/^0\./, '.');
    }

    function fmtERA(er, totalOuts) {
        if (!totalOuts || totalOuts < 1) return '-.--';
        return (er / totalOuts * 27).toFixed(2);
    }

    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatGameDate(dateStr) {
        if (!dateStr) return '';
        var parts = dateStr.split('-');
        if (parts.length < 3) return dateStr;
        var month = MONTHS[parseInt(parts[1], 10) - 1] || parts[1];
        var day   = parseInt(parts[2], 10);
        return month + ' ' + day;
    }

    /* =========================================================
       TEAM IDENTIFICATION
       ========================================================= */

    function isTomSox(team) {
        return team === 'Charlottesville TomSox' || team === 'Charlottesville Tom Sox' || team === 'TomSox';
    }

    /* =========================================================
       DATA FETCHING
       ========================================================= */

    function safeJson(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }

    function fetchYear(year) {
        if (loaded[year] || loading[year]) return Promise.resolve();
        loading[year] = true;
        return Promise.all([
            fetch(API + '/batting?year='  + year + '&season_type=Summer').then(safeJson).catch(function () { return []; }),
            fetch(API + '/pitching?year=' + year + '&season_type=Summer').then(safeJson).catch(function () { return []; }),
            fetch(API + '/games?year='    + year).then(safeJson).catch(function () { return []; })
        ]).then(function (results) {
            batting[year]  = Array.isArray(results[0]) ? results[0] : [];
            pitching[year] = Array.isArray(results[1]) ? results[1] : [];
            var rawGames   = Array.isArray(results[2]) ? results[2] : [];
            rawGames.sort(function (a, b) {
                return a.game_date < b.game_date ? -1 : a.game_date > b.game_date ? 1 : 0;
            });
            games[year]  = rawGames;
            loaded[year] = true;
        }).catch(function () {
            batting[year]  = [];
            pitching[year] = [];
            games[year]    = [];
            loaded[year]   = true;
        });
    }

    /* =========================================================
       AGGREGATION
       ========================================================= */

    function aggBatting(year) {
        var map = {};
        var rows = batting[year] || [];
        rows.forEach(function (row) {
            if (!row.first_name || !row.last_name) return;
            var key = row.first_name + '|' + row.last_name;
            if (!map[key]) {
                map[key] = { name: row.first_name + ' ' + row.last_name, ab: 0, h: 0, hr: 0, rbi: 0, sb: 0 };
            }
            var p = map[key];
            p.ab  += (+row.ab  || 0);
            p.h   += (+row.h   || 0);
            p.hr  += (+row.hr  || 0);
            p.rbi += (+row.rbi || 0);
            p.sb  += (+row.sb  || 0);
        });
        return Object.values(map).map(function (p) {
            return Object.assign({}, p, { avg: p.ab > 0 ? p.h / p.ab : 0 });
        });
    }

    function aggPitching(year) {
        var map = {};
        var rows = pitching[year] || [];
        rows.forEach(function (row) {
            if (!row.first_name || !row.last_name) return;
            var key = row.first_name + '|' + row.last_name;
            if (!map[key]) {
                map[key] = { name: row.first_name + ' ' + row.last_name, outs: 0, er: 0, w: 0, sv: 0, so: 0 };
            }
            var p = map[key];
            p.outs += parseIP(row.ip);
            p.er   += (+row.er || 0);
            p.w    += (+row.w  || 0);
            p.sv   += (+row.sv || 0);
            p.so   += (+row.so || 0);
        });
        return Object.values(map).map(function (p) {
            return Object.assign({}, p, {
                ip:     formatIP(p.outs),
                eraNum: p.outs > 0 ? p.er / p.outs * 27 : 99
            });
        });
    }

    /* =========================================================
       RENDERING — SEASON LEADERS
       ========================================================= */

    function miniTable(headers, rows) {
        if (!rows.length) return '<p class="leaders-no-data">No data available</p>';
        var html = '<table class="leaders-mini-table"><thead><tr>';
        headers.forEach(function (h) { html += '<th>' + esc(h) + '</th>'; });
        html += '</tr></thead><tbody>';
        rows.forEach(function (cells) {
            html += '<tr>';
            cells.forEach(function (c) { html += '<td>' + c + '</td>'; });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    function renderLeaders(year) {
        var el = document.getElementById('leaders-' + year);
        if (!el) return;

        var batters  = aggBatting(year);
        var pitchers = aggPitching(year);

        var byAvg = batters.filter(function (b) { return b.ab >= 50; })
                           .sort(function (a, b) { return b.avg - a.avg; })
                           .slice(0, TOP_N);
        var byHR  = batters.slice().sort(function (a, b) { return b.hr  - a.hr;  }).slice(0, TOP_N);
        var byRBI = batters.slice().sort(function (a, b) { return b.rbi - a.rbi; }).slice(0, TOP_N);
        var bySB  = batters.slice().sort(function (a, b) { return b.sb  - a.sb;  }).slice(0, TOP_N);

        var byERA = pitchers.filter(function (p) { return p.outs >= 45; })
                            .sort(function (a, b) { return a.eraNum - b.eraNum; })
                            .slice(0, TOP_N);
        var byW   = pitchers.slice().sort(function (a, b) { return b.w  - a.w;  }).slice(0, TOP_N);
        var byK   = pitchers.slice().sort(function (a, b) { return b.so - a.so; }).slice(0, TOP_N);
        var bySV  = pitchers.slice().sort(function (a, b) { return b.sv - a.sv; }).slice(0, TOP_N);

        function battingRows(arr, valFn) {
            return arr.map(function (r, i) { return [i + 1, esc(r.name), valFn(r)]; });
        }
        function pitchingRows(arr, valFn) {
            return arr.map(function (r, i) { return [i + 1, esc(r.name), valFn(r)]; });
        }

        var html = '<div class="season-leaders-heading">Season Statistical Leaders</div>'
            + '<div class="leaders-grid">'
            + '<div>'
            + '<div class="leaders-col-title">Batting</div>'
            + '<p style="margin:0 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">Batting Average (min. 50 AB)</p>'
            + miniTable(['#', 'Player', 'AVG'], battingRows(byAvg, function (r) { return fmtAvg(r.h, r.ab); }))
            + '<p style="margin:0.6rem 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">Home Runs</p>'
            + miniTable(['#', 'Player', 'HR'], battingRows(byHR, function (r) { return r.hr; }))
            + '<p style="margin:0.6rem 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">RBI</p>'
            + miniTable(['#', 'Player', 'RBI'], battingRows(byRBI, function (r) { return r.rbi; }))
            + '<p style="margin:0.6rem 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">Stolen Bases</p>'
            + miniTable(['#', 'Player', 'SB'], battingRows(bySB, function (r) { return r.sb; }))
            + '</div>'
            + '<div>'
            + '<div class="leaders-col-title">Pitching</div>'
            + '<p style="margin:0 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">ERA (min. 15 IP)</p>'
            + miniTable(['#', 'Player', 'IP', 'ERA'], byERA.map(function (r, i) { return [i + 1, esc(r.name), r.ip, fmtERA(r.er, r.outs)]; }))
            + '<p style="margin:0.6rem 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">Wins</p>'
            + miniTable(['#', 'Player', 'W'], pitchingRows(byW, function (r) { return r.w; }))
            + '<p style="margin:0.6rem 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">Strikeouts</p>'
            + miniTable(['#', 'Player', 'K'], pitchingRows(byK, function (r) { return r.so; }))
            + '<p style="margin:0.6rem 0 0.3rem;font-size:0.8rem;font-weight:600;color:#697a96;">Saves</p>'
            + miniTable(['#', 'Player', 'SV'], pitchingRows(bySV, function (r) { return r.sv; }))
            + '</div>'
            + '</div>';

        el.innerHTML = html;
    }

    /* =========================================================
       RENDERING — GAME CARDS
       ========================================================= */

    function buildGameCardHTML(game) {
        var isHome   = isTomSox(game.home_team);
        var opponent = isHome ? game.away_team : game.home_team;
        var tomScore = isHome ? game.home_score : game.away_score;
        var oppScore = isHome ? game.away_score : game.home_score;
        var isPlay   = game.season_type === 'Playoffs';

        var resultHTML = '';
        if (tomScore !== null && tomScore !== undefined && oppScore !== null && oppScore !== undefined) {
            var isWin = Number(tomScore) > Number(oppScore);
            resultHTML = '<div class="game-result-badge ' + (isWin ? 'game-result-win' : 'game-result-loss') + '">'
                + (isWin ? 'W' : 'L') + ' ' + tomScore + '&ndash;' + oppScore
                + '</div>';
        }

        var vsAt = '<span class="game-at-vs ' + (isHome ? 'is-vs' : 'is-at') + '">'
            + (isHome ? 'VS' : 'AT') + '</span>';

        var playoffBadge = isPlay
            ? '<span class="game-playoff-badge">Playoffs</span>'
            : '';

        return '<div class="game-item ' + (isHome ? 'is-home' : 'is-away') + '"'
            + ' data-game-id="' + esc(String(game.id)) + '"'
            + ' role="button" tabindex="0" aria-expanded="false">'
            + '<div class="game-main-info">'
            + '<div class="game-info-left">'
            + '<div class="game-details">'
            + '<div class="game-date-line">' + esc(formatGameDate(game.game_date)) + '</div>'
            + '<div class="game-opponent-info">'
            + vsAt
            + '<span class="game-opponent-name">' + esc(opponent) + '</span>'
            + playoffBadge
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="game-result-col">' + resultHTML + '</div>'
            + '</div>'
            + '<div class="game-boxscore-panel"></div>'
            + '</div>';
    }

    function renderGameCards(year) {
        var el = document.getElementById('games-' + year);
        if (!el) return;

        var list = games[year] || [];
        if (!list.length) {
            el.innerHTML = '<p class="leaders-no-data">No game data available for this season.</p>';
            return;
        }

        var html = '';
        list.forEach(function (game) { html += buildGameCardHTML(game); });
        el.innerHTML = html;

        el.querySelectorAll('.game-item').forEach(function (card) {
            card.addEventListener('click', function () { toggleBoxScore(card); });
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBoxScore(card); }
            });
        });

        // Re-apply active search filter if one exists
        var searchEl = document.getElementById('yearSearch');
        if (searchEl && searchEl.value.trim()) {
            applySearch(searchEl.value);
        }
    }

    /* =========================================================
       BOX SCORE — EXPAND / COLLAPSE
       ========================================================= */

    function toggleBoxScore(card) {
        var isExpanded = card.getAttribute('aria-expanded') === 'true';

        // Close any other open cards in the same list before opening this one
        if (!isExpanded) {
            var siblings = card.parentNode.querySelectorAll('.game-item[aria-expanded="true"]');
            siblings.forEach(function (sib) {
                if (sib !== card) { sib.setAttribute('aria-expanded', 'false'); }
            });
        }

        card.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        if (isExpanded) return;

        var panel  = card.querySelector('.game-boxscore-panel');
        if (!panel || panel.dataset.loaded) return;

        panel.innerHTML = '<div class="leaders-loading"><span class="yby-spinner"></span> Loading box score&hellip;</div>';

        fetch(API + '/boxscore?game_id=' + card.dataset.gameId)
            .then(safeJson)
            .then(function (data) {
                panel.dataset.loaded = 'true';
                panel.innerHTML = buildBoxScoreHTML(data);
            })
            .catch(function () {
                panel.innerHTML = '<p class="leaders-no-data" style="margin:0;padding:0.75rem">Box score unavailable.</p>';
            });
    }

    function buildBoxScoreHTML(data) {
        if (!data || !data.game) {
            return '<p class="leaders-no-data" style="margin:0;padding:0.75rem">Box score unavailable.</p>';
        }

        var game     = data.game;
        var bat      = data.batting  || [];
        var pit      = data.pitching || [];

        var tomTeam = isTomSox(game.home_team) ? game.home_team : game.away_team;
        var oppTeam = isTomSox(game.home_team) ? game.away_team : game.home_team;

        var tomBat  = bat.filter(function (r) { return isTomSox(r.team); });
        var oppBat  = bat.filter(function (r) { return !isTomSox(r.team); });
        var tomPit  = pit.filter(function (r) { return isTomSox(r.team); });
        var oppPit  = pit.filter(function (r) { return !isTomSox(r.team); });

        function batTable(rows) {
            if (!rows.length) {
                return '<p class="leaders-no-data" style="font-size:0.8rem;margin:0;padding:0.3rem">No data</p>';
            }
            var t = '<table class="boxscore-table"><thead><tr>'
                + '<th>Player</th><th>Pos</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>AVG</th>'
                + '</tr></thead><tbody>';
            rows.forEach(function (r) {
                t += '<tr>'
                    + '<td>' + esc(r.first_name + ' ' + r.last_name) + '</td>'
                    + '<td>' + esc(r.position || '') + '</td>'
                    + '<td>' + (r.ab  || 0) + '</td>'
                    + '<td>' + (r.r   || 0) + '</td>'
                    + '<td>' + (r.h   || 0) + '</td>'
                    + '<td>' + (r.rbi || 0) + '</td>'
                    + '<td>' + esc(String(r.avg || '')) + '</td>'
                    + '</tr>';
            });
            return t + '</tbody></table>';
        }

        function pitTable(rows) {
            if (!rows.length) {
                return '<p class="leaders-no-data" style="font-size:0.8rem;margin:0;padding:0.3rem">No data</p>';
            }
            var t = '<table class="boxscore-table"><thead><tr>'
                + '<th>Player</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>SO</th><th>Dec</th>'
                + '</tr></thead><tbody>';
            rows.forEach(function (r) {
                t += '<tr>'
                    + '<td>' + esc(r.first_name + ' ' + r.last_name) + '</td>'
                    + '<td>' + esc(String(r.ip || '')) + '</td>'
                    + '<td>' + (r.h  || 0) + '</td>'
                    + '<td>' + (r.r  || 0) + '</td>'
                    + '<td>' + (r.er || 0) + '</td>'
                    + '<td>' + (r.bb || 0) + '</td>'
                    + '<td>' + (r.so || 0) + '</td>'
                    + '<td>' + esc(r.decision || '') + '</td>'
                    + '</tr>';
            });
            return t + '</tbody></table>';
        }

        var html = '<div class="boxscore-panel-inner">';

        html += '<div class="boxscore-section">'
            + '<div class="boxscore-section-title">Batting</div>'
            + '<div class="boxscore-team-label">Tom Sox</div>'
            + batTable(tomBat)
            + '<div class="boxscore-team-label boxscore-team-opp">' + esc(oppTeam) + '</div>'
            + batTable(oppBat)
            + '</div>';

        html += '<div class="boxscore-section">'
            + '<div class="boxscore-section-title">Pitching</div>'
            + '<div class="boxscore-team-label">Tom Sox</div>'
            + pitTable(tomPit)
            + '<div class="boxscore-team-label boxscore-team-opp">' + esc(oppTeam) + '</div>'
            + pitTable(oppPit)
            + '</div>';

        html += '</div>';
        return html;
    }

    /* =========================================================
       LOAD DATA FOR YEAR (leaders + games)
       ========================================================= */

    function loadDataForYear(year) {
        var leadersEl = document.getElementById('leaders-' + year);
        var gamesEl   = document.getElementById('games-'   + year);

        if (loaded[year]) {
            if (leadersEl) renderLeaders(year);
            if (gamesEl)   renderGameCards(year);
            return;
        }
        if (loading[year]) return;

        if (leadersEl) {
            leadersEl.innerHTML = '<div class="leaders-loading"><span class="yby-spinner"></span> Loading season leaders&hellip;</div>';
        }
        if (gamesEl) {
            gamesEl.innerHTML = '<div class="leaders-loading"><span class="yby-spinner"></span> Loading game results&hellip;</div>';
        }

        fetchYear(year).then(function () {
            if (leadersEl) renderLeaders(year);
            if (gamesEl)   renderGameCards(year);
        }).catch(function (err) {
            if (leadersEl) leadersEl.innerHTML = '<p class="leaders-no-data">Could not load data.</p>';
            if (gamesEl)   gamesEl.innerHTML   = '<p class="leaders-no-data">Could not load game data.</p>';
            if (window.console) console.error('fetchYear(' + year + ') failed:', err);
        });
    }

    /* =========================================================
       SEARCH — filter game cards by text
       ========================================================= */

    function applySearch(query) {
        var q = query.trim().toLowerCase();

        document.querySelectorAll('.game-item').forEach(function (card) {
            if (!q) {
                card.style.display = '';
                card.classList.remove('search-highlight');
                return;
            }
            var text = card.textContent.toLowerCase();
            if (text.indexOf(q) !== -1) {
                card.style.display = '';
                card.classList.add('search-highlight');
            } else {
                card.style.display = 'none';
                card.classList.remove('search-highlight');
            }
        });

        // Auto-open accordions for year searches
        if (q) {
            YEARS.forEach(function (year) {
                if (String(year).indexOf(q) !== -1) {
                    var acc = document.getElementById('season-' + year);
                    if (acc && !acc.classList.contains('open')) {
                        openAccordion(acc, acc.querySelector('.accordion-header'));
                    }
                }
            });
        }
    }

    /* =========================================================
       ACCORDION TOGGLE
       ========================================================= */

    function openAccordion(acc, header) {
        acc.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
        var yearMatch = acc.id.match(/season-(\d+)/);
        if (yearMatch) {
            loadDataForYear(parseInt(yearMatch[1], 10));
        }
    }

    function closeAccordion(acc, header) {
        acc.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
    }

    function initAccordions() {
        document.querySelectorAll('.accordion-header').forEach(function (header) {
            header.addEventListener('click', function () {
                var acc    = this.parentElement;
                var isOpen = acc.classList.contains('open');
                document.querySelectorAll('.accordion').forEach(function (a) {
                    closeAccordion(a, a.querySelector('.accordion-header'));
                });
                if (!isOpen) openAccordion(acc, this);
            });
            header.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
            });
        });
    }

    /* =========================================================
       SIDEBAR — highlight active section on scroll
       ========================================================= */

    function initSidebarScroll() {
        var links      = document.querySelectorAll('.sidebar-link');
        var accordions = document.querySelectorAll('.accordion');

        function highlightActive() {
            var current = '';
            accordions.forEach(function (sec) {
                if (window.pageYOffset >= sec.offsetTop - 160) {
                    current = sec.id;
                }
            });
            links.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + current);
            });
        }

        window.addEventListener('scroll', highlightActive, { passive: true });
        highlightActive();
    }

    /* =========================================================
       SCROLL TO TOP
       ========================================================= */

    function initScrollTop() {
        var btn = document.getElementById('scrollTopBtn');
        if (!btn) return;

        window.addEventListener('scroll', function () {
            btn.classList.toggle('visible', window.pageYOffset > 400);
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* =========================================================
       OPEN FIRST / HASH NAVIGATION
       ========================================================= */

    function handleHashOrDefault() {
        var hash = window.location.hash;
        if (hash) {
            var target = document.querySelector(hash);
            if (target && target.classList.contains('accordion')) {
                openAccordion(target, target.querySelector('.accordion-header'));
                setTimeout(function () {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
        // No default open — all accordions start collapsed
    }

    /* =========================================================
       INIT
       ========================================================= */

    function init() {
        initAccordions();
        initSidebarScroll();
        initScrollTop();
        handleHashOrDefault();

        var searchEl = document.getElementById('yearSearch');
        if (searchEl) {
            searchEl.addEventListener('input', function () {
                applySearch(this.value);
            });
        }
    }

    // GHL-safe init (DOMContentLoaded may have already fired)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
</script>

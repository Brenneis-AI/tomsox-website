<script>
/*
  File: page.js
  Page: individual-records-uc
  Section: Individual Records — dynamic data fetch, aggregation, and rendering
  Last Updated: 2026-02-27
*/

(function () {
    'use strict';

    /* =========================================================
       CONSTANTS
       ========================================================= */
    var API = 'https://q7x4enwpcj.execute-api.us-east-1.amazonaws.com/prod';
    var YEARS = [2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025];
    var CHAMP_YEARS = { 2017: true, 2019: true, 2022: true, 2024: true };
    var TOP_N = 10;

    /* =========================================================
       STATE
       ========================================================= */
    // NOTE: batting/pitching rows contain first_name + last_name directly (no player_id field)
    var batting = {};        // { year: [game rows] }
    var pitching = {};       // { year: [game rows] }
    var loadedYears = {};    // { year: true }
    var selectedYear = 2025;

    /* =========================================================
       UTILITIES
       ========================================================= */

    // Convert "6.2" IP string to total outs (6*3+2 = 20)
    function parseIP(ip) {
        var s = String(ip || 0);
        var parts = s.split('.');
        var inn = parseInt(parts[0], 10) || 0;
        var outs = parseInt(parts[1], 10) || 0;
        return inn * 3 + outs;
    }

    // Convert total outs back to "6.2" IP format
    function formatIP(totalOuts) {
        return Math.floor(totalOuts / 3) + '.' + (totalOuts % 3);
    }

    // Batting average: ".xxx" format
    function fmtAvg(h, ab) {
        if (!ab || ab < 1) return '.000';
        return (h / ab).toFixed(3).replace(/^0\./, '.');
    }

    // ERA: earned runs / innings * 9
    function fmtERA(er, totalOuts) {
        if (!totalOuts || totalOuts < 1) return '-.--';
        return (er / totalOuts * 27).toFixed(2);
    }

    // Format year set: [2022, 2023] → "2022–23", [2015, 2017] → "2015, 2017"
    function formatYears(yearsObj) {
        var sorted = Object.keys(yearsObj).map(Number).sort(function (a, b) { return a - b; });
        if (sorted.length === 1) return String(sorted[0]);
        if (sorted.length === 2) {
            var gap = sorted[1] - sorted[0];
            // Treat 2019→2021 (COVID gap) as consecutive
            if (gap <= 2) return sorted[0] + '\u2013' + String(sorted[1]).slice(-2);
            return sorted.join(', ');
        }
        return sorted[0] + '\u2013' + String(sorted[sorted.length - 1]).slice(-2);
    }

    /* =========================================================
       DATA FETCHING
       ========================================================= */

    function safeJson(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }

    function fetchYear(year) {
        if (loadedYears[year]) return Promise.resolve();
        return Promise.all([
            fetch(API + '/batting?year='  + year).then(safeJson).catch(function () { return []; }),
            fetch(API + '/pitching?year=' + year).then(safeJson).catch(function () { return []; })
        ]).then(function (results) {
            batting[year]  = Array.isArray(results[0]) ? results[0] : [];
            pitching[year] = Array.isArray(results[1]) ? results[1] : [];
            loadedYears[year] = true;
        }).catch(function () {
            batting[year]  = [];
            pitching[year] = [];
            loadedYears[year] = true;
        });
    }

    /* =========================================================
       AGGREGATION — CAREER
       ========================================================= */

    function aggregateCareerBatting() {
        var careers = {};
        Object.keys(batting).forEach(function (year) {
            batting[year].forEach(function (row) {
                if (!row.first_name || !row.last_name) return;
                var key = row.first_name + '|' + row.last_name;
                if (!careers[key]) {
                    careers[key] = { name: row.first_name + ' ' + row.last_name, years: {}, ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, bb: 0, doubles: 0, triples: 0 };
                }
                var c = careers[key];
                c.years[+year] = true;
                c.ab      += (+row.ab      || 0);
                c.h       += (+row.h       || 0);
                c.hr      += (+row.hr      || 0);
                c.rbi     += (+row.rbi     || 0);
                c.sb      += (+row.sb      || 0);
                c.bb      += (+row.bb      || 0);
                c.doubles += (+row.doubles || 0);
                c.triples += (+row.triples || 0);
            });
        });
        return Object.values(careers).map(function (c) {
            return Object.assign({}, c, {
                avg:      c.ab > 0 ? c.h / c.ab : 0,
                yearsStr: formatYears(c.years)
            });
        });
    }

    function aggregateCareerPitching() {
        var careers = {};
        Object.keys(pitching).forEach(function (year) {
            pitching[year].forEach(function (row) {
                if (!row.first_name || !row.last_name) return;
                var key = row.first_name + '|' + row.last_name;
                if (!careers[key]) {
                    careers[key] = { name: row.first_name + ' ' + row.last_name, years: {}, outs: 0, er: 0, w: 0, sv: 0, so: 0 };
                }
                var c = careers[key];
                c.years[+year] = true;
                c.outs += parseIP(row.ip);
                c.er   += (+row.er || 0);
                c.w    += (+row.w  || 0);
                c.sv   += (+row.sv || 0);
                c.so   += (+row.so || 0);
            });
        });
        return Object.values(careers).map(function (c) {
            return Object.assign({}, c, {
                ip:       formatIP(c.outs),
                era:      fmtERA(c.er, c.outs),
                eraNum:   c.outs > 0 ? c.er / c.outs * 27 : 99,
                yearsStr: formatYears(c.years)
            });
        });
    }

    /* =========================================================
       AGGREGATION — SEASON
       ========================================================= */

    function aggregateSeasonBatting(year) {
        var season = {};
        var rows = batting[year] || [];
        rows.forEach(function (row) {
            if (!row.first_name || !row.last_name) return;
            var key = row.first_name + '|' + row.last_name;
            if (!season[key]) {
                season[key] = { name: row.first_name + ' ' + row.last_name, ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, bb: 0 };
            }
            var s = season[key];
            s.ab  += (+row.ab  || 0);
            s.h   += (+row.h   || 0);
            s.hr  += (+row.hr  || 0);
            s.rbi += (+row.rbi || 0);
            s.sb  += (+row.sb  || 0);
            s.bb  += (+row.bb  || 0);
        });
        return Object.values(season).map(function (s) {
            return Object.assign({}, s, { avg: s.ab > 0 ? s.h / s.ab : 0 });
        });
    }

    function aggregateSeasonPitching(year) {
        var season = {};
        var rows = pitching[year] || [];
        rows.forEach(function (row) {
            if (!row.first_name || !row.last_name) return;
            var key = row.first_name + '|' + row.last_name;
            if (!season[key]) {
                season[key] = { name: row.first_name + ' ' + row.last_name, outs: 0, er: 0, w: 0, sv: 0, so: 0 };
            }
            var s = season[key];
            s.outs += parseIP(row.ip);
            s.er   += (+row.er || 0);
            s.w    += (+row.w  || 0);
            s.sv   += (+row.sv || 0);
            s.so   += (+row.so || 0);
        });
        return Object.values(season).map(function (s) {
            return Object.assign({}, s, {
                ip:     formatIP(s.outs),
                era:    fmtERA(s.er, s.outs),
                eraNum: s.outs > 0 ? s.er / s.outs * 27 : 99
            });
        });
    }

    /* =========================================================
       ANNUAL LEADERS
       ========================================================= */

    function buildAnnualLeaders() {
        return YEARS.filter(function (y) { return loadedYears[y]; }).map(function (year) {
            var batters  = aggregateSeasonBatting(year);
            var pitchers = aggregateSeasonPitching(year);

            var byAvg = batters.filter(function (b) { return b.ab >= 50; }).sort(function (a, b) { return b.avg - a.avg; });
            var byHR  = batters.slice().sort(function (a, b) { return b.hr  - a.hr;  });
            var byRBI = batters.slice().sort(function (a, b) { return b.rbi - a.rbi; });
            var bySB  = batters.slice().sort(function (a, b) { return b.sb  - a.sb;  });

            // Min 15 IP = 45 outs for ERA qualifier
            var byERA = pitchers.filter(function (p) { return p.outs >= 45; }).sort(function (a, b) { return a.eraNum - b.eraNum; });
            var byW   = pitchers.slice().sort(function (a, b) { return b.w  - a.w;  });
            var bySV  = pitchers.slice().sort(function (a, b) { return b.sv - a.sv; });
            var byK   = pitchers.slice().sort(function (a, b) { return b.so - a.so; });

            function lead(arr, fmt) {
                if (!arr.length) return '\u2014';
                return arr[0].name + ' (' + fmt(arr[0]) + ')';
            }

            return {
                year:    year,
                isChamp: !!CHAMP_YEARS[year],
                avg:     lead(byAvg, function (r) { return fmtAvg(r.h, r.ab); }),
                hr:      lead(byHR,  function (r) { return r.hr; }),
                rbi:     lead(byRBI, function (r) { return r.rbi; }),
                sb:      lead(bySB,  function (r) { return r.sb; }),
                era:     lead(byERA, function (r) { return r.era; }),
                w:       lead(byW,   function (r) { return r.w; }),
                sv:      lead(bySV,  function (r) { return r.sv; }),
                k:       lead(byK,   function (r) { return r.so; })
            };
        });
    }

    /* =========================================================
       RENDERING HELPERS
       ========================================================= */

    function showLoading(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var cols = table.querySelectorAll('thead th').length || 4;
        table.querySelector('tbody').innerHTML =
            '<tr class="loading-row"><td colspan="' + cols + '"><span class="ir-spinner"></span> Loading&hellip;</td></tr>';
        var btn = document.querySelector('[data-table="' + tableId + '"]');
        if (btn) btn.style.display = 'none';
    }

    function applyMobileLabels(table) {
        var headers = Array.prototype.slice.call(table.querySelectorAll('thead th')).map(function (th) {
            return th.textContent.trim();
        });
        table.querySelectorAll('tbody tr').forEach(function (row) {
            row.querySelectorAll('td').forEach(function (cell, i) {
                if (headers[i]) cell.setAttribute('data-label', headers[i]);
            });
        });
    }

    // Renders a sorted leaderboard into tbody.
    // sortFn(a,b): standard sort comparator
    // rowFn(row, rank): returns innerHTML string for a <tr>
    // options.filter: function to pre-filter rows
    // options.tieKey: function to extract the value used for tie detection
    function renderLeaderboard(tableId, data, sortFn, rowFn, options) {
        var opts   = options || {};
        var filter = opts.filter;
        var tieKey = opts.tieKey;
        var table  = document.getElementById(tableId);
        if (!table) return;

        var rows = filter ? data.filter(filter) : data.slice();
        rows.sort(sortFn);

        var tbody = table.querySelector('tbody');
        tbody.innerHTML = '';

        var rank = 1;
        rows.forEach(function (row, i) {
            if (i > 0 && tieKey && tieKey(rows[i]) !== tieKey(rows[i - 1])) {
                rank = i + 1;
            } else if (i > 0 && !tieKey) {
                rank = i + 1;
            }
            var tr = document.createElement('tr');
            if (i >= TOP_N) tr.classList.add('table-row-hidden');
            tr.innerHTML = rowFn(row, rank);
            tbody.appendChild(tr);
        });

        applyMobileLabels(table);

        var btn = document.querySelector('[data-table="' + tableId + '"]');
        if (btn) {
            if (rows.length <= TOP_N) {
                btn.style.display = 'none';
            } else {
                btn.style.display = '';
                btn.classList.remove('expanded');
                btn.classList.add('collapsed');
                btn.textContent = 'Show All';
            }
        }
    }

    // Shorthand: class "stat-leader" only on rank 1
    function leaderClass(rank) {
        return rank === 1 ? ' class="stat-leader"' : '';
    }

    /* =========================================================
       RENDER — CAREER SECTIONS
       ========================================================= */

    function renderCareerSections() {
        var batters  = aggregateCareerBatting();
        var pitchers = aggregateCareerPitching();

        // --- Batting Average (min 120 AB) ---
        renderLeaderboard('career-avg', batters,
            function (a, b) { return b.avg - a.avg; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td>' + r.ab + '</td>'
                    + '<td>' + r.h + '</td>'
                    + '<td' + leaderClass(rank) + '>' + fmtAvg(r.h, r.ab) + '</td>';
            },
            { filter: function (r) { return r.ab >= 120; }, tieKey: function (r) { return r.ab > 0 ? Math.round(r.h / r.ab * 1000) : 0; } }
        );

        // --- Home Runs ---
        renderLeaderboard('career-hr', batters,
            function (a, b) { return b.hr - a.hr; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.hr + '</td>';
            },
            { tieKey: function (r) { return r.hr; } }
        );

        // --- RBI ---
        renderLeaderboard('career-rbi', batters,
            function (a, b) { return b.rbi - a.rbi; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.rbi + '</td>';
            },
            { tieKey: function (r) { return r.rbi; } }
        );

        // --- Stolen Bases ---
        renderLeaderboard('career-sb', batters,
            function (a, b) { return b.sb - a.sb; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.sb + '</td>';
            },
            { tieKey: function (r) { return r.sb; } }
        );

        // --- Hits ---
        renderLeaderboard('career-h', batters,
            function (a, b) { return b.h - a.h; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.h + '</td>';
            },
            { tieKey: function (r) { return r.h; } }
        );

        // --- Doubles ---
        renderLeaderboard('career-2b', batters,
            function (a, b) { return b.doubles - a.doubles; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.doubles + '</td>';
            },
            { tieKey: function (r) { return r.doubles; } }
        );

        // --- Triples ---
        renderLeaderboard('career-3b', batters,
            function (a, b) { return b.triples - a.triples; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.triples + '</td>';
            },
            { tieKey: function (r) { return r.triples; } }
        );

        // --- Walks ---
        renderLeaderboard('career-bb', batters,
            function (a, b) { return b.bb - a.bb; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.bb + '</td>';
            },
            { tieKey: function (r) { return r.bb; } }
        );

        // --- ERA (min 30 IP = 90 outs) ---
        renderLeaderboard('career-era', pitchers,
            function (a, b) { return a.eraNum - b.eraNum; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td>' + r.ip + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.era + '</td>';
            },
            { filter: function (p) { return p.outs >= 90; }, tieKey: function (r) { return Math.round(r.eraNum * 100); } }
        );

        // --- Wins ---
        renderLeaderboard('career-w', pitchers,
            function (a, b) { return b.w - a.w; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.w + '</td>';
            },
            { tieKey: function (r) { return r.w; } }
        );

        // --- Saves ---
        renderLeaderboard('career-sv', pitchers,
            function (a, b) { return b.sv - a.sv; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.sv + '</td>';
            },
            { tieKey: function (r) { return r.sv; } }
        );

        // --- Strikeouts (pitching) ---
        renderLeaderboard('career-k', pitchers,
            function (a, b) { return b.so - a.so; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.so + '</td>';
            },
            { tieKey: function (r) { return r.so; } }
        );

        // --- Innings Pitched ---
        renderLeaderboard('career-ip', pitchers,
            function (a, b) { return b.outs - a.outs; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.yearsStr + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.ip + '</td>';
            },
            { tieKey: function (r) { return r.outs; } }
        );
    }

    /* =========================================================
       RENDER — SEASON SECTIONS
       ========================================================= */

    function renderSeasonSections(year) {
        var batters  = aggregateSeasonBatting(year);
        var pitchers = aggregateSeasonPitching(year);

        // --- Season Batting Average (min 50 AB) ---
        renderLeaderboard('season-avg', batters,
            function (a, b) { return b.avg - a.avg; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.ab + '</td>'
                    + '<td>' + r.h + '</td>'
                    + '<td' + leaderClass(rank) + '>' + fmtAvg(r.h, r.ab) + '</td>';
            },
            { filter: function (r) { return r.ab >= 50; }, tieKey: function (r) { return r.ab > 0 ? Math.round(r.h / r.ab * 1000) : 0; } }
        );

        // --- Home Runs ---
        renderLeaderboard('season-hr', batters,
            function (a, b) { return b.hr - a.hr; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.hr + '</td>';
            },
            { tieKey: function (r) { return r.hr; } }
        );

        // --- RBI ---
        renderLeaderboard('season-rbi', batters,
            function (a, b) { return b.rbi - a.rbi; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.rbi + '</td>';
            },
            { tieKey: function (r) { return r.rbi; } }
        );

        // --- Stolen Bases ---
        renderLeaderboard('season-sb', batters,
            function (a, b) { return b.sb - a.sb; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.sb + '</td>';
            },
            { tieKey: function (r) { return r.sb; } }
        );

        // --- Hits ---
        renderLeaderboard('season-h', batters,
            function (a, b) { return b.h - a.h; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.h + '</td>';
            },
            { tieKey: function (r) { return r.h; } }
        );

        // --- Walks ---
        renderLeaderboard('season-bb', batters,
            function (a, b) { return b.bb - a.bb; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.bb + '</td>';
            },
            { tieKey: function (r) { return r.bb; } }
        );

        // --- Season ERA (min 15 IP = 45 outs) ---
        renderLeaderboard('season-era', pitchers,
            function (a, b) { return a.eraNum - b.eraNum; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td>' + r.ip + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.era + '</td>';
            },
            { filter: function (p) { return p.outs >= 45; }, tieKey: function (r) { return Math.round(r.eraNum * 100); } }
        );

        // --- Wins ---
        renderLeaderboard('season-w', pitchers,
            function (a, b) { return b.w - a.w; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.w + '</td>';
            },
            { tieKey: function (r) { return r.w; } }
        );

        // --- Saves ---
        renderLeaderboard('season-sv', pitchers,
            function (a, b) { return b.sv - a.sv; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.sv + '</td>';
            },
            { tieKey: function (r) { return r.sv; } }
        );

        // --- Strikeouts ---
        renderLeaderboard('season-k', pitchers,
            function (a, b) { return b.so - a.so; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.so + '</td>';
            },
            { tieKey: function (r) { return r.so; } }
        );

        // --- Innings Pitched ---
        renderLeaderboard('season-ip', pitchers,
            function (a, b) { return b.outs - a.outs; },
            function (r, rank) {
                return '<td>' + rank + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.name + '</td>'
                    + '<td' + leaderClass(rank) + '>' + r.ip + '</td>';
            },
            { tieKey: function (r) { return r.outs; } }
        );
    }

    /* =========================================================
       RENDER — ANNUAL LEADERS
       ========================================================= */

    function renderAnnualLeaders() {
        var leaders = buildAnnualLeaders();
        var table   = document.getElementById('annual-leaders-tbl');
        if (!table) return;

        var tbody = table.querySelector('tbody');
        tbody.innerHTML = '';

        leaders.forEach(function (row) {
            var tr = document.createElement('tr');
            if (row.isChamp) tr.classList.add('champ-row');
            tr.innerHTML =
                '<td>' + row.year + (row.isChamp ? ' <span class="champ-badge">Championship</span>' : '') + '</td>'
                + '<td>' + row.avg + '</td>'
                + '<td>' + row.hr  + '</td>'
                + '<td>' + row.rbi + '</td>'
                + '<td>' + row.sb  + '</td>'
                + '<td>' + row.era + '</td>'
                + '<td>' + row.w   + '</td>'
                + '<td>' + row.sv  + '</td>'
                + '<td>' + row.k   + '</td>';
            tbody.appendChild(tr);
        });

        applyMobileLabels(table);
    }

    /* =========================================================
       UI EVENT HANDLERS
       ========================================================= */

    function initUI() {

        // ---- Accordion toggle ----
        document.querySelectorAll('.accordion-header').forEach(function (header) {
            header.addEventListener('click', function () {
                var acc    = this.parentElement;
                var isOpen = acc.classList.contains('open');
                document.querySelectorAll('.accordion').forEach(function (a) {
                    a.classList.remove('open');
                    a.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    acc.classList.add('open');
                    this.setAttribute('aria-expanded', 'true');
                }
            });
            header.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // ---- Sidebar active-on-scroll ----
        var sidebarLinks = document.querySelectorAll('.sidebar-link');
        var accordions   = document.querySelectorAll('.accordion');

        function highlightActive() {
            var current = '';
            accordions.forEach(function (sec) {
                if (window.pageYOffset >= sec.offsetTop - 150) {
                    current = sec.id;
                }
            });
            sidebarLinks.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + current);
            });
        }

        sidebarLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.getAttribute('href').substring(1);
                var target   = document.getElementById(targetId);
                if (!target) return;
                document.querySelectorAll('.accordion').forEach(function (a) {
                    a.classList.remove('open');
                    a.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                });
                target.classList.add('open');
                target.querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
                window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
            });
        });

        window.addEventListener('scroll', highlightActive);
        highlightActive();

        // ---- Show More / Show Less ----
        document.querySelectorAll('.show-more-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tableId = this.dataset.table;
                var table   = document.getElementById(tableId);
                if (!table) return;
                var rows = table.querySelectorAll('tbody tr');
                if (this.classList.contains('collapsed')) {
                    rows.forEach(function (r) { r.classList.remove('table-row-hidden'); });
                    this.classList.remove('collapsed');
                    this.classList.add('expanded');
                    this.textContent = 'Show Less';
                } else {
                    rows.forEach(function (r, i) {
                        if (i >= TOP_N) r.classList.add('table-row-hidden');
                    });
                    this.classList.remove('expanded');
                    this.classList.add('collapsed');
                    this.textContent = 'Show All';
                }
            });
        });

        // ---- Player search (debounced) ----
        var searchInput = document.getElementById('playerSearch');
        if (searchInput) {
            var searchTimeout;
            searchInput.addEventListener('input', function () {
                clearTimeout(searchTimeout);
                var term = this.value.toLowerCase().trim();
                searchTimeout = setTimeout(function () {
                    document.querySelectorAll('.highlight').forEach(function (el) {
                        el.classList.remove('highlight');
                    });
                    if (term.length < 2) return;

                    document.querySelectorAll('.records-table td').forEach(function (cell) {
                        if (!cell.textContent.toLowerCase().includes(term)) return;
                        var row       = cell.parentElement;
                        var table     = cell.closest('.records-table');
                        var accordion = cell.closest('.accordion');

                        if (accordion && !accordion.classList.contains('open')) {
                            document.querySelectorAll('.accordion').forEach(function (a) {
                                a.classList.remove('open');
                                a.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                            });
                            accordion.classList.add('open');
                            accordion.querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
                        }

                        if (row.classList.contains('table-row-hidden')) {
                            row.classList.remove('table-row-hidden');
                            var tid     = table && table.id;
                            var showBtn = tid ? document.querySelector('[data-table="' + tid + '"]') : null;
                            if (showBtn) {
                                showBtn.classList.remove('collapsed');
                                showBtn.classList.add('expanded');
                                showBtn.textContent = 'Show Less';
                            }
                        }
                        row.classList.add('highlight');
                    });
                }, 300);
            });
        }

        // ---- Year filter ----
        var yearSelect = document.getElementById('season-year');
        if (yearSelect) {
            yearSelect.addEventListener('change', function () {
                selectedYear = +this.value;
                var seasonTables = [
                    'season-avg', 'season-hr', 'season-rbi', 'season-sb', 'season-h', 'season-bb',
                    'season-era', 'season-w', 'season-sv', 'season-k', 'season-ip'
                ];
                seasonTables.forEach(showLoading);
                fetchYear(selectedYear).then(function () {
                    renderSeasonSections(selectedYear);
                });
            });
        }

        // ---- Scroll to top button ----
        var scrollBtn = document.getElementById('scrollTopBtn');
        if (scrollBtn) {
            window.addEventListener('scroll', function () {
                scrollBtn.classList.toggle('visible', window.scrollY > 300);
            });
            scrollBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    /* =========================================================
       INIT
       ========================================================= */

    function init() {
        initUI();

        // Show loading spinners in all dynamic tables
        var allDynamic = [
            'career-avg', 'career-hr', 'career-rbi', 'career-sb',
            'career-h', 'career-2b', 'career-3b', 'career-bb',
            'career-era', 'career-w', 'career-sv', 'career-k', 'career-ip',
            'season-avg', 'season-hr', 'season-rbi', 'season-sb',
            'season-h', 'season-bb',
            'season-era', 'season-w', 'season-sv', 'season-k', 'season-ip',
            'annual-leaders-tbl'
        ];
        allDynamic.forEach(showLoading);

        // Phase 1: fetch 2025 batting + pitching (player names are embedded in each row)
        fetchYear(2025).then(function () {
            // Render 2025 season views immediately
            renderSeasonSections(2025);

            // Phase 2 (background): fetch remaining years in two batches to avoid rate limits
            var remaining = YEARS.filter(function (y) { return y !== 2025; });
            var batchA = remaining.slice(0, 4);   // 2015, 2016, 2017, 2018
            var batchB = remaining.slice(4);       // 2019, 2021, 2022, 2023, 2024
            return Promise.all(batchA.map(fetchYear)).then(function () {
                return Promise.all(batchB.map(fetchYear));
            });
        }).then(function () {
            // All years loaded — render career tables and annual leaders
            renderCareerSections();
            renderAnnualLeaders();
        }).catch(function (err) {
            console.error('Tom Sox stats load error:', err);
        });
    }

    // GHL injects footer JS after DOMContentLoaded fires, so check readyState first
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
</script>

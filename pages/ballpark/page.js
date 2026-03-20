<script>
/*
  File: page.js
  Page: Ballpark
  Section: Dynamic all-time home wins — fetches current season from API, sums with historical DOM totals
  Last Updated: 2026-03-08
*/

(function () {
    'use strict';

    var API          = 'https://q7x4enwpcj.execute-api.us-east-1.amazonaws.com/prod';
    var CURRENT_YEAR = 2026;

    function isTomSox(team) {
        return team === 'Charlottesville TomSox'
            || team === 'Charlottesville Tom Sox'
            || team === 'TomSox';
    }

    // Sum historical home wins from the hardcoded record-result elements
    // (format "W-L", e.g. "17-6") in section-home-records3.html
    function historicalHomeWins() {
        var total = 0;
        document.querySelectorAll('.record-result').forEach(function (el) {
            var parts = el.textContent.trim().split('-');
            var wins = parseInt(parts[0], 10);
            if (!isNaN(wins)) { total += wins; }
        });
        return total;
    }

    function updateStat(total) {
        var el = document.getElementById('stat-home-wins');
        if (el) { el.textContent = total; }
    }

    // Fetch current season games and count home wins
    fetch(API + '/games?year=' + CURRENT_YEAR)
        .then(function (r) {
            if (!r.ok) { throw new Error('HTTP ' + r.status); }
            return r.json();
        })
        .then(function (games) {
            var currentWins = 0;
            if (Array.isArray(games)) {
                games.forEach(function (g) {
                    if (isTomSox(g.home_team)
                            && g.home_score !== null && g.away_score !== null
                            && Number(g.home_score) > Number(g.away_score)) {
                        currentWins++;
                    }
                });
            }
            updateStat(historicalHomeWins() + currentWins);
        })
        .catch(function () {
            // API unavailable — show historical total from DOM only
            updateStat(historicalHomeWins());
        });

}());
</script>

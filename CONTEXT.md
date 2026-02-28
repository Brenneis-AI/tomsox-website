# Tom Sox Stats — Project Context

## API
Base URL: https://q7x4enwpcj.execute-api.us-east-1.amazonaws.com/prod

Endpoints:
- GET /players — returns all 495 players {id, first_name, last_name}
- GET /batting?year=YYYY&season_type=Summer|Playoffs&player_id=N
- GET /pitching?year=YYYY&season_type=Summer|Playoffs&player_id=N

Years available: 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024
No 2020 (COVID). 2025+ handled by PrestoSports (not yet built).

## API response behavior (confirmed from live calls)
- Omitting player_id returns ALL players' rows for that year (full season dump)
- Batting and pitching rows include first_name and last_name directly — there is NO player_id field in the rows
- The /players endpoint id field does NOT appear in batting/pitching rows and cannot be used for joins
- Aggregate player stats by keying on first_name + '|' + last_name
- ip is returned as a float (e.g. 2.1, 2.0), not a string — parseIP must handle float input
- Large years (2019, 2023) return 500–1000+ rows and can be slow; fetch in batches of 4 years to avoid rate limits
- API is public, no authentication required

## Batting fields (per game row)
first_name, last_name, year, season_type, date, opponent, result, home_away,
ab, r, h, doubles, triples, hr, rbi, bb, hp, so, sf, sb, cs, avg, obp, slg

## Pitching fields (per game row)
first_name, last_name, year, season_type, date, opponent, result, home_away,
w, l, gs, cg, sho, sv, ip, h, r, er, bb, so

## Website
- Built in GoHighLevel
- HTML goes in section blocks
- CSS goes in Custom CSS block (page level)
- JavaScript goes in page footer tracking code
- No framework — vanilla HTML/CSS/JS only

## GHL JavaScript gotcha
GHL's footer tracking code slot executes AFTER DOMContentLoaded has already fired.
Always use this pattern instead of a bare addEventListener:

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

## Design reference
- Site colors: dark navy (#1B365D), green (#84BD00), white
- Fonts: Oswald 700 (headings), Open Sans 400/600 (body)
- Existing schedule page design is the style target
- Tables should match existing individual-records page structure
- Top 10 visible by default, "Show All" loads full list
- Year filter dropdown to toggle between career and single season views
- Championship years: 2015, 2017, 2019, 2022, 2024

## Phase 1 build order
1. Individual Records page — DONE (pages/individual-records-uc/)
2. Year-by-Year page
3. Team Records page
4. Playoffs page

## Pages
- Individual Records build/test: https://tomsox.org/team-records/individual-records-uc
- Individual Records production: https://tomsox.org/team-records/individual-records
- Do not touch production pages until explicitly told to

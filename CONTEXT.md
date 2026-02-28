# Tom Sox Stats — Project Context

## API
Base URL: https://q7x4enwpcj.execute-api.us-east-1.amazonaws.com/prod

Endpoints:
- GET /players — returns all 495 players {id, first_name, last_name}
- GET /batting?year=YYYY&season_type=Summer|Playoffs&player_id=N
- GET /pitching?year=YYYY&season_type=Summer|Playoffs&player_id=N

Years available: 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024
No 2020 (COVID). 2025+ handled by PrestoSports (not yet built).

## Batting fields
date, opponent, result, home_away, ab, r, h, doubles, triples, hr,
rbi, bb, hp, so, sf, sb, cs, avg, obp, slg

## Pitching fields
date, opponent, result, home_away, w, l, gs, cg, sho, sv, ip, h, r, er, bb, so

## Website
- Built in GoHighLevel
- HTML goes in section blocks
- CSS goes in Custom CSS block (page level)
- JavaScript goes in page footer tracking code
- No framework — vanilla HTML/CSS/JS only
- Existing page to replace: https://tomsox.org/team-records/individual-records

## Design reference
- Site colors: dark navy (#1a2744), green (#6abf4b), white
- Existing schedule page design is the style target
- Tables should match existing individual-records page structure
- Top 10 visible by default, "Show All" loads full list
- Year filter dropdown to toggle between career and single season views

## Phase 1 build order
1. Individual Records page (current task)
2. Year-by-Year page
3. Team Records page
4. Playoffs page

## Current build target
- Build/test page: https://tomsox.org/team-records/individual-records-uc
- Production page: https://tomsox.org/team-records/individual-records
- Do not touch the production page until explicitly told to
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tom Sox Record Book – Program History</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Google Fonts: Oswald (heading), Open Sans (body) -->
    <link href="https://fonts.googleapis.com/css?family=Oswald:700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap" rel="stylesheet">

    <style>
        /* =========================================
           1. VARIABLES & GLOBAL STYLES
           ========================================= */
        :root {
            --tomsox-green: #84BD00;
            --dark-blue: #1B365D;
            --blue-gradient: linear-gradient(90deg, #1B365D 70%, #224472 100%);
            --max-width: 1600px;
            --sidebar-width: 200px;
        }

        * {
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            background: #f6f8fa;
            color: #222;
            font-family: 'Open Sans', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            min-height: 100vh;
        }

        /* =========================================
           2. HERO SECTION
           ========================================= */
        .hero-section {
            background: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
            position: relative;
            min-height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--blue-gradient);
            opacity: 0.86;
            z-index: 0;
        }

        .hero-content {
            position: relative;
            z-index: 2;
            color: #fff;
            text-align: center;
            padding: 2rem 1rem;
        }

        .hero-title {
            font-family: 'Oswald', sans-serif;
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 0.4rem;
            letter-spacing: 2px;
            text-shadow: 0 2px 20px #0006;
        }

        .hero-subtitle {
            font-size: 1.3rem;
            letter-spacing: 1px;
            margin-bottom: 0;
            opacity: 0.93;
            font-family: 'Open Sans', sans-serif;
        }

        /* =========================================
           3. TOP NAVIGATION BAR
           ========================================= */
        .records-nav {
            width: 100%;
            background: var(--dark-blue);
            border-bottom: none;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
        }

        .records-nav-inner {
            max-width: var(--max-width);
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            padding: 0;
            justify-content: center;
        }

        .nav-link {
            font-family: 'Oswald', sans-serif;
            font-size: 1.13rem;
            color: #fff;
            background: none;
            border: none;
            border-radius: 0;
            padding: 1rem 2rem;
            margin: 0;
            text-decoration: none;
            font-weight: 700;
            letter-spacing: 0.5px;
            transition: background 0.2s, color 0.2s;
            cursor: pointer;
            white-space: nowrap;
        }

        .nav-link.active {
            background: var(--tomsox-green);
            color: var(--dark-blue);
            box-shadow: none;
        }

        .nav-link:hover:not(.active) {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }

        /* =========================================
           4. SEARCH BAR
           ========================================= */
        .search-container {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 1rem 0.5rem 0.5rem 0.5rem;
        }

        .search-wrapper {
            position: relative;
            max-width: 500px;
        }

        .search-input {
            width: 100%;
            padding: 0.75rem 1rem;
            font-size: 1rem;
            font-family: 'Open Sans', sans-serif;
            border: 2px solid #e0e5ef;
            border-radius: 10px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input:focus {
            border-color: var(--tomsox-green);
            box-shadow: 0 0 0 3px rgba(132, 189, 0, 0.1);
        }

        .search-input::placeholder {
            color: #999;
        }

        /* =========================================
           5. CONTENT WRAPPER (SIDEBAR + MAIN)
           ========================================= */
        .content-wrapper {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0.5rem;
            display: flex;
            gap: 1rem;
            align-items: flex-start;
        }

        /* =========================================
           6. STICKY SIDEBAR NAVIGATION
           ========================================= */
        .sidebar-nav {
            width: var(--sidebar-width);
            position: sticky;
            top: 80px;
            flex-shrink: 0;
        }

        .sidebar-title {
            font-family: 'Oswald', sans-serif;
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--dark-blue);
            margin-bottom: 0.75rem;
            letter-spacing: 0.5px;
        }

        .sidebar-links {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .sidebar-link {
            font-family: 'Open Sans', sans-serif;
            font-size: 0.95rem;
            color: #555;
            text-decoration: none;
            padding: 0.6rem 0.8rem;
            border-radius: 8px;
            transition: background 0.2s, color 0.2s;
            cursor: pointer;
        }

        .sidebar-link:hover {
            background: #e9f5d7;
            color: var(--dark-blue);
        }

        .sidebar-link.active {
            background: var(--tomsox-green);
            color: #fff;
            font-weight: 600;
        }

        /* =========================================
           7. MAIN CONTENT AREA
           ========================================= */
        .main-content {
            flex: 1;
            min-width: 0;
        }

        /* =========================================
           8. ACCORDION SECTIONS
           ========================================= */
        .accordion {
            background: #fff;
            border-radius: 12px;
            margin-bottom: 1rem;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(27, 54, 93, 0.08);
            scroll-margin-top: 100px;
        }

        .accordion-header {
            background: var(--blue-gradient);
            color: #fff;
            font-family: 'Oswald', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            padding: 1rem 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            user-select: none;
            transition: opacity 0.2s;
        }

        .accordion-header:hover {
            opacity: 0.95;
        }

        .accordion-arrow {
            font-size: 1.2rem;
            transition: transform 0.3s ease;
            color: var(--tomsox-green);
        }

        .accordion.open .accordion-arrow {
            transform: rotate(90deg);
        }

        .accordion-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease, padding 0.4s ease;
            padding: 0 1.2rem;
        }

        .accordion.open .accordion-content {
            max-height: 10000px;
            padding: 1rem 1.2rem 1.2rem 1.2rem;
        }

        /* =========================================
           9. TABLE STYLES
           ========================================= */
        .table-category {
            margin-bottom: 2rem;
        }

        .table-category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .table-category-title {
            font-family: 'Oswald', sans-serif;
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--dark-blue);
            margin: 0;
        }

        .show-more-btn {
            font-family: 'Oswald', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: #fff;
            background: var(--tomsox-green);
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            letter-spacing: 0.3px;
        }

        .show-more-btn:hover {
            background: #72a500;
            transform: translateY(-1px);
        }

        .show-more-btn:active {
            transform: translateY(0);
        }

        .records-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 0.98rem;
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 1px 10px 0 #1b365d0d;
        }

        .records-table th {
            background: var(--dark-blue);
            color: #fff;
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            letter-spacing: 0.3px;
            font-size: 0.95em;
            padding: 0.6em 0.7em;
            border-bottom: 3px solid var(--tomsox-green);
            text-align: left;
        }

        .records-table td {
            background: #fff;
            color: #222;
            padding: 0.5em 0.7em;
            border-bottom: 1px solid #e8ebf2;
            font-family: 'Open Sans', Arial, sans-serif;
        }

        .records-table tr:last-child td {
            border-bottom: none;
        }

        .records-table tbody tr:hover td {
            background: #f7fadf;
        }

        .table-row-hidden {
            display: none;
        }

        /* Championship Highlighting */
        tr.championship, .champ-row {
            background: #e6f9c5 !important;
        }

        .champ-badge {
            color: #fff;
            background: var(--tomsox-green);
            border-radius: 1em;
            padding: 0.12em 0.7em;
            font-size: 0.88em;
            font-weight: 700;
            display: inline-block;
            margin-left: 0.4em;
            vertical-align: middle;
            letter-spacing: 0.2px;
        }

        .stat-leader, .champion-cell, .series-win {
            font-weight: 700;
            color: var(--tomsox-green);
            letter-spacing: 0.05em;
        }

        /* MLB Draft Highlighting */
        .mlb-first {
            background: #fffbe7 !important;
        }

        .mlb-pick {
            color: #ca9127;
            font-weight: 700;
        }

        .mlb-highlight {
            color: #ca9127;
            font-weight: 700;
            background: #fffbe7;
            border-radius: 4px;
            padding: 1px 4px;
            margin-right: 5px;
        }

        /* Honors Styles */
        .honors-subheading {
            font-family: 'Oswald', sans-serif;
            font-size: 1.15rem;
            margin: 1.5rem 0 0.75rem 0;
            color: var(--dark-blue);
            letter-spacing: 0.3px;
            border-left: 5px solid var(--tomsox-green);
            padding-left: 0.75rem;
        }

        .honors-winner {
            color: var(--tomsox-green);
            font-weight: 700;
        }

        /* Search Highlighting */
        .search-highlight {
            background: #ffeb3b !important;
        }

        /* =========================================
           10. SCROLL-TO-TOP BUTTON
           ========================================= */
        .scroll-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            background: var(--tomsox-green);
            color: #fff;
            border: none;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s, transform 0.2s;
            z-index: 1000;
        }

        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
        }

        .scroll-to-top:hover {
            transform: translateY(-3px);
            background: #72a500;
        }

        /* =========================================
           11. RESPONSIVE DESIGN
           ========================================= */
        
        /* Mobile: Transform sidebar to horizontal chips */
        @media (max-width: 1000px) {
            .content-wrapper {
                flex-direction: column;
            }

            .sidebar-nav {
                width: 100%;
                position: static;
                margin-bottom: 1rem;
            }

            .sidebar-title {
                display: none;
            }

            .sidebar-links {
                flex-direction: row;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .sidebar-link {
                font-size: 0.9rem;
                padding: 0.5rem 0.9rem;
            }

            .hero-title {
                font-size: 2.2rem;
            }

            .hero-subtitle {
                font-size: 1.1rem;
            }

            .accordion-header {
                font-size: 1.3rem;
                padding: 0.9rem 1rem;
            }
        }

        /* Mobile: Card-style tables */
        @media (max-width: 650px) {
            .records-table,
            .records-table thead,
            .records-table tbody,
            .records-table th,
            .records-table td,
            .records-table tr {
                display: block;
            }

            .records-table thead {
                display: none;
            }

            .records-table tr {
                margin-bottom: 1rem;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(27, 54, 93, 0.1);
                overflow: hidden;
            }

            .records-table td {
                padding: 0.75rem 0.75rem 0.75rem 45%;
                position: relative;
                border-bottom: 1px solid #e8ebf2;
            }

            .records-table td:last-child {
                border-bottom: none;
            }

            .records-table td::before {
                content: attr(data-label);
                position: absolute;
                left: 0.75rem;
                top: 0.75rem;
                width: 40%;
                font-weight: 700;
                color: var(--dark-blue);
                font-family: 'Oswald', sans-serif;
                font-size: 0.9rem;
            }

            .nav-link {
                font-size: 1rem;
                padding: 0.45rem 1rem;
            }

            .search-container {
                padding: 0.75rem 0.5rem 0.5rem 0.5rem;
            }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
            .hero-title {
                font-size: 1.8rem;
            }

            .hero-subtitle {
                font-size: 1rem;
            }

            .accordion-header {
                font-size: 1.15rem;
                padding: 0.8rem 0.9rem;
            }

            .accordion.open .accordion-content {
                padding: 0.9rem 0.9rem 0.9rem 0.9rem;
            }

            .scroll-to-top {
                bottom: 1.5rem;
                right: 1.5rem;
                width: 45px;
                height: 45px;
                font-size: 1.3rem;
            }
        }

        /* Intro text styles */
        .intro-text {
            font-size: 1.04rem;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .intro-note {
            font-size: 0.97em;
            color: #555;
            opacity: 0.9;
            margin-top: 0.5rem;
        }

        .table-note {
            font-size: 0.97rem;
            color: #555;
            margin-top: -1rem;
            margin-bottom: 1.5rem;
            font-style: italic;
        }
    </style>
</head>

<body>

    <!-- HERO SECTION -->
    <section class="hero-section">
        <div class="hero-content">
            <div class="hero-title">Record Book</div>
            <div class="hero-subtitle">Program History</div>
        </div>
    </section>

    <!-- TOP NAVIGATION BAR -->
    <nav class="records-nav">
        <div class="records-nav-inner">
            <a href="/team-records/program-history" class="nav-link active">Program History</a>
            <a href="/team-records/individual-records" class="nav-link">Individual Records</a>
            <a href="/team-records/team-records-data" class="nav-link">Team Records</a>
            <a href="/team-records/year-by-year" class="nav-link">Year by Year</a>
            <a href="/team-records/playoffs" class="nav-link">Playoffs</a>
        </div>
    </nav>

    <!-- SEARCH BAR -->
    <div class="search-container">
        <div class="search-wrapper">
            <input 
                type="text" 
                class="search-input" 
                id="searchInput" 
                placeholder="Search records, players, coaches..."
                autocomplete="off"
            >
        </div>
    </div>

    <!-- CONTENT WRAPPER (SIDEBAR + MAIN) -->
    <div class="content-wrapper">
        
        <!-- STICKY SIDEBAR NAVIGATION -->
        <aside class="sidebar-nav">
            <div class="sidebar-title">Jump to Section</div>
            <div class="sidebar-links">
                <a href="#season-coach" class="sidebar-link" data-section="season-coach">Season & Coaching Records</a>
                <a href="#mlb-draft" class="sidebar-link" data-section="mlb-draft">MLB Draft History</a>
                <a href="#honors" class="sidebar-link" data-section="honors">Honors & Awards</a>
                <a href="#series" class="sidebar-link" data-section="series">All-Time Series Records</a>
            </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="main-content">

            <!-- ACCORDION 1: Season & Coaching Records -->
            <section class="accordion" id="season-coach">
                <div class="accordion-header">
                    <span>Season & Coaching Records</span>
                    <span class="accordion-arrow">►</span>
                </div>
                <div class="accordion-content">
                    
                    <div class="intro-text">
                        <strong>Charlottesville Tom Sox season-by-season results since 2015.</strong> 
                        Championship years are <span style="color:var(--tomsox-green);">highlighted</span>.
                        <div class="intro-note">* Corey Hunt is the winningest head coach in team history.</div>
                    </div>

                    <!-- Season Records Table -->
                    <div class="table-category">
                        <div style="overflow-x:auto;">
                            <table class="records-table" aria-label="Tom Sox Season Records">
                                <thead>
                                    <tr>
                                        <th>Season</th>
                                        <th>Head Coach</th>
                                        <th>Record</th>
                                        <th>Pct</th>
                                        <th>Finish</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Season">2015</td>
                                        <td data-label="Head Coach">Mike Goldberg</td>
                                        <td data-label="Record">18–25</td>
                                        <td data-label="Pct">.419</td>
                                        <td data-label="Finish">Lost in play-in game</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Season">2016</td>
                                        <td data-label="Head Coach">Travis Thomas</td>
                                        <td data-label="Record">15–27</td>
                                        <td data-label="Pct">.357</td>
                                        <td data-label="Finish">Regular season</td>
                                    </tr>
                                    <tr class="championship">
                                        <td data-label="Season">2017 <span class="champ-badge">🏆 Champs</span></td>
                                        <td data-label="Head Coach">Corey Hunt</td>
                                        <td data-label="Record" class="champion-cell">38–11</td>
                                        <td data-label="Pct" class="champion-cell">.776</td>
                                        <td data-label="Finish">Won Championship</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Season">2018</td>
                                        <td data-label="Head Coach">Corey Hunt</td>
                                        <td data-label="Record">27–21</td>
                                        <td data-label="Pct">.563</td>
                                        <td data-label="Finish">Lost Championship</td>
                                    </tr>
                                    <tr class="championship">
                                        <td data-label="Season">2019 <span class="champ-badge">🏆 Champs</span></td>
                                        <td data-label="Head Coach">Corey Hunt</td>
                                        <td data-label="Record" class="champion-cell">31–19</td>
                                        <td data-label="Pct" class="champion-cell">.620</td>
                                        <td data-label="Finish">Won Championship</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Season">2021*</td>
                                        <td data-label="Head Coach">Kory Koehler</td>
                                        <td data-label="Record">30–12</td>
                                        <td data-label="Pct">.711</td>
                                        <td data-label="Finish">Lost in first round</td>
                                    </tr>
                                    <tr class="championship">
                                        <td data-label="Season">2022 <span class="champ-badge">🏆 Champs</span></td>
                                        <td data-label="Head Coach">Ramon Garza</td>
                                        <td data-label="Record" class="champion-cell">32–16</td>
                                        <td data-label="Pct" class="champion-cell">.667</td>
                                        <td data-label="Finish">Won Championship</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Season">2023</td>
                                        <td data-label="Head Coach">Lyndon Coleman</td>
                                        <td data-label="Record">32–20</td>
                                        <td data-label="Pct">.615</td>
                                        <td data-label="Finish">Lost Championship</td>
                                    </tr>
                                    <tr class="championship">
                                        <td data-label="Season">2024 <span class="champ-badge">🏆 Champs</span></td>
                                        <td data-label="Head Coach">Randy Tomlin</td>
                                        <td data-label="Record" class="champion-cell">30–15</td>
                                        <td data-label="Pct" class="champion-cell">.667</td>
                                        <td data-label="Finish">Won Championship</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Season" colspan="2"><strong>OVERALL</strong></td>
                                        <td data-label="Record"><strong>253–166</strong></td>
                                        <td data-label="Pct"><strong>.604</strong></td>
                                        <td data-label="Finish"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-note">
                            Kory Koehler missed the first 4 games of 2021 (Mike Paduano was interim, 3-1 record).
                        </div>
                    </div>

                    <!-- Coaching Records Table -->
                    <div class="table-category">
                        <div class="table-category-header">
                            <h3 class="table-category-title">All-Time Coaching Records</h3>
                        </div>
                        <div style="overflow-x:auto;">
                            <table class="records-table" aria-label="All-Time Coaching Records">
                                <thead>
                                    <tr>
                                        <th>Years</th>
                                        <th>Coach</th>
                                        <th>Seasons</th>
                                        <th>Games</th>
                                        <th>W–L</th>
                                        <th>Pct</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Years">2015</td>
                                        <td data-label="Coach">Mike Goldberg</td>
                                        <td data-label="Seasons">1</td>
                                        <td data-label="Games">43</td>
                                        <td data-label="W–L">18–25</td>
                                        <td data-label="Pct">.419</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Years">2016</td>
                                        <td data-label="Coach">Travis Thomas</td>
                                        <td data-label="Seasons">1</td>
                                        <td data-label="Games">42</td>
                                        <td data-label="W–L">15–27</td>
                                        <td data-label="Pct">.357</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Years">2017–19</td>
                                        <td data-label="Coach">Corey Hunt</td>
                                        <td data-label="Seasons">3</td>
                                        <td data-label="Games">132*</td>
                                        <td data-label="W–L">96–51</td>
                                        <td data-label="Pct">.652</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Years">2020–21</td>
                                        <td data-label="Coach">Kory Koehler</td>
                                        <td data-label="Seasons">1</td>
                                        <td data-label="Games">38^</td>
                                        <td data-label="W–L">27–11</td>
                                        <td data-label="Pct">.711</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Years">2022</td>
                                        <td data-label="Coach">Ramon Garza</td>
                                        <td data-label="Seasons">1</td>
                                        <td data-label="Games">48</td>
                                        <td data-label="W–L">32–16</td>
                                        <td data-label="Pct">.667</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Years">2023</td>
                                        <td data-label="Coach">Lyndon Coleman</td>
                                        <td data-label="Seasons">1</td>
                                        <td data-label="Games">52</td>
                                        <td data-label="W–L">32–20</td>
                                        <td data-label="Pct">.615</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Years">2024</td>
                                        <td data-label="Coach">Randy Tomlin</td>
                                        <td data-label="Seasons">1</td>
                                        <td data-label="Games">45</td>
                                        <td data-label="W–L">30–15</td>
                                        <td data-label="Pct">.667</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="table-note">
                            * Hunt missed 15 games; assistants filled in (wins credited to Hunt). ^ See 2021 interim note.
                        </div>
                    </div>

                </div>
            </section>

            <!-- ACCORDION 2: MLB Draft History -->
            <section class="accordion" id="mlb-draft">
                <div class="accordion-header">
                    <span>MLB Draft History</span>
                    <span class="accordion-arrow">►</span>
                </div>
                <div class="accordion-content">
                    
                    <div class="intro-text">
                        Over 60 Tom Sox players have been selected in the MLB Draft, with recent first-round picks 
                        <span class="mlb-highlight">Wyatt Langford (2023, #4 overall, Rangers)</span> and 
                        <span class="mlb-highlight">Trey Yesavage (2024, #20 overall, Blue Jays)</span>.
                    </div>

                    <div class="table-category">
                        <div class="table-category-header">
                            <h3 class="table-category-title">MLB Draft Selections</h3>
                            <button class="show-more-btn collapsed" data-table="mlb-draft-table">
                                <span class="btn-text">Show All</span> <span class="btn-arrow">▼</span>
                            </button>
                        </div>
                        <div style="overflow-x:auto;">
                            <table class="records-table" id="mlb-draft-table" aria-label="MLB Draft History">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Player</th>
                                        <th>Pos.</th>
                                        <th>MLB Team</th>
                                        <th>Round (Pick)</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- 2024 Draft Class -->
                                    <tr class="mlb-first">
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Trey Yesavage</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Blue Jays</td>
                                        <td data-label="Round (Pick)" class="mlb-pick">1 (20)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Davian Garcia</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Nationals</td>
                                        <td data-label="Round (Pick)">6 (170)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Fisher Jameson</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Rockies</td>
                                        <td data-label="Round (Pick)">10 (288)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Carter Cunningham</td>
                                        <td data-label="Pos.">OF</td>
                                        <td data-label="MLB Team">Blue Jays</td>
                                        <td data-label="Round (Pick)">10 (307)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">James Nunnallee</td>
                                        <td data-label="Pos.">C</td>
                                        <td data-label="MLB Team">Brewers</td>
                                        <td data-label="Round (Pick)">14 (425)</td>
                                        <td data-label="Notes">didn't sign</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Jordan Little</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Reds</td>
                                        <td data-label="Round (Pick)">15 (449)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Wyatt Lunsford-Shenkman</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Mariners</td>
                                        <td data-label="Round (Pick)">16 (483)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Christian Martin</td>
                                        <td data-label="Pos.">SS</td>
                                        <td data-label="MLB Team">Cardinals</td>
                                        <td data-label="Round (Pick)">18 (531)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Chase Centala</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Marlins</td>
                                        <td data-label="Round (Pick)">20 (604)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2024</td>
                                        <td data-label="Player">Chandler Marsh</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Mets</td>
                                        <td data-label="Round (Pick)">free agent</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    
                                    <!-- 2023 Draft Class -->
                                    <tr class="mlb-first table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Wyatt Langford</td>
                                        <td data-label="Pos.">OF</td>
                                        <td data-label="MLB Team">Rangers</td>
                                        <td data-label="Round (Pick)" class="mlb-pick">1 (4)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Jack Hurley</td>
                                        <td data-label="Pos.">OF</td>
                                        <td data-label="MLB Team">Diamondbacks</td>
                                        <td data-label="Round (Pick)">3 (80)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Cole Foster</td>
                                        <td data-label="Pos.">SS</td>
                                        <td data-label="MLB Team">Giants</td>
                                        <td data-label="Round (Pick)">3 (85)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Cooper Ingle</td>
                                        <td data-label="Pos.">C</td>
                                        <td data-label="MLB Team">Guardians</td>
                                        <td data-label="Round (Pick)">4 (125)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Christian Worley</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Cardinals</td>
                                        <td data-label="Round (Pick)">9 (275)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Brady Kirtner</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Mets</td>
                                        <td data-label="Round (Pick)">12 (366)</td>
                                        <td data-label="Notes">didn't sign</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Marty Gair</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Phillies</td>
                                        <td data-label="Round (Pick)">13 (403)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Elijah Nuñez</td>
                                        <td data-label="Pos.">OF</td>
                                        <td data-label="MLB Team">Nationals</td>
                                        <td data-label="Round (Pick)">14 (405)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Garrett Wright</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">White Sox</td>
                                        <td data-label="Round (Pick)">20 (599)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Pierce Bennett</td>
                                        <td data-label="Pos.">2B</td>
                                        <td data-label="MLB Team">Phillies</td>
                                        <td data-label="Round (Pick)">20 (613)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Carter Spivey</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">East Carolina</td>
                                        <td data-label="Round (Pick)">free agent</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    
                                    <!-- 2022 Draft Class -->
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Trace Bright</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Orioles</td>
                                        <td data-label="Round (Pick)">5 (137)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Carson Skipper</td>
                                        <td data-label="Pos.">RHP</td>
                                        <td data-label="MLB Team">Rockies</td>
                                        <td data-label="Round (Pick)">11 (326)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Satchell Norman</td>
                                        <td data-label="Pos.">C</td>
                                        <td data-label="MLB Team">Brewers</td>
                                        <td data-label="Round (Pick)">15 (462)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                    <!-- 2017 Sample -->
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2017</td>
                                        <td data-label="Player">Billy Cooke</td>
                                        <td data-label="Pos.">OF</td>
                                        <td data-label="MLB Team">Mariners</td>
                                        <td data-label="Round (Pick)">8 (243)</td>
                                        <td data-label="Notes"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </section>

            <!-- ACCORDION 3: Honors & Awards -->
            <section class="accordion" id="honors">
                <div class="accordion-header">
                    <span>Honors & Awards</span>
                    <span class="accordion-arrow">►</span>
                </div>
                <div class="accordion-content">
                    
                    <div class="honors-subheading">VBL Most Valuable Player</div>
                    <div style="margin-bottom: 1.5rem;">
                        <span class="honors-winner">Michael Wielansky (2017)</span>
                    </div>

                    <div class="honors-subheading">VBL Pitcher of the Year</div>
                    <div style="margin-bottom: 1.5rem;">
                        <span class="honors-winner">Hayden McCutcheon (2015)</span>, 
                        <span class="honors-winner">Jared Wetherbee (2018)</span>, 
                        <span class="honors-winner">Mark Perkins (2023)</span>
                    </div>

                    <div class="honors-subheading">VBL Manager of the Year</div>
                    <div style="margin-bottom: 1.5rem;">
                        <span class="honors-winner">Corey Hunt (2017)</span>, 
                        <span class="honors-winner">Kory Koehler (2021)</span>
                    </div>

                    <div class="table-category">
                        <div class="table-category-header">
                            <h3 class="table-category-title">All-Valley League First Team Selections</h3>
                            <button class="show-more-btn collapsed" data-table="honors-table">
                                <span class="btn-text">Show All</span> <span class="btn-arrow">▼</span>
                            </button>
                        </div>
                        <div style="overflow-x:auto;">
                            <table class="records-table" id="honors-table" aria-label="All-Valley League First Team">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Player</th>
                                        <th>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Year">2015</td>
                                        <td data-label="Player">Hayden McCutcheon</td>
                                        <td data-label="Position">SP</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2015</td>
                                        <td data-label="Player">Daniel Johnson</td>
                                        <td data-label="Position">RP</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2017</td>
                                        <td data-label="Player">Michael Wielansky</td>
                                        <td data-label="Position">2B</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2017</td>
                                        <td data-label="Player">Rick Spiers</td>
                                        <td data-label="Position">UTL</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Year">2017</td>
                                        <td data-label="Player">Sean McCracken</td>
                                        <td data-label="Position">SP</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2018</td>
                                        <td data-label="Player">Dominic D'Alessandro</td>
                                        <td data-label="Position">DH</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2018</td>
                                        <td data-label="Player">Jared Wetherbee</td>
                                        <td data-label="Position">SP</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2019</td>
                                        <td data-label="Player">Cayman Richardson</td>
                                        <td data-label="Position">OF</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2019</td>
                                        <td data-label="Player">Thomas Francisco</td>
                                        <td data-label="Position">DH</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2021</td>
                                        <td data-label="Player">Adam Cecere</td>
                                        <td data-label="Position">DH</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">John Armstrong</td>
                                        <td data-label="Position">RP</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Carter Cunningham</td>
                                        <td data-label="Position">OF</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Christian Martin</td>
                                        <td data-label="Position">2B</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Satchell Norman</td>
                                        <td data-label="Position">C</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Cole Wagner</td>
                                        <td data-label="Position">1B</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2022</td>
                                        <td data-label="Player">Trey Yesavage</td>
                                        <td data-label="Position">SP</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Mark Perkins</td>
                                        <td data-label="Position">SP</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Year">2023</td>
                                        <td data-label="Player">Mike Eggert</td>
                                        <td data-label="Position">RP</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </section>

            <!-- ACCORDION 4: All-Time Series Records -->
            <section class="accordion" id="series">
                <div class="accordion-header">
                    <span>All-Time Series Records</span>
                    <span class="accordion-arrow">►</span>
                </div>
                <div class="accordion-content">
                    
                    <div class="intro-text">
                        <strong>Charlottesville Tom Sox all-time records vs each VBL opponent.</strong><br>
                        Winning records are shown in <span style="color:var(--tomsox-green);">green</span>.
                    </div>

                    <div class="table-category">
                        <div class="table-category-header">
                            <h3 class="table-category-title">Head-to-Head Records</h3>
                            <button class="show-more-btn collapsed" data-table="series-table">
                                <span class="btn-text">Show All</span> <span class="btn-arrow">▼</span>
                            </button>
                        </div>
                        <div style="overflow-x:auto;">
                            <table class="records-table" id="series-table" aria-label="All-Time Series Records">
                                <thead>
                                    <tr>
                                        <th>Opponent</th>
                                        <th>Overall</th>
                                        <th>Home</th>
                                        <th>Away</th>
                                        <th>Postseason</th>
                                        <th>Current Streak</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Opponent">Front Royal Cardinals</td>
                                        <td data-label="Overall" class="series-win">19–6</td>
                                        <td data-label="Home" class="series-win">11–2</td>
                                        <td data-label="Away" class="series-win">8–4</td>
                                        <td data-label="Postseason" class="series-win">2–1</td>
                                        <td data-label="Current Streak">W1</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Opponent">Purcellville Cannons</td>
                                        <td data-label="Overall" class="series-win">18–7</td>
                                        <td data-label="Home" class="series-win">10–2</td>
                                        <td data-label="Away" class="series-win">8–5</td>
                                        <td data-label="Postseason" class="series-win">2–1</td>
                                        <td data-label="Current Streak">W1</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Opponent">Covington Lumberjacks</td>
                                        <td data-label="Overall" class="series-win">38–23</td>
                                        <td data-label="Home" class="series-win">19–9</td>
                                        <td data-label="Away" class="series-win">17–14</td>
                                        <td data-label="Postseason" class="series-win">5–2</td>
                                        <td data-label="Current Streak">L1</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Opponent">Waynesboro Generals</td>
                                        <td data-label="Overall" class="series-win">38–27</td>
                                        <td data-label="Home" class="series-win">22–12</td>
                                        <td data-label="Away" class="series-win">16–15</td>
                                        <td data-label="Postseason" class="series-win">6–3</td>
                                        <td data-label="Current Streak">W4</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Opponent">Staunton Braves</td>
                                        <td data-label="Overall" class="series-win">38–24</td>
                                        <td data-label="Home" class="series-win">23–9</td>
                                        <td data-label="Away">15–16</td>
                                        <td data-label="Postseason" class="series-win">4–1</td>
                                        <td data-label="Current Streak">W1</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Opponent">Woodstock River Bandits</td>
                                        <td data-label="Overall" class="series-win">16–8</td>
                                        <td data-label="Home" class="series-win">8–5</td>
                                        <td data-label="Away" class="series-win">8–3</td>
                                        <td data-label="Postseason" class="series-win">2–0</td>
                                        <td data-label="Current Streak">W2</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Opponent">Culpeper Cavaliers</td>
                                        <td data-label="Overall" class="series-win">10–5</td>
                                        <td data-label="Home" class="series-win">5–3</td>
                                        <td data-label="Away" class="series-win">5–2</td>
                                        <td data-label="Postseason" class="series-win">2–1</td>
                                        <td data-label="Current Streak">W2</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Opponent">Strasburg Express</td>
                                        <td data-label="Overall" class="series-win">18–12</td>
                                        <td data-label="Home" class="series-win">9–6</td>
                                        <td data-label="Away" class="series-win">9–6</td>
                                        <td data-label="Postseason" class="series-win">6–2</td>
                                        <td data-label="Current Streak">W2</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Opponent">Winchester Royals</td>
                                        <td data-label="Overall" class="series-win">13–9</td>
                                        <td data-label="Home" class="series-win">8–3</td>
                                        <td data-label="Away">5–6</td>
                                        <td data-label="Postseason"></td>
                                        <td data-label="Current Streak">L1</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Opponent">Harrisonburg Turks</td>
                                        <td data-label="Overall" class="series-win">30–29</td>
                                        <td data-label="Home" class="series-win">19–11</td>
                                        <td data-label="Away">11–18</td>
                                        <td data-label="Postseason">0–2</td>
                                        <td data-label="Current Streak">W1</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Opponent">New Market Rebels</td>
                                        <td data-label="Overall">13–15</td>
                                        <td data-label="Home">8–7</td>
                                        <td data-label="Away">5–8</td>
                                        <td data-label="Postseason">0–2</td>
                                        <td data-label="Current Streak">W1</td>
                                    </tr>
                                    <tr class="table-row-hidden">
                                        <td data-label="Opponent">Aldie Senators</td>
                                        <td data-label="Overall" class="series-win">2–0</td>
                                        <td data-label="Home" class="series-win">1–0</td>
                                        <td data-label="Away" class="series-win">1–0</td>
                                        <td data-label="Postseason">0–0</td>
                                        <td data-label="Current Streak">W2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </section>

        </main>

    </div>

    <!-- SCROLL-TO-TOP BUTTON -->
    <button class="scroll-to-top" id="scrollToTop" aria-label="Scroll to top">↑</button>

    <!-- JAVASCRIPT -->
    <script>
        // =========================================
        // 1. ACCORDION FUNCTIONALITY
        // =========================================
        const accordions = document.querySelectorAll('.accordion');
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const accordion = this.parentElement;
                const isOpen = accordion.classList.contains('open');
                
                // Close all accordions
                accordions.forEach(acc => acc.classList.remove('open'));
                
                // Open clicked accordion if it wasn't already open
                if (!isOpen) {
                    accordion.classList.add('open');
                }
            });
        });

        // =========================================
        // 2. SIDEBAR NAVIGATION
        // =========================================
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        const sections = document.querySelectorAll('.accordion');

        // Click handler for sidebar links
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                const targetSection = document.getElementById(sectionId);
                
                if (targetSection) {
                    // Close all accordions
                    accordions.forEach(acc => acc.classList.remove('open'));
                    
                    // Open target accordion
                    targetSection.classList.add('open');
                    
                    // Scroll to section
                    setTimeout(() => {
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                    
                    // Update active state
                    updateSidebarActive(sectionId);
                }
            });
        });

        // Update active sidebar link based on scroll position
        function updateSidebarActive(activeSectionId = null) {
            if (activeSectionId) {
                sidebarLinks.forEach(link => {
                    if (link.getAttribute('data-section') === activeSectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                return;
            }

            // Auto-detect based on scroll position
            const scrollPos = window.scrollY + 150;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionId = section.id;
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    sidebarLinks.forEach(link => {
                        if (link.getAttribute('data-section') === sectionId) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }

        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(function() {
                updateSidebarActive();
            });
        });

        // =========================================
        // 3. SHOW MORE/LESS BUTTONS
        // =========================================
        const showMoreButtons = document.querySelectorAll('.show-more-btn');

        showMoreButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tableId = this.getAttribute('data-table');
                const table = document.getElementById(tableId);
                const hiddenRows = table.querySelectorAll('.table-row-hidden');
                const btnText = this.querySelector('.btn-text');
                const btnArrow = this.querySelector('.btn-arrow');
                
                if (this.classList.contains('collapsed')) {
                    // Show all rows
                    hiddenRows.forEach(row => {
                        row.classList.remove('table-row-hidden');
                    });
                    this.classList.remove('collapsed');
                    this.classList.add('expanded');
                    btnText.textContent = 'Show Less';
                    btnArrow.textContent = '▲';
                } else {
                    // Hide rows after index 4 (keeping first 5 visible)
                    const allRows = Array.from(table.querySelectorAll('tbody tr'));
                    allRows.forEach((row, index) => {
                        if (index >= 5) {
                            row.classList.add('table-row-hidden');
                        }
                    });
                    this.classList.remove('expanded');
                    this.classList.add('collapsed');
                    btnText.textContent = 'Show All';
                    btnArrow.textContent = '▼';
                }
            });
        });

        // =========================================
        // 4. SEARCH FUNCTIONALITY
        // =========================================
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const searchTerm = this.value.trim().toLowerCase();
            
            if (searchTerm.length < 2) {
                clearSearch();
                return;
            }
            
            // Debounce search
            searchTimeout = setTimeout(() => {
                performSearch(searchTerm);
            }, 300);
        });

        function performSearch(searchTerm) {
            let foundMatch = false;
            let firstMatchSection = null;
            
            // Clear previous highlights
            clearSearch();
            
            // Search through all tables
            const allTables = document.querySelectorAll('.records-table');
            
            allTables.forEach(table => {
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    let rowMatch = false;
                    
                    cells.forEach(cell => {
                        const cellText = cell.textContent.toLowerCase();
                        if (cellText.includes(searchTerm)) {
                            rowMatch = true;
                            foundMatch = true;
                        }
                    });
                    
                    if (rowMatch) {
                        // Highlight the row
                        row.classList.add('search-highlight');
                        
                        // Remove table-row-hidden class to reveal the row
                        row.classList.remove('table-row-hidden');
                        
                        // Find the accordion containing this table
                        const accordion = row.closest('.accordion');
                        if (accordion && !firstMatchSection) {
                            firstMatchSection = accordion;
                        }
                    }
                });
            });
            
            // If matches found, open the first accordion with matches and scroll to it
            if (foundMatch && firstMatchSection) {
                // Close all accordions
                accordions.forEach(acc => acc.classList.remove('open'));
                
                // Open accordion with first match
                firstMatchSection.classList.add('open');
                
                // Update sidebar
                updateSidebarActive(firstMatchSection.id);
                
                // Scroll to first match
                setTimeout(() => {
                    const firstHighlightedRow = document.querySelector('.search-highlight');
                    if (firstHighlightedRow) {
                        firstHighlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 200);
            }
        }

        function clearSearch() {
            // Remove all search highlights
            document.querySelectorAll('.search-highlight').forEach(row => {
                row.classList.remove('search-highlight');
            });
            
            // Re-hide rows that should be hidden (if show more buttons are collapsed)
            showMoreButtons.forEach(button => {
                if (button.classList.contains('collapsed')) {
                    const tableId = button.getAttribute('data-table');
                    const table = document.getElementById(tableId);
                    const allRows = Array.from(table.querySelectorAll('tbody tr'));
                    allRows.forEach((row, index) => {
                        if (index >= 5 && !row.classList.contains('search-highlight')) {
                            row.classList.add('table-row-hidden');
                        }
                    });
                }
            });
        }

        // =========================================
        // 5. SCROLL-TO-TOP BUTTON
        // =========================================
        const scrollToTopBtn = document.getElementById('scrollToTop');

        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // =========================================
        // 6. INITIALIZE
        // =========================================
        // All accordions start closed - no active sidebar link needed on initial load
    </script>

</body>
</html>
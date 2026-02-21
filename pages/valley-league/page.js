/*
  File: page.js
  Page: valley-league
  Description: Google Maps integration for all 12 VBL team locations.
               Supports deep-link scroll-to-map and team panel open via URL hash.
  Last Updated: 2026-02-21

  Deep Link Format:
    Scroll to map only:       #vbl-map
    Scroll + open team panel: #vbl-team-harrisonburg-turks
*/

// ============================================================
// GOOGLE MAPS API KEY
// Restrict this key in Google Cloud Console to your domain(s).
// ============================================================
const GOOGLE_MAPS_API_KEY = 'AIzaSyCX3lGKd8JzKiReHrwlQe5AtxjIelCKN5M';

// ============================================================
// TEAM DATA
// Single source of truth — synced with section-teams.html
// slug: URL-safe identifier used for deep linking
// ============================================================
const vblTeams = [
  // South Division
  {
    name: 'Charlottesville Tom Sox',
    slug: 'charlottesville-tom-sox',
    color1: '#1f375c',
    color2: '#8cbc0d',
    ballpark: 'CHO Field at Charlottesville High School',
    address: '1400 Melbourne Street, Charlottesville, VA 22901',
    website: 'https://www.tomsox.org',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908ddd580d6c26157bbf5.png',
    division: 'South',
    lat: 38.0409,
    lng: -78.4736
  },
  {
    name: 'Harrisonburg Turks',
    slug: 'harrisonburg-turks',
    color1: '#df001c',
    color2: '#000000',
    ballpark: 'Veterans Memorial Stadium',
    address: '270 Veterans Memorial Dr., Harrisonburg, VA 22801',
    website: 'https://harrisonburgturks.com',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/6985555a0a7fd15ec99f2c25.png',
    division: 'South',
    lat: 38.4496,
    lng: -78.8689
  },
  {
    name: 'Staunton Braves',
    slug: 'staunton-braves',
    color1: '#2833f1',
    color2: '#d70017',
    ballpark: 'Ted Bosiak Field at John Moxie Memorial Stadium',
    address: 'Thornrose Drive, Staunton, VA',
    website: 'https://www.stauntonbravesbaseball.com',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/69853d500a7fd1eebd9bc89f.png',
    division: 'South',
    lat: 38.1496,
    lng: -79.0717
  },
  {
    name: 'Waynesboro Generals',
    slug: 'waynesboro-generals',
    color1: '#cd0024',
    color2: '#39196b',
    ballpark: 'Prosperity Home Mortgage Park',
    address: '1625 Ivy Street, Waynesboro, VA',
    website: 'https://www.waynesborogenerals.net',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908dcefa0f0bfb976d979.png',
    division: 'South',
    lat: 38.0685,
    lng: -78.8895
  },
  {
    name: 'Covington Lumberjacks',
    slug: 'covington-lumberjacks',
    color1: '#142a40',
    color2: '#2f89c8',
    ballpark: 'Casey Field',
    address: '1390 S. Craig Street, Covington, VA 24426',
    website: 'https://www.covingtonlumberjacks.com',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908dcefa0f0541e76d97a.png',
    division: 'South',
    lat: 37.7779,
    lng: -79.9939
  },
  {
    name: 'Culpeper Cavaliers',
    slug: 'culpeper-cavaliers',
    color1: '#041937',
    color2: '#f0d848',
    ballpark: 'Culpeper County High School',
    address: '14240 Achievement Drive, Culpeper, VA 22701',
    website: 'https://culpepercavaliers.org',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908dcefa0f0580a76d977.webp',
    division: 'South',
    lat: 38.4732,
    lng: -77.9947
  },

  // North Division
  {
    name: 'New Market Rebels',
    slug: 'new-market-rebels',
    color1: '#0726a1',
    color2: '#c8a52e',
    ballpark: 'Rebel Park',
    address: 'Dixie Lane, New Market, VA',
    website: 'https://www.newmarketrebels.com',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908ddd580d65f1a57bbf6.png',
    division: 'North',
    lat: 38.6479,
    lng: -78.6719
  },
  {
    name: 'Woodstock River Bandits',
    slug: 'woodstock-river-bandits',
    color1: '#123a11',
    color2: '#e1542b',
    ballpark: 'Falcon Field',
    address: '1147 Susan Avenue, Woodstock, VA 22664',
    website: 'https://woodstockriverbandits.org',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908dc0d42f97efe9924f4.png',
    division: 'North',
    lat: 38.8818,
    lng: -78.5058
  },
  {
    name: 'Strasburg Express',
    slug: 'strasburg-express',
    color1: '#8518d6',
    color2: '#4b2c83',
    ballpark: 'First Bank Park',
    address: '162 Stickley Loop, Strasburg, VA',
    website: 'https://strasburgexpress.org',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908dcefa0f0956d76d976.png',
    division: 'North',
    lat: 38.9887,
    lng: -78.3586
  },
  {
    name: 'Purcellville Cannons',
    slug: 'purcellville-cannons',
    color1: '#47232f',
    color2: '#c2ad81',
    ballpark: "Fireman's Field",
    address: '250 Nursery Street, Purcellville, VA',
    website: 'https://www.purcellvillecannons.org',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908ddd580d6c64057bbf7.png',
    division: 'North',
    lat: 39.1368,
    lng: -77.7147
  },
  {
    name: 'Winchester Royals',
    slug: 'winchester-royals',
    color1: '#164a02',
    color2: '#bbae6f',
    ballpark: 'Bridgeforth Stadium',
    address: '1037 Cork Street, Winchester, VA',
    website: 'https://winchesterroyals.org',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908dc91bb123249e33c6a.png',
    division: 'North',
    lat: 39.1857,
    lng: -78.1633
  },
  {
    name: 'Front Royal Cardinals',
    slug: 'front-royal-cardinals',
    color1: '#f10008',
    color2: '#000000',
    ballpark: 'David L. Wines Field at Bing Crosby Stadium',
    address: '50 Stadium Drive, Front Royal, VA',
    website: 'https://www.frontroyalcardinals.org',
    logo: 'https://storage.googleapis.com/msgsndr/Ro4CBx71xU0mNBfRkMkf/media/689908dc861757379e3e7a85.png',
    division: 'North',
    lat: 38.9181,
    lng: -78.1944
  }
];

// ============================================================
// STATE
// ============================================================
let map;
let markers = [];
let currentTeam = null;


// ============================================================
// DEEP LINK SUPPORT
//
// #vbl-map                        → scroll to map section
// #vbl-team-harrisonburg-turks    → scroll to map + open panel
//
// The hash is also updated by JS when a user clicks a marker,
// so any open panel state becomes a shareable URL.
// ============================================================

function parseDeepLink() {
  const hash = window.location.hash.replace('#', '');
  if (!hash.startsWith('vbl-team-')) return null;
  const slug = hash.replace('vbl-team-', '');
  return vblTeams.find(function(t) { return t.slug === slug; }) || null;
}

function handleDeepLink() {
  const team = parseDeepLink();
  if (!team) return;

  const section = document.getElementById('vbl-map');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Short delay lets the scroll animation begin before the panel opens
  setTimeout(function() {
    openTeamPanel(team);
    if (map) {
      map.panTo({ lat: team.lat, lng: team.lng });
    }
  }, 420);
}


// ============================================================
// GOOGLE MAPS INITIALIZATION
// ============================================================

function loadGoogleMapsAPI() {
  if (window.google && window.google.maps) {
    initMap();
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_API_KEY + '&callback=initMap';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initMap() {
  map = new google.maps.Map(document.getElementById('vblMap'), {
    zoom: 8,
    center: { lat: 38.5, lng: -78.5 },
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ],
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true
  });

  var tooltip = document.getElementById('vbl-map-tooltip');

  vblTeams.forEach(function(team) {
    var pinColor = team.division === 'North' ? '#1b365d' : '#84BD00';

    var markerSvg = [
      '<svg width="50" height="70" viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg">',
        '<path d="M 25,70 Q 20,65 25,65 Q 30,65 25,70" fill="rgba(0,0,0,0.3)"/>',
        '<path d="M 25,65 C 10,40 2,35 2,23 C 2,10.3 12.3,0 25,0 C 37.7,0 48,10.3 48,23 C 48,35 40,40 25,65 Z" fill="' + pinColor + '" stroke="white" stroke-width="2"/>',
        '<circle cx="25" cy="23" r="14" fill="white"/>',
        '<path d="M 18,12 Q 22,23 18,34" fill="none" stroke="#CC0000" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M 32,12 Q 28,23 32,34" fill="none" stroke="#CC0000" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M 18,15 L 19,15 M 18,19 L 20,19 M 19,23 L 21,23 M 18,27 L 20,27 M 18,31 L 19,31" stroke="#CC0000" stroke-width="1"/>',
        '<path d="M 32,15 L 31,15 M 32,19 L 30,19 M 31,23 L 29,23 M 32,27 L 30,27 M 32,31 L 31,31" stroke="#CC0000" stroke-width="1"/>',
      '</svg>'
    ].join('');

    var markerIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
      scaledSize: new google.maps.Size(45, 60),
      anchor: new google.maps.Point(22.5, 60)
    };

    var marker = new google.maps.Marker({
      position: { lat: team.lat, lng: team.lng },
      map: map,
      icon: markerIcon,
      optimized: false,
      title: team.name
    });

    // Click: open panel and update shareable URL hash
    marker.addListener('click', function() {
      openTeamPanel(team);
      map.panTo({ lat: team.lat, lng: team.lng });
      history.replaceState(null, '', '#vbl-team-' + team.slug);
    });

    // Hover tooltip (desktop only)
    marker.addListener('mouseover', function() {
      tooltip.innerHTML = '<strong>' + team.name + '</strong><br><span style="font-size:0.85em;opacity:0.85;">' + team.ballpark + '</span>';
      tooltip.style.borderColor = team.color1;
      tooltip.style.display = 'block';
    });

    marker.addListener('mousemove', function(e) {
      if (e.domEvent) {
        tooltip.style.left = (e.domEvent.clientX + 16) + 'px';
        tooltip.style.top  = (e.domEvent.clientY - 12) + 'px';
      }
    });

    marker.addListener('mouseout', function() {
      tooltip.style.display = 'none';
    });

    markers.push(marker);
  });

  var closeBtn = document.getElementById('panelClose');
  if (closeBtn) closeBtn.addEventListener('click', closeTeamPanel);

  var directionsBtn = document.getElementById('panelDirections');
  if (directionsBtn) directionsBtn.addEventListener('click', openDirections);

  // Process any deep link in the current URL
  handleDeepLink();
}


// ============================================================
// TEAM PANEL
// ============================================================

function openTeamPanel(team) {
  currentTeam = team;

  var content = document.getElementById('panelContent');
  var panel   = document.getElementById('vblTeamPanel');
  var header  = document.getElementById('panelHeader');
  var dirBtn  = document.getElementById('panelDirections');

  header.style.backgroundColor = team.color1;

  // Use color1 as fallback when color2 is too light for white text
  dirBtn.style.backgroundColor = isColorLight(team.color2) ? team.color1 : team.color2;

  var newHtml = [
    '<div class="vbl-team-header">',
      '<img src="' + team.logo + '" alt="' + team.name + ' logo" class="vbl-team-logo" onerror="this.style.display=\'none\'">',
      '<h3 style="color:' + team.color1 + '">' + team.name + '</h3>',
      '<span class="vbl-badge" style="background-color:' + team.color1 + '">' + team.division + ' Division</span>',
    '</div>',
    '<div class="vbl-team-details">',
      '<div class="detail-row">',
        '<strong style="color:' + team.color1 + '">Ballpark</strong>',
        '<span>' + team.ballpark + '</span>',
      '</div>',
      '<div class="detail-row">',
        '<strong style="color:' + team.color1 + '">Address</strong>',
        '<span>' + team.address + '</span>',
      '</div>',
      '<a href="' + team.website + '" target="_blank" rel="noopener noreferrer" class="vbl-website-link" style="color:' + team.color1 + '">',
        'Visit Team Website &raquo;',
      '</a>',
    '</div>'
  ].join('');

  if (panel.classList.contains('vbl-panel-open')) {
    content.classList.add('fade-out');
    setTimeout(function() {
      content.innerHTML = newHtml;
      content.classList.remove('fade-out');
    }, 250);
  } else {
    content.innerHTML = newHtml;
    panel.classList.add('vbl-panel-open');
  }
}

function closeTeamPanel() {
  document.getElementById('vblTeamPanel').classList.remove('vbl-panel-open');
  currentTeam = null;
  // Reset hash to map anchor (preserves scroll position context)
  history.replaceState(null, '', '#vbl-map');
}

function openDirections() {
  if (!currentTeam) return;
  window.open(
    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(currentTeam.address),
    '_blank',
    'noopener,noreferrer'
  );
}


// ============================================================
// UTILITY — CONTRAST CHECK
// Returns true if the hex color is light enough that white text
// would fail WCAG AA contrast. Caller should fall back to a
// darker color for the button background.
// ============================================================
function isColorLight(hex) {
  if (!hex || hex.length < 7) return false;
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance (simplified)
  var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}


// ============================================================
// BOOT
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGoogleMapsAPI);
} else {
  loadGoogleMapsAPI();
}

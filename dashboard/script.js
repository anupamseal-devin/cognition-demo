/* =========================================================
   Client Modernization Tracker — Dashboard Logic
   ========================================================= */

// --- Migration Streams Data ---
const migrationStreams = [
    {
        name: 'Core Banking COBOL',
        migrationType: 'Language',
        sourceTarget: 'COBOL \u2192 Java 17',
        status: 'In Progress',
        progress: 72,
        locMigrated: 285000,
        aiSessions: 342,
        hoursSaved: 3400,
        traditionalHours: 10200,
        lead: 'Sarah Chen'
    },
    {
        name: 'Customer Portal',
        migrationType: 'Framework',
        sourceTarget: 'Angular 8 \u2192 React 18',
        status: 'Complete',
        progress: 100,
        locMigrated: 198000,
        aiSessions: 276,
        hoursSaved: 2650,
        traditionalHours: 7950,
        lead: 'James Okafor'
    },
    {
        name: 'Payment Gateway',
        migrationType: 'Protocol',
        sourceTarget: 'SOAP \u2192 REST/gRPC',
        status: 'In Progress',
        progress: 58,
        locMigrated: 124000,
        aiSessions: 189,
        hoursSaved: 1820,
        traditionalHours: 5460,
        lead: 'Maria Lopez'
    },
    {
        name: 'Risk Analytics',
        migrationType: 'Language',
        sourceTarget: 'SAS \u2192 Python',
        status: 'Complete',
        progress: 100,
        locMigrated: 156000,
        aiSessions: 215,
        hoursSaved: 2100,
        traditionalHours: 7350,
        lead: 'David Kim'
    },
    {
        name: 'Data Warehouse',
        migrationType: 'Database',
        sourceTarget: 'DB2 \u2192 PostgreSQL',
        status: 'In Progress',
        progress: 45,
        locMigrated: 89000,
        aiSessions: 134,
        hoursSaved: 1350,
        traditionalHours: 4050,
        lead: 'Priya Sharma'
    },
    {
        name: 'Insurance Claims',
        migrationType: 'Language',
        sourceTarget: 'VB.NET \u2192 C# .NET 8',
        status: 'In Progress',
        progress: 63,
        locMigrated: 112000,
        aiSessions: 167,
        hoursSaved: 1580,
        traditionalHours: 5530,
        lead: 'Tom Bradley'
    },
    {
        name: 'Reporting Engine',
        migrationType: 'Platform',
        sourceTarget: 'Crystal Reports \u2192 Power BI',
        status: 'Complete',
        progress: 100,
        locMigrated: 67000,
        aiSessions: 98,
        hoursSaved: 920,
        traditionalHours: 2760,
        lead: 'Lisa Wang'
    },
    {
        name: 'Trade Settlement',
        migrationType: 'Language',
        sourceTarget: 'COBOL \u2192 Kotlin/JVM',
        status: 'Planning',
        progress: 12,
        locMigrated: 34000,
        aiSessions: 52,
        hoursSaved: 480,
        traditionalHours: 1680,
        lead: 'Alex Novak'
    },
    {
        name: 'Auth Platform',
        migrationType: 'Architecture',
        sourceTarget: 'Monolith \u2192 Microservices',
        status: 'In Progress',
        progress: 38,
        locMigrated: 78500,
        aiSessions: 112,
        hoursSaved: 1100,
        traditionalHours: 3300,
        lead: 'Rachel Green'
    },
    {
        name: 'Batch Processing',
        migrationType: 'Platform',
        sourceTarget: 'Mainframe JCL \u2192 Airflow',
        status: 'Planning',
        progress: 8,
        locMigrated: 21000,
        aiSessions: 31,
        hoursSaved: 310,
        traditionalHours: 930,
        lead: 'Omar Hassan'
    },
    {
        name: 'Document Mgmt',
        migrationType: 'Platform',
        sourceTarget: 'SharePoint \u2192 S3 + Lambda',
        status: 'In Progress',
        progress: 51,
        locMigrated: 56000,
        aiSessions: 145,
        hoursSaved: 1290,
        traditionalHours: 3870,
        lead: 'Nina Petrov'
    },
    {
        name: 'Mobile Backend',
        migrationType: 'Framework',
        sourceTarget: 'PHP Laravel \u2192 Node/Express',
        status: 'Complete',
        progress: 100,
        locMigrated: 27000,
        aiSessions: 87,
        hoursSaved: 1200,
        traditionalHours: 3600,
        lead: 'Kevin Zhao'
    }
];

// --- State ---
let currentFilter = 'All';
let currentSort = { key: null, direction: 'asc' };

// =========================================================
// Utility Functions
// =========================================================

/** Format a number with commas: 1234567 -> "1,234,567" */
function formatNumber(n) {
    return Math.round(n).toLocaleString('en-US');
}

/** Convert status text to a CSS-safe class name */
function statusClass(status) {
    return status.toLowerCase().replace(/\s+/g, '-');
}

/** Set the current date in the header */
function setCurrentDate() {
    var el = document.getElementById('currentDate');
    if (el) {
        var now = new Date();
        el.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// =========================================================
// Animated Counters
// =========================================================

/** Animate a single counter element from 0 to its data-target */
function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var format = el.getAttribute('data-format');
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 2000; // ms
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        // Cubic ease-out
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;

        var display = current.toFixed(decimals);
        if (format === 'number') {
            display = formatNumber(current);
        } else if (decimals > 0) {
            display = current.toFixed(decimals);
        } else {
            display = formatNumber(current);
        }

        el.textContent = prefix + display + suffix;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

/** Kick off all counter animations on the page */
function animateAllCounters() {
    var counters = document.querySelectorAll('.kpi-value, .fte-kpi-value');
    counters.forEach(function (el) {
        animateCounter(el);
    });
}

// =========================================================
// Overall Progress
// =========================================================

function renderOverallProgress() {
    var total = migrationStreams.length;
    var complete = migrationStreams.filter(function (s) { return s.status === 'Complete'; }).length;
    var sumProgress = migrationStreams.reduce(function (acc, s) { return acc + s.progress; }, 0);
    var pct = Math.round(sumProgress / total);

    var fill = document.getElementById('overallProgress');
    var pctEl = document.getElementById('progressPct');
    var detail = document.getElementById('progressDetail');

    if (fill) {
        // Trigger animation after a brief delay
        setTimeout(function () {
            fill.style.setProperty('--progress-width', pct + '%');
        }, 300);
    }
    if (pctEl) pctEl.textContent = pct + '%';
    if (detail) detail.textContent = complete + ' of ' + total + ' streams delivered';
}

// =========================================================
// Migration Streams Table
// =========================================================

function getFilteredSortedStreams() {
    var data = migrationStreams.slice();

    // Filter
    if (currentFilter !== 'All') {
        data = data.filter(function (s) { return s.status === currentFilter; });
    }

    // Sort
    if (currentSort.key) {
        var key = currentSort.key;
        var dir = currentSort.direction === 'asc' ? 1 : -1;
        data.sort(function (a, b) {
            var va = a[key];
            var vb = b[key];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });
    }

    return data;
}

function renderTable() {
    var tbody = document.getElementById('tableBody');
    if (!tbody) return;

    var data = getFilteredSortedStreams();

    var html = '';
    data.forEach(function (s) {
        html += '<tr>';
        html += '<td>' + s.name + '</td>';
        html += '<td>' + s.migrationType + '</td>';
        html += '<td>' + s.sourceTarget + '</td>';
        html += '<td><span class="status-badge ' + statusClass(s.status) + '">' + s.status + '</span></td>';
        html += '<td><div class="inline-progress">';
        html += '<div class="inline-progress-bar"><div class="inline-progress-fill" style="width:' + s.progress + '%"></div></div>';
        html += '<span class="inline-progress-text">' + s.progress + '%</span>';
        html += '</div></td>';
        html += '<td>' + formatNumber(s.locMigrated) + '</td>';
        html += '<td>' + formatNumber(s.aiSessions) + '</td>';
        html += '<td>' + formatNumber(s.hoursSaved) + '</td>';
        html += '<td>' + s.lead + '</td>';
        html += '</tr>';
    });

    tbody.innerHTML = html;

    // Update row count
    var countEl = document.getElementById('rowCount');
    if (countEl) {
        countEl.textContent = data.length + ' of ' + migrationStreams.length + ' streams';
    }
}

function setupSortHeaders() {
    var headers = document.querySelectorAll('.streams-table thead th.sortable');
    headers.forEach(function (th) {
        th.addEventListener('click', function () {
            var key = th.getAttribute('data-sort');

            // Toggle direction
            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = key;
                currentSort.direction = 'asc';
            }

            // Update visual indicators
            headers.forEach(function (h) {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');

            renderTable();
        });
    });
}

function setupStatusFilter() {
    var select = document.getElementById('statusFilter');
    if (!select) return;
    select.addEventListener('change', function () {
        currentFilter = select.value;
        renderTable();
    });
}

// =========================================================
// FTE Section
// =========================================================

/** Calculate FTE summary metrics from streams data */
function calculateFTESummary() {
    var totalHours = migrationStreams.reduce(function (acc, s) { return acc + s.hoursSaved; }, 0);
    var totalSessions = migrationStreams.reduce(function (acc, s) { return acc + s.aiSessions; }, 0);
    var fteEquivalent = totalHours / 2080;
    var avgHoursPerSession = totalHours / totalSessions;
    var fteCostSavings = fteEquivalent * 312000;

    return {
        totalHours: totalHours,
        totalSessions: totalSessions,
        fteEquivalent: fteEquivalent,
        avgHoursPerSession: avgHoursPerSession,
        fteCostSavings: fteCostSavings
    };
}

/** Update FTE KPI card data-target attributes with computed values */
function updateFTETargets() {
    var summary = calculateFTESummary();

    var totalEl = document.getElementById('fteTotalHours');
    var fteEl = document.getElementById('fteEquivalent');
    var avgEl = document.getElementById('fteAvgHours');
    var costEl = document.getElementById('fteCostSavings');

    if (totalEl) totalEl.setAttribute('data-target', summary.totalHours.toString());
    if (fteEl) fteEl.setAttribute('data-target', summary.fteEquivalent.toFixed(2));
    if (avgEl) avgEl.setAttribute('data-target', summary.avgHoursPerSession.toFixed(2));
    if (costEl) costEl.setAttribute('data-target', (summary.fteCostSavings / 1000000).toFixed(2));
}

/** Render the horizontal bar chart for per-stream hours saved */
function renderFTEBarChart() {
    var container = document.getElementById('fteBarChart');
    if (!container) return;

    // Sort streams by hours saved descending
    var sorted = migrationStreams.slice().sort(function (a, b) {
        return b.hoursSaved - a.hoursSaved;
    });

    var maxHours = sorted[0].hoursSaved;

    var html = '';
    sorted.forEach(function (s) {
        var widthPct = (s.hoursSaved / maxHours) * 100;
        var sc = statusClass(s.status);
        html += '<div class="bar-row">';
        html += '<span class="bar-label">' + s.name + '</span>';
        html += '<div class="bar-track">';
        html += '<div class="bar-fill status-' + sc + '" data-width="' + widthPct + '"></div>';
        html += '</div>';
        html += '<span class="bar-value">' + formatNumber(s.hoursSaved) + ' hrs</span>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Trigger bar animations after a brief delay
    setTimeout(function () {
        var bars = container.querySelectorAll('.bar-fill');
        bars.forEach(function (bar) {
            bar.style.width = bar.getAttribute('data-width') + '%';
        });
    }, 400);
}

/** Render the Traditional vs AI-Assisted effort comparison table */
function renderFTEComparisonTable() {
    var tbody = document.getElementById('fteComparisonBody');
    var tfoot = document.getElementById('fteComparisonFoot');
    if (!tbody || !tfoot) return;

    var totTraditional = 0;
    var totAI = 0;
    var totSaved = 0;

    var html = '';
    migrationStreams.forEach(function (s) {
        var aiHours = s.traditionalHours - s.hoursSaved;
        var savingsPct = (s.hoursSaved / s.traditionalHours * 100).toFixed(1);

        totTraditional += s.traditionalHours;
        totAI += aiHours;
        totSaved += s.hoursSaved;

        html += '<tr>';
        html += '<td>' + s.name + '</td>';
        html += '<td>' + formatNumber(s.traditionalHours) + '</td>';
        html += '<td>' + formatNumber(aiHours) + '</td>';
        html += '<td>' + formatNumber(s.hoursSaved) + '</td>';
        html += '<td class="savings-pct">' + savingsPct + '%</td>';
        html += '</tr>';
    });

    tbody.innerHTML = html;

    var totalPct = (totSaved / totTraditional * 100).toFixed(1);
    tfoot.innerHTML = '<tr>' +
        '<td>Total</td>' +
        '<td>' + formatNumber(totTraditional) + '</td>' +
        '<td>' + formatNumber(totAI) + '</td>' +
        '<td>' + formatNumber(totSaved) + '</td>' +
        '<td class="savings-pct">' + totalPct + '%</td>' +
        '</tr>';
}

/** Update the FTE savings highlight banner text */
function renderFTESavingsBanner() {
    var banner = document.getElementById('fteSavingsBanner');
    if (!banner) return;

    var summary = calculateFTESummary();
    var fteRounded = summary.fteEquivalent.toFixed(1);
    var costM = (summary.fteCostSavings / 1000000).toFixed(2);

    banner.innerHTML = 'AI-assisted sessions have saved the equivalent of <strong>' +
        fteRounded + ' full-time engineers</strong> working for 1 year, translating to ' +
        '<strong>$' + costM + 'M</strong> in personnel cost savings.';
}

// =========================================================
// Initialization
// =========================================================

document.addEventListener('DOMContentLoaded', function () {
    setCurrentDate();

    // Update FTE targets before animating
    updateFTETargets();

    // Render all dynamic content
    renderTable();
    renderOverallProgress();
    renderFTEBarChart();
    renderFTEComparisonTable();
    renderFTESavingsBanner();

    // Setup interactivity
    setupSortHeaders();
    setupStatusFilter();

    // Start counter animations
    animateAllCounters();
});

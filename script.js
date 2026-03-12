/* ===== Migration Data ===== */
var migrationStreams = [
    { name: "Core Banking Ledger", type: "COBOL \u2192 Python", sourceTarget: "COBOL \u2192 Python 3.12", status: "In Progress", progress: 72, loc: 340000, sessions: 312, hours: 4200, lead: "Rajesh M." },
    { name: "Payment Gateway", type: "Java 8 \u2192 Java 17", sourceTarget: "Java 8 \u2192 Java 17 + Spring Boot 3", status: "Complete", progress: 100, loc: 180000, sessions: 198, hours: 2100, lead: "Priya S." },
    { name: "Risk Analytics Engine", type: "SAS \u2192 PySpark", sourceTarget: "SAS 9.4 \u2192 PySpark 3.5", status: "In Progress", progress: 55, loc: 420000, sessions: 287, hours: 3800, lead: "Amit K." },
    { name: "Customer Portal", type: "Angular 8 \u2192 React", sourceTarget: "AngularJS \u2192 React 18 + TypeScript", status: "In Progress", progress: 81, loc: 95000, sessions: 142, hours: 1600, lead: "Neha D." },
    { name: "Claims Processing", type: "COBOL \u2192 Python", sourceTarget: "COBOL \u2192 Python 3.12", status: "In Progress", progress: 63, loc: 280000, sessions: 245, hours: 3100, lead: "Vikram T." },
    { name: "Data Warehouse ETL", type: "Informatica \u2192 dbt", sourceTarget: "Informatica PC \u2192 dbt Core", status: "Planning", progress: 15, loc: 50000, sessions: 34, hours: 400, lead: "Sonal R." },
    { name: "Reporting Suite", type: "Crystal Reports \u2192 Power BI", sourceTarget: "Crystal \u2192 Power BI + Python", status: "In Progress", progress: 48, loc: 120000, sessions: 98, hours: 1200, lead: "Deepak G." },
    { name: "API Gateway", type: "SOAP \u2192 REST", sourceTarget: "SOAP XML \u2192 FastAPI + OpenAPI", status: "Complete", progress: 100, loc: 65000, sessions: 87, hours: 950, lead: "Kavitha L." },
    { name: "Batch Scheduler", type: "Autosys \u2192 Airflow", sourceTarget: "Autosys \u2192 Apache Airflow 2.8", status: "In Progress", progress: 38, loc: 75000, sessions: 64, hours: 780, lead: "Ravi N." },
    { name: "Mainframe DB", type: "DB2 \u2192 PostgreSQL", sourceTarget: "DB2 z/OS \u2192 PostgreSQL 16", status: "Planning", progress: 10, loc: 30000, sessions: 22, hours: 280, lead: "Ananya B." },
    { name: "Test Automation", type: "Manual \u2192 Selenium/Pytest", sourceTarget: "Manual QA \u2192 Pytest + Selenium Grid", status: "In Progress", progress: 60, loc: 110000, sessions: 156, hours: 1800, lead: "Suresh P." },
    { name: "DevOps Pipeline", type: "Jenkins \u2192 GitHub Actions", sourceTarget: "Jenkins \u2192 GitHub Actions + ArgoCD", status: "Complete", progress: 100, loc: 40000, sessions: 48, hours: 520, lead: "Meera J." }
];

/* ===== State ===== */
var currentSort = { key: null, direction: "asc" };
var currentFilter = "All";

/* ===== Utilities ===== */
function formatNumber(num) {
    return num.toLocaleString("en-US");
}

function formatLOC(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return Math.round(num / 1000) + "K";
    return num.toString();
}

function statusClass(status) {
    return status.toLowerCase().replace(/ /g, "-");
}

/* ===== Last Refreshed ===== */
function updateRefreshTime() {
    var el = document.getElementById("lastRefreshed");
    if (el) {
        var now = new Date();
        var options = { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" };
        el.textContent = now.toLocaleDateString("en-US", options);
    }
}

/* ===== KPI Counter Animation ===== */
function animateCounters() {
    var kpiValues = document.querySelectorAll(".kpi-value");
    kpiValues.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-target"));
        var suffix = el.getAttribute("data-suffix") || "";
        var useComma = el.getAttribute("data-comma") === "true";
        var duration = 1200;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = target * eased;

            if (suffix === "M") {
                el.textContent = current.toFixed(1) + suffix;
            } else if (suffix === "%") {
                el.textContent = current.toFixed(1) + suffix;
            } else if (useComma) {
                el.textContent = Math.round(current).toLocaleString("en-US");
            } else {
                el.textContent = Math.round(current);
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (suffix === "M") {
                    el.textContent = target.toFixed(1) + suffix;
                } else if (suffix === "%") {
                    el.textContent = target.toFixed(1) + suffix;
                } else if (useComma) {
                    el.textContent = target.toLocaleString("en-US");
                } else {
                    el.textContent = target;
                }
            }
        }

        requestAnimationFrame(step);
    });
}

/* ===== Progress Bar ===== */
function animateProgressBar() {
    var fill = document.querySelector(".progress-fill");
    if (fill) {
        var target = fill.getAttribute("data-progress");
        fill.style.setProperty("--progress-width", target + "%");
    }
}

/* ===== Table Rendering ===== */
function getFilteredData() {
    if (currentFilter === "All") return migrationStreams.slice();
    return migrationStreams.filter(function (s) { return s.status === currentFilter; });
}

function getSortedData(data) {
    if (!currentSort.key) return data;
    var key = currentSort.key;
    var dir = currentSort.direction === "asc" ? 1 : -1;

    return data.sort(function (a, b) {
        var aVal, bVal;
        switch (key) {
            case "name": aVal = a.name; bVal = b.name; break;
            case "type": aVal = a.type; bVal = b.type; break;
            case "status": aVal = a.status; bVal = b.status; break;
            case "progress": aVal = a.progress; bVal = b.progress; break;
            case "loc": aVal = a.loc; bVal = b.loc; break;
            case "sessions": aVal = a.sessions; bVal = b.sessions; break;
            case "hours": aVal = a.hours; bVal = b.hours; break;
            default: return 0;
        }
        if (typeof aVal === "string") return dir * aVal.localeCompare(bVal);
        return dir * (aVal - bVal);
    });
}

function renderTable() {
    var data = getSortedData(getFilteredData());
    var tbody = document.getElementById("tableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    data.forEach(function (stream) {
        var tr = document.createElement("tr");
        var sc = statusClass(stream.status);
        var progressBarClass = "inline-progress-fill";
        if (stream.status === "Complete") progressBarClass += " complete";
        if (stream.status === "Planning") progressBarClass += " planning";

        tr.innerHTML =
            '<td class="stream-name">' + stream.name + "</td>" +
            '<td><span class="migration-type">' + stream.type + "</span></td>" +
            '<td class="source-target">' + stream.sourceTarget + "</td>" +
            '<td><span class="status-badge ' + sc + '"><span class="status-dot"></span>' + stream.status + "</span></td>" +
            '<td><div class="inline-progress">' +
            '<div class="inline-progress-track"><div class="' + progressBarClass + '" style="width: ' + stream.progress + '%"></div></div>' +
            '<span class="inline-progress-pct">' + stream.progress + "%</span></div></td>" +
            '<td class="metric-value">' + formatLOC(stream.loc) + "</td>" +
            '<td class="metric-value">' + formatNumber(stream.sessions) + "</td>" +
            '<td class="hours-value">' + formatNumber(stream.hours) + "</td>" +
            '<td class="lead-name">' + stream.lead + "</td>";

        tbody.appendChild(tr);
    });

    var rowCount = document.getElementById("rowCount");
    if (rowCount) {
        rowCount.textContent = data.length + " stream" + (data.length !== 1 ? "s" : "");
    }
}

/* ===== Sort Headers ===== */
function setupSortHeaders() {
    var headers = document.querySelectorAll("th.sortable");
    headers.forEach(function (th) {
        th.addEventListener("click", function () {
            var key = th.getAttribute("data-sort");
            headers.forEach(function (h) { h.classList.remove("sort-asc", "sort-desc"); });
            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
            } else {
                currentSort.key = key;
                currentSort.direction = "asc";
            }
            th.classList.add(currentSort.direction === "asc" ? "sort-asc" : "sort-desc");
            renderTable();
        });
    });
}

/* ===== Filter ===== */
function setupFilter() {
    var select = document.getElementById("statusFilter");
    if (select) {
        select.addEventListener("change", function (e) {
            currentFilter = e.target.value;
            renderTable();
        });
    }
}

/* ===== Init ===== */
function init() {
    updateRefreshTime();
    animateCounters();
    animateProgressBar();
    renderTable();
    setupSortHeaders();
    setupFilter();
}

document.addEventListener("DOMContentLoaded", init);

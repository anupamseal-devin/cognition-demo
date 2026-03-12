const projects = [
    {
        client: "Acme Financial Services",
        type: "Migration",
        technology: "Angular to React",
        status: "In Progress",
        hoursSaved: 320
    },
    {
        client: "GlobalTech Industries",
        type: "Modernization",
        technology: "Java 8 to Java 17",
        status: "Complete",
        hoursSaved: 540
    },
    {
        client: "Heritage Insurance Group",
        type: "Migration",
        technology: "COBOL to Python",
        status: "In Progress",
        hoursSaved: 890
    },
    {
        client: "Pacific Retail Corp",
        type: "Security",
        technology: "Legacy Auth to OAuth 2.0",
        status: "Planning",
        hoursSaved: 150
    },
    {
        client: "MedCore Health Systems",
        type: "Modernization",
        technology: "Monolith to Microservices",
        status: "Complete",
        hoursSaved: 720
    }
];

function computeSummary(data) {
    const totalProjects = data.length;
    const totalHoursSaved = data.reduce(function (sum, p) { return sum + p.hoursSaved; }, 0);
    const completedCount = data.filter(function (p) { return p.status === "Complete"; }).length;
    const avgCompletion = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;
    return { totalProjects: totalProjects, totalHoursSaved: totalHoursSaved, avgCompletion: avgCompletion };
}

function renderSummary(summary) {
    var container = document.getElementById("summaryCards");
    container.innerHTML = "\n        <div class=\"card\">\n            <div class=\"card-icon projects\">\n                <svg width=\"22\" height=\"22\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2\"/></svg>\n            </div>\n            <div class=\"card-label\">Total Projects</div>\n            <div class=\"card-value\">" + summary.totalProjects + "</div>\n        </div>\n        <div class=\"card\">\n            <div class=\"card-icon hours\">\n                <svg width=\"22\" height=\"22\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z\"/></svg>\n            </div>\n            <div class=\"card-label\">Total Hours Saved</div>\n            <div class=\"card-value\">" + summary.totalHoursSaved.toLocaleString() + "</div>\n        </div>\n        <div class=\"card\">\n            <div class=\"card-icon rate\">\n                <svg width=\"22\" height=\"22\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z\"/></svg>\n            </div>\n            <div class=\"card-label\">Avg. Completion Rate</div>\n            <div class=\"card-value\">" + summary.avgCompletion + "%</div>\n        </div>\n    ";
}

function renderTable(data) {
    var tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    data.forEach(function (project) {
        var row = document.createElement("tr");

        var statusClass = project.status.toLowerCase().replace(" ", "-");
        var typeClass = project.type.toLowerCase();

        row.innerHTML = "\n            <td class=\"client-name\">" + project.client + "</td>\n            <td><span class=\"type-tag " + typeClass + "\">" + project.type + "</span></td>\n            <td>" + project.technology + "</td>\n            <td><span class=\"badge " + statusClass + "\"><span class=\"badge-dot\"></span>" + project.status + "</span></td>\n            <td class=\"hours-saved\">" + project.hoursSaved.toLocaleString() + " hrs</td>\n        ";

        tbody.appendChild(row);
    });
}

function init() {
    var summary = computeSummary(projects);
    renderSummary(summary);
    renderTable(projects);

    document.getElementById("statusFilter").addEventListener("change", function (e) {
        var value = e.target.value;
        var filtered = value === "All" ? projects : projects.filter(function (p) { return p.status === value; });
        renderTable(filtered);

        var filteredSummary = computeSummary(filtered);
        renderSummary(filteredSummary);
    });
}

document.addEventListener("DOMContentLoaded", init);

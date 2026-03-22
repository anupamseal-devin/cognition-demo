# Testing: Client Modernization Tracker Dashboard

## Overview
This is a static HTML/CSS/JS dashboard (no frameworks, no build step). It can be served directly from the repo root.

## Deployment
- Use the `deploy frontend` tool pointing at the repo root directory (which contains `index.html`, `styles.css`, `script.js`)
- No build step is needed — the files are served as-is
- The deployment returns a public URL on `devinapps.com`

## Testing Checklist

### Initial Load
1. Navigate to the deployed URL
2. Verify the header shows "Client Modernization Tracker" with subtitle
3. Verify 3 summary cards render with correct totals:
   - Total Projects = number of entries in `projects` array in `script.js`
   - Total Hours Saved = sum of all `hoursSaved` values
   - Avg. Completion Rate = (count of "Complete" / total projects) * 100, rounded
4. Verify the table shows all rows with correct client names, project types, technologies, statuses, and hours

### Filter Functionality
1. Open the "Filter by Status" dropdown (top-right of table section)
2. Select each status option and verify:
   - Table rows update to show only matching projects
   - Summary cards recalculate based on the filtered subset (not global totals)
3. Select "All" to reset — verify all rows and original summary values return

### Visual / Styling
- Status badges should be color-coded: In Progress (yellow), Complete (green), Planning (blue)
- Project type tags should be color-coded: Migration (purple), Modernization (pink), Security (amber)
- Rows should have hover highlight effect
- Layout should be responsive (cards stack on mobile)

## Devin Secrets Needed
None — this is a static frontend with no authentication or API calls.

## Notes
- All data is hardcoded in `script.js` — no backend or API to configure
- Since the repo may not have a `main` branch initially, you might need to create an `init-main` branch as the PR base when the repo is empty
- The `computeSummary` function in `script.js` defines how summary metrics are calculated — check there if values seem off

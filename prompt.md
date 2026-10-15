# Project Prompts & Implementation History

This document collates all user prompts and instructions provided throughout the development of **ShiftFlow** (King Franchise Staff Scheduling Platform), along with the context, architectural decisions, and resulting implementations.

---

## Prompt 1: Initial Application Build & Business Model Canvas

### User Request
> "build a staff scheduling application that allows managers to easily assign shifts and track time off."

### Accompanying Context & Artifacts
- **Attachment**: `Business Model Canvas.jpg`
- **Key Value Propositions from Canvas**:
  1. *Automatic scheduling of staff shift/roster*
  2. *Customer can tap on a ready pool of contract staff to fill in any shortage of staff*
  3. *Ability to tweak the auto-generated roster where required*
- **Customer Relationships from Canvas**:
  1. *can contact us via email*
  2. *C2C support in forums*

### Features Implemented
- **Weekly Roster Grid & Timeline (`src/components/RosterView.tsx`)**:
  - Interactive calendar grid spanning Monday to Sunday with date navigation (`Previous`, `Next`, `Today`).
  - Shift cards indicating start/end times, total hours, role requirements, and shift windows (Morning, Afternoon, Evening, Night).
  - Individual shift lock toggle (`isLocked`) protecting manual manager adjustments from automated overwrites.
  - Pinned "Open Shortages" row highlighting uncovered shifts.
  - Roster KPI strip tracking scheduled hours, coverage percentage, open shortages, and projected labor cost.
  - CSV roster export and team notification dispatch simulator.
- **Smart Auto-Schedule Engine (`src/components/AutoScheduleModal.tsx`, `src/utils/scheduler.ts`)**:
  - Algorithmic shift generator that honors roles, target staffing levels, contractual weekly hours, and approved time-off.
  - Preserves locked shifts and allows optional auto-backfill of shortages using contract staff.
- **Ready Contract Staff Pool (`src/components/ContractPoolView.tsx`)**:
  - Marketplace of on-call verified relief workers with ratings, hourly rates, reliability scores, and available dates.
  - 1-click "Fill Open Shortage" action that dispatches contract relievers directly to vacant shifts.
- **Time Off & Leave Tracker (`src/components/TimeOffView.tsx`)**:
  - Request queue for Vacation, Sick Leave, Personal, and Bereavement.
  - Automated conflict detector flagging shifts scheduled during requested leave dates.
  - 1-click leave approval with option to auto-vacate conflicting shifts into open shortages for contract reliever backfill.
- **Staff Directory (`src/components/StaffDirectoryView.tsx`)**:
  - Full employee directory with capacity tracking (`scheduled / max hours`), base wage, and overtime risk alerts.
- **Manager C2C Forum & Email Helpdesk (`src/components/ManagerForumView.tsx`, `src/components/SupportModal.tsx`)**:
  - Discussion forum for store managers to share scheduling tactics and emergency coverage templates.
  - Direct manager email desk for urgent support and contract dispatch inquiries.

---

## Image Asset Generation Prompts

During the initial build, high-fidelity studio portraits were generated for team members and contract specialists:

1. **Manager Sarah Chen**:
   > *"Professional studio headshot portrait of a confident operations manager, soft neutral studio backdrop, warm natural lighting, high resolution 1:1 avatar"*
   - Saved to: `/src/assets/images/avatar_manager_sarah_1792051520720.jpg`

2. **Shift Supervisor Marcus Vance**:
   > *"Professional studio headshot portrait of a friendly shift supervisor, neutral clean background, soft diffused lighting, high resolution 1:1 avatar"*
   - Saved to: `/src/assets/images/avatar_staff_marcus_1792051520660.jpg`

3. **Contract Specialist Elena Rostova**:
   > *"Professional studio headshot portrait of an experienced on-demand contract specialist, clean neutral studio lighting, high resolution 1:1 avatar"*
   - Saved to: `/src/assets/images/avatar_contract_elena_1792051521061.jpg`

4. **Contract Professional David Sterling**:
   > *"Professional studio headshot portrait of a reliable hospitality and service contract professional, neutral background, crisp lighting, high resolution 1:1 avatar"*
   - Saved to: `/src/assets/images/avatar_contract_david_1792051520844.jpg`

---

## Prompt 2: GitHub Repository Setup & Push

### User Request
> `git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/chiayuting88-byte/King-Franchise.git`

### Actions Taken
- Initialized git repository (`git init`).
- Configured git credentials:
  - User: `chiayuting88-byte`
  - Email: `chiayuting.88@gmail.com`
- Set branch to `main`.
- Staged all project files and created the initial commit:
  - `c5903b4`: *"Initial commit: ShiftFlow staff scheduling & roster management"*
- Pushed upstream to GitHub repository:
  - Target: `https://github.com/chiayuting88-byte/King-Franchise.git`
- Sanitized remote URL in `.git/config` to protect personal access tokens from being saved in plaintext.

---

## Prompt 3: Serverless Nager.date Live API Connection & Health Endpoint

### User Request
> "add a serverless connection that pulls live data from Nager.date using the following endpoints:
> - store this in /api folder (project root level) not the src folder
> include /health.ts within that subfolder
> - do not hardcode any key, I will include them later
> GET https://date.nager.at/api/v3/PublicHolidays/2026/SG"

### Implementation Details
- **`/api/health.ts`**:
  - Endpoint: `GET /api/health`
  - Returns JSON containing server status (`ok`), uptime, ISO timestamp, environment, and registered endpoints.
- **`/api/holidays.ts`**:
  - Live connector pulling from `https://date.nager.at/api/v3/PublicHolidays/2026/SG`.
  - Configurable query parameters: `?year=2026&countryCode=SG`.
  - No hardcoded keys: reads optional `process.env.NAGER_DATE_API_KEY` and `process.env.NAGER_API_BASE_URL`.
- **`/api/index.ts`**:
  - Central Express router exporting serverless handlers.
- **`/server.ts`**:
  - Full-stack entry point mounting `/api` routes alongside Vite middlewares in dev (`tsx server.ts`) and static assets in production.
- **UI Integration**:
  - Integrated public holiday badges directly into the Weekly Roster header columns, enabling managers to anticipate holiday rush footfall and staffing requirements.
  - Added live status pill and endpoint testing links (`/api/health`, `/api/holidays`) in the application footer.
- **Git Push**:
  - Committed and pushed changes to `main` branch (`057eb5a`).

---

## Prompt 4: Collate All Prompts

### User Request
> "collate all the prompts generated under a prompt.md file"

### Deliverable
- Created `/prompt.md` in the project root documenting all prompts, context, parameters, and deliverables.

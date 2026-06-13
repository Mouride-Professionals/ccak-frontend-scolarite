# Frontend Audit Remediation Plan

Based on `AUDIT_REPORT.md` (February 11, 2026).

## Implementation Progress (February 11, 2026)
- Completed in this pass:
  - `AUTH-009`: route-level auth moved to `proxy.ts` (session gate + callback URL preservation + admin route role checks when claims exist).
  - `STU-022`: new reusable student autocomplete (`components/students/student-search.tsx`) with debounce, top 10 results, keyboard navigation, click-outside close.
  - Integration of student autocomplete in:
    - `components/enrollments/enrollment-form.tsx`
    - `app/attendance/student/page.tsx`
    - `app/evaluations/student/page.tsx`
  - `ENR-016` gap closed: enrollment submit now includes confirmation modal (`app/enrollments/new/page.tsx`).
  - Enrollment validation aligned to form payload in `lib/validations/schemas.ts`.
  - Deliberation lifecycle upgrade (`DEL-015` to `DEL-019`) in:
    - `app/deliberations/[id]/results/page.tsx`
    - `lib/api/deliberations.ts`
    - `hooks/use-deliberations.ts`
    - `app/students/[id]/deliberations/page.tsx`
  - Faculty remediation (`FAC-024` to `FAC-030`) in:
    - `app/faculty-members/new/page.tsx`
    - `app/faculty-members/[id]/edit/page.tsx`
    - `app/faculty-members/[id]/documents/page.tsx`
    - `app/faculty-members/[id]/contracts/page.tsx`
    - `app/faculty-members/[id]/workload/page.tsx`
    - `app/faculty-members/[id]/assignments/page.tsx`
    - `app/teaching-assignments/new/page.tsx`
    - `app/teaching-assignments/page.tsx`
    - `hooks/use-faculty-members-management.ts`
    - `hooks/use-teaching-assignments.ts`
    - `lib/api/faculty-members.ts`
    - `lib/api/teaching-assignments.ts`
  - Assignment management import/export completion:
    - Real CSV export + CSV import flow on `app/teaching-assignments/page.tsx`
- Current status:
  - Phase 1 (P1) is implemented in code.
  - Remaining work is Phase 2 and Phase 3 hardening and parity items below.

## Goals
- Close all ❌ NOT DONE tasks.
- Upgrade critical ⚠️ PARTIAL tasks to production-ready.
- Align implementation to sheet acceptance criteria before status stays DONE.

## Phase 1 (P1 - Blocking)
Target: 1-2 sprints
Status: Completed (implemented February 11, 2026)

1. Complete placeholder/API-pending faculty flows
- Tasks: `FAC-024`, `FAC-025`, `FAC-026`, `FAC-027`, `FAC-028`, `FAC-029`, `FAC-030`
- Files:
  - `app/faculty-members/new/page.tsx`
  - `app/faculty-members/[id]/edit/page.tsx`
  - `app/faculty-members/[id]/documents/page.tsx`
  - `app/faculty-members/[id]/contracts/page.tsx`
  - `app/faculty-members/[id]/assignments/page.tsx`
  - `app/faculty-members/[id]/workload/page.tsx`
  - `app/teaching-assignments/page.tsx`
  - `app/teaching-assignments/new/page.tsx`
- Deliverables:
  - Replace local state-only arrays with API-backed data.
  - Add conflict/availability checks in assignment form.
  - Add real export/import actions.
  - Status: Completed.

2. Finish deliberation result lifecycle
- Tasks: `DEL-015`, `DEL-016`, `DEL-017`, `DEL-018`, `DEL-019`
- Files:
  - `app/deliberations/[id]/results/page.tsx`
  - `lib/api/deliberations.ts`
- Deliverables:
  - Implement server-backed generate results action.
  - Add completion/lock modal with validation gate.
  - Add minutes preview/download and persisted jury comments.
  - Add student deliberation history timeline page.
  - Status: Completed.

3. Implement route-level auth middleware
- Task: `AUTH-009`
- Files:
  - `proxy.ts` (Next.js 16 replacement for middleware)
  - `components/auth/protected-route.tsx`
- Deliverables:
  - Enforce protected routes in middleware (not only component guard).
  - Preserve callback URL and role-based access checks where required.
  - Status: Completed (`proxy.ts` for Next.js 16 runtime).

4. Implement student autocomplete component
- Task: `STU-022`
- New file:
  - `components/students/student-search.tsx`
- Integration targets:
  - `app/enrollments/new/page.tsx`
  - `app/attendance/student/page.tsx`
  - `app/evaluations/student/page.tsx`
- Deliverables:
  - Debounced search, top 10, keyboard navigation, reusable API.
  - Status: Completed.

## Phase 2 (P2 - High Value)
Target: 2-3 sprints

1. Enrollment UX completion
- Tasks: `ENR-015`, `ENR-017` (`ENR-016` implemented)
- Deliverables:
  - Build enrollment dashboard with KPI cards/charts/recent activity.
  - Validate and test the already implemented confirmation modal in enrollment form.
  - Add course basket, total credits, prerequisite and seat indicators.

2. Course log and attendance advanced criteria
- Tasks: `LOG-012` to `LOG-017`
- Deliverables:
  - Rich text + autosave for course logs.
  - Attendance photos, absence counters, dispensation warnings.
  - Report charts and stronger export format support.
  - Real notification pipeline for dispensation alerts.

3. Evaluation analytics completion
- Tasks: `EVAL-010` to `EVAL-013`
- Deliverables:
  - Preview mode in evaluation creation.
  - Progress indicator + thank-you state in response UI.
  - Charts/word cloud/comparative view/PDF export for results.
  - Duplicate action + response-rate listing in management page.

4. Notifications and announcement completeness
- Tasks: `NOT-013`, `NOT-014`, `NOT-015`, `NOT-016`
- Deliverables:
  - Replace static notification UI with API + polling.
  - Implement mark-read and mark-all-read flows.
  - Build rotating top announcement banner.
  - Add rich-text announcement editor and preview.

## Phase 3 (P3 - UX and Parity)
Target: 1-2 sprints

1. Academic structure parity polish
- Tasks: `ACAD-020`, `ACAD-022`, `ACAD-023`
- Deliverables:
  - Remove TODO paths and wire full filters.
  - Add prerequisites display and selection UX.
  - Add optional list/grid mode if still required.

2. Calendar and scheduling parity
- Tasks: `CAL-020` to `CAL-027`
- Deliverables:
  - Break-time/preview calendar in setup.
  - Holiday calendar view + edit flow.
  - Drag/drop timetable creation.
  - PDF export and print-friendly schedule outputs.

3. Document generation polish
- Tasks: `DOC-017` to `DOC-020`
- Deliverables:
  - Student-facing request workflow with confirmation/download.
  - Replace hardcoded student filters with real lookup.
  - Real page navigation in PDF viewer.
  - Add direct verify input + verify-button flow.

## Validation Gate Before DONE
For each task moved to DONE, require:
- Acceptance-criteria checklist attached in PR.
- Screenshots/video proof of each criterion.
- Route + API integration proof (network calls and error states).
- Test evidence for critical flows.

## Suggested Execution Order
1. Stabilize P1 with integrated QA (manual AC checklist + regression pass).
2. P2 enrollment + logs/attendance + evaluations + notifications.
3. P3 calendar + documents + academic structure polish.

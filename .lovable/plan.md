
# Admin-Managed Faculty Directory

## What Changes

Currently, faculty members are hardcoded in the Faculty page. This plan moves them into the database so admins can add, edit, and delete faculty members from the admin panel.

## New Database Table

A `faculty_members` table will store all faculty data:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| name | text | Required |
| role | text | Required (e.g. "Head of Cinematography") |
| department | text | Required (Cinematography, Post-Production, Directing, Production) |
| expertise | text[] | Array of skill tags |
| bio | text | Optional longer description |
| featured | boolean | Default false -- marks department heads |
| display_order | integer | Default 0 -- controls sort order |
| image_url | text | Optional photo URL |
| created_at | timestamptz | Auto-set |

RLS: Public read access (anyone can view the faculty page), admin-only write access.

The 8 existing hardcoded faculty members will be seeded into the table via the migration.

## New Files

### 1. `src/pages/admin/FacultyManager.tsx`
Admin page following the same pattern as ChallengeManager:
- Table listing all faculty with name, role, department, featured status
- "Add Faculty" button opening a dialog form
- Edit button on each row opening the same dialog pre-filled
- Delete button with confirmation
- Fields: name, role, department (dropdown), bio, expertise (comma-separated input), featured toggle, display order

### 2. `src/hooks/useFacultyMembers.ts`
- `useFacultyMembers()` -- fetches all faculty ordered by display_order, then name
- `useCreateFacultyMember()` -- insert mutation
- `useUpdateFacultyMember()` -- update mutation
- `useDeleteFacultyMember()` -- delete mutation

## Modified Files

### 3. `src/pages/Faculty.tsx`
- Remove the hardcoded `facultyMembers` array
- Import and use `useFacultyMembers()` hook to fetch from database
- Add loading and empty states
- Everything else (layout, styling, department filter) stays the same but the filter will now actually work with state

### 4. `src/components/admin/AdminSidebar.tsx`
- Add a "Faculty" nav item with a `GraduationCap` icon linking to `/admin/faculty`

### 5. `src/App.tsx`
- Add route: `/admin/faculty` wrapped in `AdminRoute`

## Technical Details

**Migration SQL** will:
1. Create the `faculty_members` table
2. Enable RLS
3. Add public SELECT policy
4. Add admin INSERT/UPDATE/DELETE policies (using `has_role` function)
5. Seed the 8 existing faculty members

**FacultyManager page** will include:
- A dialog form with inputs for all fields
- Department as a Select dropdown (Cinematography, Post-Production, Directing, Production)
- Expertise as a text input (comma-separated, parsed into array)
- Featured as a Switch toggle
- Edit pre-fills the form; save calls upsert
- Delete uses an AlertDialog for confirmation

**Faculty.tsx** will:
- Call `useFacultyMembers()` and render the same UI
- Department filter buttons will use `useState` to filter the fetched list
- Show a skeleton loader while loading

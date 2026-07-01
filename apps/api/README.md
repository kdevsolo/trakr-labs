1. JwtAuthGuard — authentication
Question it answers: Is this a valid logged-in user?

Runs on every route unless marked @Public()
Validates the Supabase JWT via SupabaseStrategy
Loads/provisions the user and attaches them to request.user
Fails with 401 Unauthorized if the token is missing or invalid
Used on: everything by default; only / and /health are @Public() today.

2. PermissionsGuard — RBAC permissions
Question it answers: Does this user have the required permission for this action?

Runs globally, but only enforces when a route has @RequirePermission(resource, action)
If no decorator → passes through
Requires user.orgId for org-scoped resources (USER, PROJECT)
Uses projectId from the URL for project-scoped resources (ISSUE, COMMENT, etc.)
Org admins bypass all permission checks (isOrgAdmin === true)
Fails with 403 Forbidden if permission is missing
Used on: e.g. GET org/members needs USER:READ, issue routes need ISSUE:CREATE, etc.

3. OrgAdminGuard — org admin gate
Question it answers: Is this user an org admin?

Only enforces when @OrgAdminOnly() is present on the handler
If the guard is applied but @OrgAdminOnly() is missing → passes (no-op)
Requires both user.orgId and user.isOrgAdmin
Fails with 403 "Org admin access required"
Used on:

PermissionsController (entire controller — class-level guard + per-route @OrgAdminOnly())
PATCH org/members/:userId in UsersController

4. ProjectMemberGuard — project membership
Question it answers: Can this user access this specific project?

Only enforces when @ProjectScoped() is on the controller/handler
Org admins skip the membership check entirely
For everyone else:
Verifies membership via user.projectIds loaded at auth time (DB fallback removed)
Fails with 404 if project not in org, 403 if not a member
Used on: IssuesController, ProjectsController findOne, ProjectWidgetController
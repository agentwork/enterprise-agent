# Feature Specification: Platform Core (Auth & Admin)

## 1. Overview
The **Platform Core** handles all foundational security, identity, and access control mechanisms for the Enterprise AI Agent Platform. It ensures that data remains secure and accessible only to authorized personnel, supporting multi-tenant like isolation within a single organization (via RBAC).

## 2. Target Audience
- **System Admin**: Managing users, roles, and system-wide settings.
- **Developers**: Implementing new secure features and ensuring compliance.
- **End Users**: Logging in and accessing permitted data securely.

## 3. Key Functionality

### 3.1 Authentication
- **Description**: Secure login and session management via Supabase Auth.
- **Capabilities**:
    - **Email/Password Login**: Standard authentication flow.
    - **Session Management**: Secure, HTTP-only cookies using `@supabase/ssr`.
    - **Token Refresh**: Automatic handling of access token expiration.

- **Key Flow (Login)**:
    1.  User enters credentials on `/login`.
    2.  `SupabaseClient` (Client-side) authenticates with Supabase Auth API.
    3.  On success, a session is established.
    4.  Next.js Middleware validates the session token on subsequent requests.
    5.  User is redirected to `/dashboard` (or `/admin` if authorized).

### 3.2 Role-Based Access Control (RBAC)
- **Description**: Granular permission system enforcing access policies at multiple levels.
- **Roles**:
    - **Admin**: Full system access (User Mgmt, Model Config, All Data).
    - **Manager**: View all team data, Edit own team data, Approve actions.
    - **Staff**: View/Edit own data only.
- **Enforcement Layers**:
    - **Middleware**: Protects routes (e.g., `/admin/*` requires `role='admin'`).
    - **RLS Policies**: Protects database rows (e.g., `clients` table policies).
    - **API Level**: Server Actions check `profile.role` before execution.

- **Key Flow (Access Check)**:
    1.  User requests a protected resource (e.g., `/admin/users`).
    2.  Middleware fetches the user's session.
    3.  Middleware queries `public.profiles` to get the user's role.
    4.  If `role !== 'admin'`, redirect to `/dashboard` with an error.
    5.  If authorized, allow request to proceed.

### 3.3 Admin Dashboard
- **Description**: Centralized interface for system configuration and user management.
- **Features**:
    - **User Management**: Invite users, assign roles, deactivate accounts.
    - **Model Configuration**: Select active LLM provider (OpenAI, Anthropic) and manage API keys.
    - **Audit Logs**: View a history of critical actions (e.g., "User X deleted Client Y").

## 4. Data & Schema
- **Database Tables**:
    - `auth.users` (Supabase managed): Identity store (Email, Password Hash, Last Sign-in).
    - `public.profiles`: Extended user data linked to `auth.users`.
        - `id`: UUID (FK to auth.users)
        - `full_name`: Text
        - `avatar_url`: Text
        - `role`: Enum ('admin', 'manager', 'staff')
        - `updated_at`: Timestamp
    - `public.audit_logs` (Planned): Action history.
        - `id`: UUID
        - `user_id`: UUID
        - `action`: Text
        - `resource`: Text
        - `details`: JSONB
        - `created_at`: Timestamp

## 5. Integration Points
- **Input**: Login Form, Admin Panel UI.
- **Output**: User Session, Permission Flags, Audit Records.
- **External**: Supabase Auth Service, SMTP Server (for invites/resets).

## 6. User Scenarios
- **Scenario A**: Admin invites a new Sales Rep.
    1.  Admin enters email `newuser@company.com` and selects "Staff" role.
    2.  System sends an invite email via Supabase Auth.
    3.  User clicks link, sets password, and logs in.
    4.  `public.profiles` entry is created with `role='staff'`.
    5.  RLS ensures they only see assigned clients.

- **Scenario B**: Unauthorized Access Attempt.
    1.  Staff user tries to access `/admin/users`.
    2.  Middleware detects role mismatch (`staff` != `admin`).
    3.  Redirects to `/dashboard` with a "Permission Denied" flash message.

## 7. Future Roadmap
- **SSO Integration**: Google Workspace, Microsoft Entra ID for enterprise login.
- **Team-Based Access**: Create groups/teams and assign resources to groups (e.g., "North America Sales Team").
- **MFA**: Multi-Factor Authentication for Admin accounts.

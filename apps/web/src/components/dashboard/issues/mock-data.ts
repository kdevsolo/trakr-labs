import type { Issue, Project } from "./types";

export const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "BugTrack Pro", key: "BTP" },
  { id: "2", name: "Auth Service", key: "AUTH" },
  { id: "3", name: "Frontend Core", key: "PROJ" },
  { id: "4", name: "Database Layer", key: "DB" },
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: "1",
    key: "AUTH-391",
    summary: "OAuth token validation fails on edge regions randomly",
    component: "Auth Service",
    severity: "critical",
    status: "open",
    assignee: null,
    reporter: "System (Datadog)",
    environment: "Production (US-East)",
    createdAt: "2 hours ago",
    impact: "~450 users/hr",
    description:
      "Automated alert triggered indicating an elevated error rate (5xx) on the /v1/oauth/validate endpoint specifically routing through the US-East edge nodes. The issue appears intermittent but correlates with high traffic spikes.",
    stackTrace: `Exception: JWT Signature Validation Failed
  at AuthService.verifyToken (auth.ts:142)
  at EdgeGateway.handleRequest (gateway.js:88)
  at async middleware.run (express/lib/router:22)
  -- Context --
  KeyID: kid_994a8b2
  Region: us-east-1a
  Latency: 45ms`,
    aiTriage:
      "The stack trace indicates a JWT signature validation failure at the edge. This usually happens during key rotation if edge nodes haven't synchronized the JWKS endpoint cache.",
    aiSuggestedFix:
      "Force a refresh of the JWKS cache on the US-East gateway cluster or adjust the caching TTL to be shorter during key rotation windows.",
  },
  {
    id: "2",
    key: "PROJ-1042",
    summary: "Uncaught TypeError in React dashboard component on data load",
    component: "Frontend Core",
    severity: "high",
    status: "open",
    assignee: "Sarah Chen",
    reporter: "Marcus Webb",
    environment: "Production (Global)",
    createdAt: "5 hours ago",
    impact: "~120 users/hr",
    description:
      "Users are encountering an uncaught TypeError when the dashboard component attempts to render data from the analytics API. The error occurs during the initial data load phase.",
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'map')
  at DashboardComponent.render (Dashboard.tsx:87)
  at ReactDOM.render (/react-dom/cjs/react-dom.development.js:20663)`,
    aiTriage:
      "The error is caused by attempting to map over undefined data returned from the analytics API before the null check is performed.",
    aiSuggestedFix:
      "Add a null check or optional chaining before the map call, and ensure the loading state properly guards against undefined data.",
  },
  {
    id: "3",
    key: "DB-005",
    summary: "Slow query performance on user history pagination endpoint",
    component: "Database",
    severity: "medium",
    status: "in_progress",
    assignee: "Alex Rivera",
    reporter: "System (Monitoring)",
    environment: "Production (EU-West)",
    createdAt: "1 day ago",
    impact: "P95 latency 4.2s",
    description:
      "The user history pagination endpoint is experiencing degraded performance with P95 latency exceeding 4 seconds. Query analysis shows a missing index on the created_at column for large user datasets.",
    stackTrace: `SLOW QUERY LOG:
  Query: SELECT * FROM user_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 50 OFFSET ?
  Execution time: 4218ms
  Rows examined: 2,847,392
  Index used: None`,
    aiTriage:
      "Missing composite index on (user_id, created_at) is causing full table scans on large datasets, leading to excessive query times.",
    aiSuggestedFix:
      "Add a composite index: CREATE INDEX idx_user_events_user_created ON user_events(user_id, created_at DESC);",
  },
  {
    id: "4",
    key: "UI-882",
    summary: "Button alignment issue on mobile viewport below 375px",
    component: "Frontend UI",
    severity: "low",
    status: "open",
    assignee: null,
    reporter: "Jamie Torres",
    environment: "Production (Mobile)",
    createdAt: "3 days ago",
    impact: "Cosmetic only",
    description:
      "On devices with viewport widths below 375px, action buttons in the settings panel overflow the container and overlap with adjacent text elements.",
    aiTriage: "CSS flexbox overflow issue on small screens.",
    aiSuggestedFix:
      "Add flex-wrap: wrap or adjust min-width constraints on the button container for viewports below 375px.",
  },
  {
    id: "5",
    key: "AUTH-388",
    summary: "Session token not refreshing on long-lived connections",
    component: "Auth Service",
    severity: "high",
    status: "open",
    assignee: "Jordan Kim",
    reporter: "System (Datadog)",
    environment: "Production (Global)",
    createdAt: "6 hours ago",
    impact: "~85 users/hr",
    description:
      "Users with long-lived WebSocket connections are experiencing session timeouts without automatic token refresh, causing sudden disconnections.",
    aiTriage:
      "The token refresh logic is not triggered for WebSocket connections, only for HTTP requests.",
    aiSuggestedFix:
      "Implement a proactive token refresh mechanism in the WebSocket connection handler that triggers refresh 5 minutes before token expiry.",
  },
  {
    id: "6",
    key: "DB-003",
    summary: "Connection pool exhaustion under peak load conditions",
    component: "Database",
    severity: "critical",
    status: "resolved",
    assignee: "Alex Rivera",
    reporter: "System (PagerDuty)",
    environment: "Production (US-West)",
    createdAt: "2 days ago",
    impact: "Service degraded 18min",
    description:
      "Connection pool was exhausted during a traffic spike, causing database timeouts across multiple services. Pool size was configured too low for current load.",
    aiTriage: "Database connection pool size insufficient for peak traffic.",
    aiSuggestedFix: "Increase pool size from 20 to 50 and implement connection pooling metrics alerting.",
  },
];

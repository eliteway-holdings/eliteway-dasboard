import {
  Business,
  Task,
  Submission,
  Project,
  Integration,
  LogItem,
  Session,
  SubmissionStatus,
  TaskColumn,
  User,
  WalletBalance,
  WalletTransaction,
  PaymentCheckoutLink,
  EventSubaccount,
  EventPlan,
  EventPlanTier,
  EventPlanTask,
  EventProgressUpdate,
  EventFollowUp,
  PlanTier,
  BusinessFeature,
  CallOutcome,
  DailyQueueItem,
  OutreachContact
} from '../types';

const STORAGE_KEYS = {
  BUSINESSES: 'ewcf_businesses_v2',
  TASKS: 'ewcf_tasks_v2',
  SUBMISSIONS: 'ewcf_submissions_v2',
  PROJECTS: 'ewcf_projects_v2',
  INTEGRATIONS: 'ewcf_integrations_v2',
  LOGS: 'ewcf_logs_v2',
  SESSION: 'ewcf_auth_session_v2',
  WALLETS: 'ewcf_wallets_v2',
  TRANSACTIONS: 'ewcf_transactions_v2',
  CHECKOUT_LINKS: 'ewcf_checkout_links_v2',
  EVENT_SUBACCOUNTS: 'ewcf_event_subaccounts_v2',
  EVENT_PLANS: 'ewcf_event_plans_v2',
  RESOURCES: 'ewcf_resources_v1',
  OUTREACH_CONTACTS: 'ewcf_outreach_contacts_v1',
  DAILY_QUEUES: 'ewcf_daily_queues_v1'
};

export const EVENT_TIER_FEES: Record<'basic' | 'pro' | 'elite', { monthlyZAR: number; label: string; features: string[]; maxEvents: number }> = {
  basic: {
    monthlyZAR: 499,
    label: 'Basic Events Pack',
    features: ['Up to 5 concurrent events', 'Basic team follow-ups', 'Progress tracking', 'Ticket sales in ZAR'],
    maxEvents: 5
  },
  pro: {
    monthlyZAR: 1499,
    label: 'Pro Events Pack',
    features: ['Up to 20 concurrent events', 'Advanced follow-ups & alerts', 'AI budget forecasting', 'Automated vendor emails', 'Live event execution mode'],
    maxEvents: 20
  },
  elite: {
    monthlyZAR: 3999,
    label: 'Elite Events Suite',
    features: ['Unlimited events', 'White-label ticketing', 'Priority WhatsApp integration', 'Dedicated event manager', 'Custom sponsor packages'],
    maxEvents: 999
  }
};

export function formatZAR(amount: number): string {
  return 'R' + amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const BUSINESS_FEATURE_CATALOG: Record<BusinessFeature, { label: string; monthlyZAR: number; description: string }> = {
  kanban: { label: 'Kanban Workflow', monthlyZAR: 299, description: 'Tasks, assignments and review columns' },
  projects: { label: 'Projects & Budgets', monthlyZAR: 399, description: 'Project milestones and ZAR budgets' },
  submissions: { label: 'Deliverable Reviews', monthlyZAR: 249, description: 'Work submissions and manager feedback' },
  team: { label: 'Team Management', monthlyZAR: 199, description: 'Member accounts, roles and credentials' },
  integrations: { label: 'Integrations', monthlyZAR: 499, description: 'Make.com, Slack and external connectors' },
  resources: { label: 'Resource Repository', monthlyZAR: 299, description: 'Policies, templates, documents and institutional reference links' },
  outreach: { label: 'Daily Outreach Queue', monthlyZAR: 699, description: 'Automated call queues, one-tap outcomes, contact history and CSV import' },
  events: { label: 'Events Planner', monthlyZAR: 1499, description: 'Event planning, follow-ups and execution' },
  notifications: { label: 'Activity & Alerts', monthlyZAR: 149, description: 'Progress, deadline and audit alerts' }
};

export const PLAN_ACCESS: Record<PlanTier, {
  label: string;
  monthlyZAR: number;
  maxSeats: number;
  features: BusinessFeature[];
  whiteLabel: boolean;
  summary: string;
}> = {
  starter: {
    label: 'Essential Operations',
    monthlyZAR: 799,
    maxSeats: 5,
    features: ['kanban', 'submissions', 'notifications', 'resources'],
    whiteLabel: false,
    summary: 'Basic task visibility, simple submissions, document access, and activity alerts.'
  },
  pro: {
    label: 'Institution Growth',
    monthlyZAR: 2499,
    maxSeats: 20,
    features: ['kanban', 'projects', 'submissions', 'team', 'resources', 'notifications'],
    whiteLabel: true,
    summary: 'Adds teams, project management, institutional repository, white-label branding, and manager visibility.'
  },
  enterprise: {
    label: 'Executive Engine',
    monthlyZAR: 6499,
    maxSeats: 75,
    features: ['kanban', 'projects', 'submissions', 'team', 'integrations', 'resources', 'notifications', 'outreach'],
    whiteLabel: true,
    summary: 'Adds Make.com integrations, document repository, and executive progress control for growing institutions.'
  },
  god_tier: {
    label: 'Custom Institution Suite',
    monthlyZAR: 14999,
    maxSeats: 999,
    features: ['kanban', 'projects', 'submissions', 'team', 'integrations', 'resources', 'notifications', 'outreach'],
    whiteLabel: true,
    summary: 'Custom access after consultation. Events remain a separate Events plan.'
  }
};

export const DEFAULT_BUSINESS_FEATURES: BusinessFeature[] = PLAN_ACCESS.starter.features;

export function getPlanFeatures(plan: PlanTier, customAddOns: BusinessFeature[] = [], hasActiveEventsPlan = false): BusinessFeature[] {
  const base = PLAN_ACCESS[plan]?.features || PLAN_ACCESS.starter.features;
  const allowed = new Set<BusinessFeature>([...base, ...customAddOns]);
  if (hasActiveEventsPlan) allowed.add('events');
  else allowed.delete('events');
  return Array.from(allowed);
}

const DEFAULT_BUSINESSES: Business[] = [
  {
    id: "biz_001",
    name: "Acme Corp",
    logo: "AC",
    primaryColor: "#7b2ff2",
    secondaryColor: "#0077ff",
    plan: "enterprise",
    status: "active",
    customDomain: "acme.elitewayclub.com",
    createdAt: "2025-11-14",
    users: [
      { id: "usr_acme_1", name: "Sarah Chen", email: "sarah@acme.com", password: "Acme2026!", role: "admin", initials: "SC", department: "Executive & Ops", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { id: "usr_acme_2", name: "Mike Johnson", email: "mike@acme.com", password: "Acme2026!", role: "manager", initials: "MJ", department: "Engineering Lead", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { id: "usr_acme_3", name: "Emma Wilson", email: "emma@acme.com", password: "Acme2026!", role: "member", initials: "EW", department: "Product Design", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
      { id: "usr_acme_4", name: "David Miller", email: "david@client.org", password: "Acme2026!", role: "client", initials: "DM", department: "Client Sponsor" }
    ],
    stats: { projects: 12, tasks: 34, members: 8, completed: 28, mrr: 399 },
    settings: {
      enableClientPortal: true,
      autoWebhookSync: true,
      requireReviewForDone: true,
      slackChannel: "#acme-flow-engine"
    }
  },
  {
    id: "biz_002",
    name: "TechStart Inc",
    logo: "TS",
    primaryColor: "#0077ff",
    secondaryColor: "#00d4aa",
    plan: "pro",
    status: "active",
    customDomain: "flow.techstart.io",
    createdAt: "2025-12-02",
    users: [
      { id: "usr_tech_1", name: "Alex Rivera", email: "alex@techstart.com", password: "Tech2026!", role: "admin", initials: "AR", department: "Founding Partner" },
      { id: "usr_tech_2", name: "Lisa Park", email: "lisa@techstart.com", password: "Tech2026!", role: "member", initials: "LP", department: "Full-Stack Dev" }
    ],
    stats: { projects: 6, tasks: 18, members: 5, completed: 14, mrr: 149 },
    settings: {
      enableClientPortal: false,
      autoWebhookSync: true,
      requireReviewForDone: false
    }
  },
  {
    id: "biz_003",
    name: "GreenLife Org",
    logo: "GL",
    primaryColor: "#00d4aa",
    secondaryColor: "#7b2ff2",
    plan: "starter",
    status: "active",
    customDomain: "portal.greenlife.org",
    createdAt: "2026-01-10",
    users: [
      { id: "usr_green_1", name: "James Brown", email: "james@greenlife.org", password: "Green2026!", role: "admin", initials: "JB", department: "Operations" }
    ],
    stats: { projects: 3, tasks: 9, members: 3, completed: 7, mrr: 49 },
    settings: {
      enableClientPortal: false,
      autoWebhookSync: false,
      requireReviewForDone: false
    }
  },
  {
    id: "biz_004",
    name: "StyleBoutique",
    logo: "SB",
    primaryColor: "#c77dff",
    secondaryColor: "#ff4d6d",
    plan: "pro",
    status: "suspended",
    customDomain: "flow.styleboutique.studio",
    createdAt: "2025-08-20",
    users: [
      { id: "usr_style_1", name: "Nina Patel", email: "nina@styleboutique.com", password: "Style2026!", role: "admin", initials: "NP", department: "Creative Director" }
    ],
    stats: { projects: 4, tasks: 11, members: 4, completed: 0, mrr: 149 }
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: "tsk_1",
    bizId: "biz_001",
    title: "Redesign Checkout Flow UI/UX & High-Converting Micro-Interactions",
    description: "Our current checkout abandonment rate is 23%. Create Figma high-fidelity prototypes for 3-step checkout with instant Stripe wallet validation.",
    category: "Design",
    col: "todo",
    assignee: "SC",
    assigneeName: "Sarah Chen",
    priority: "urgent",
    dueDate: "2026-03-30",
    commentsCount: 6,
    attachmentsCount: 3,
    tags: ["UI/UX", "Stripe", "Conversion"],
    estimatedHours: 16,
    loggedHours: 4,
    checklist: [
      { id: "cl_1", text: "Wireframe 1-click mobile Apple/Google Pay modal", done: true },
      { id: "cl_2", text: "Design high-contrast error states & auto-formatting", done: true },
      { id: "cl_3", text: "Present to David (Client Sponsor) for sign-off", done: false }
    ],
    createdAt: "2026-03-24"
  },
  {
    id: "tsk_2",
    bizId: "biz_001",
    title: "Configure Make.com Webhook for Real-Time CRM Pipeline Sync",
    description: "Link Club Flow Engine board state changes directly to HubSpot deal stage pipeline via custom JSON payload.",
    category: "AI Workflow",
    col: "inprogress",
    assignee: "MJ",
    assigneeName: "Mike Johnson",
    priority: "high",
    dueDate: "2026-03-28",
    commentsCount: 4,
    attachmentsCount: 1,
    tags: ["Make.com", "Webhook", "Automation"],
    estimatedHours: 8,
    loggedHours: 6,
    checklist: [
      { id: "cl_2_1", text: "Test HMAC SHA256 webhook signature validation", done: true },
      { id: "cl_2_2", text: "Map custom fields (ZAR budget, assignee, status)", done: true },
      { id: "cl_2_3", text: "Set up retry queue for network timeouts", done: false }
    ],
    createdAt: "2026-03-22"
  },
  {
    id: "tsk_3",
    bizId: "biz_001",
    title: "Implement Stripe Billing Portal API & Self-Serve Plan Upgrades",
    description: "Allow workspace admins to upgrade from Pro to Enterprise tier directly from their settings modal without manual support tickets.",
    category: "Dev",
    col: "todo",
    assignee: "MJ",
    assigneeName: "Mike Johnson",
    priority: "high",
    dueDate: "2026-04-02",
    commentsCount: 3,
    attachmentsCount: 0,
    tags: ["Stripe", "Node.js", "SaaS"],
    estimatedHours: 20,
    loggedHours: 2,
    createdAt: "2026-03-25"
  },
  {
    id: "tsk_4",
    bizId: "biz_001",
    title: "Review Q3 Marketing Campaign Video Assets & Social Cutdowns",
    description: "Client requested 5 vertical 9:16 reels for Instagram and TikTok with captions and custom branded sound stingers.",
    category: "Marketing",
    col: "inreview",
    assignee: "EW",
    assigneeName: "Emma Wilson",
    priority: "medium",
    dueDate: "2026-03-27",
    commentsCount: 8,
    attachmentsCount: 5,
    tags: ["Video", "TikTok", "Branding"],
    estimatedHours: 12,
    loggedHours: 12,
    createdAt: "2026-03-20"
  },
  {
    id: "tsk_5",
    bizId: "biz_001",
    title: "Optimize Database Queries & Redis Caching for Client Portal",
    description: "Reduce dashboard initial fetch response time from 380ms down to sub-45ms under heavy multi-tenant concurrent traffic.",
    category: "Dev",
    col: "inprogress",
    assignee: "MJ",
    assigneeName: "Mike Johnson",
    priority: "medium",
    dueDate: "2026-04-05",
    commentsCount: 2,
    attachmentsCount: 0,
    tags: ["PostgreSQL", "Performance", "Redis"],
    estimatedHours: 14,
    loggedHours: 9,
    createdAt: "2026-03-23"
  },
  {
    id: "tsk_6",
    bizId: "biz_001",
    title: "Finalize Client Onboarding Interactive Pitch Deck v3.2",
    description: "Update pricing tables and add Make.com workflow architecture diagram before Friday stakeholder presentation.",
    category: "Strategy",
    col: "inreview",
    assignee: "SC",
    assigneeName: "Sarah Chen",
    priority: "high",
    dueDate: "2026-03-26",
    commentsCount: 5,
    attachmentsCount: 2,
    tags: ["Pitch Deck", "Enterprise"],
    estimatedHours: 6,
    loggedHours: 5,
    createdAt: "2026-03-21"
  },
  {
    id: "tsk_7",
    bizId: "biz_001",
    title: "Mobile Responsive Cross-Device QA & Glassmorphism Polish",
    description: "Verify that sidebar drawers and kanban drag & drop work seamlessly on iPads and foldable Android devices.",
    category: "Dev",
    col: "backlog",
    assignee: "EW",
    assigneeName: "Emma Wilson",
    priority: "low",
    dueDate: "2026-04-10",
    commentsCount: 1,
    attachmentsCount: 0,
    tags: ["QA", "Mobile", "Tailwind"],
    estimatedHours: 8,
    loggedHours: 0,
    createdAt: "2026-03-25"
  },
  {
    id: "tsk_8",
    bizId: "biz_001",
    title: "Launch Global Brand Assets Library & Design Token System",
    description: "Centralized Figma variables export pipeline for fonts, color palettes (#7b2ff2 & #0077ff), and SVG iconography.",
    category: "Design",
    col: "done",
    assignee: "SC",
    assigneeName: "Sarah Chen",
    priority: "medium",
    dueDate: "2026-03-18",
    commentsCount: 4,
    attachmentsCount: 4,
    tags: ["Design Tokens", "Figma", "Production"],
    estimatedHours: 10,
    loggedHours: 10,
    createdAt: "2026-03-10"
  },
  {
    id: "tsk_tech_1",
    bizId: "biz_002",
    title: "Develop AI Agent Prompt Router for Customer Support Automation",
    description: "Fine-tune OpenAI GPT-4o system prompt to triage technical support inquiries and auto-escalate high-priority tickets.",
    category: "AI Workflow",
    col: "inprogress",
    assignee: "AR",
    assigneeName: "Alex Rivera",
    priority: "urgent",
    dueDate: "2026-03-29",
    commentsCount: 3,
    attachmentsCount: 1,
    tags: ["AI Agent", "OpenAI", "Router"],
    estimatedHours: 24,
    loggedHours: 15,
    createdAt: "2026-03-20"
  },
  {
    id: "tsk_tech_2",
    bizId: "biz_002",
    title: "Deploy Docker Microservices Cluster to AWS ECS Fargate",
    description: "Set up auto-scaling rules based on CPU and memory metrics during peak traffic spikes.",
    category: "Dev",
    col: "todo",
    assignee: "LP",
    assigneeName: "Lisa Park",
    priority: "high",
    dueDate: "2026-04-03",
    commentsCount: 2,
    attachmentsCount: 0,
    tags: ["AWS", "Docker", "DevOps"],
    estimatedHours: 16,
    loggedHours: 0,
    createdAt: "2026-03-24"
  }
];

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: "sub_1",
    bizId: "biz_001",
    title: "Q3 Campaign Vertical Reels & Video Ad Assets (v2)",
    description: "Includes 5 finalized color-graded MP4 videos with dynamic subtitles and licensed audio tracks. Ready for instant publishing across social ad managers.",
    submitter: "Emma Wilson",
    submitterRole: "Product Design",
    time: "2 hours ago",
    status: "pending",
    fileUrl: "https://drive.google.com/drive/folders/acme_campaign_2026_reels_final_v2",
    fileType: "video",
    version: "v2.0",
    clientVisible: true,
    linkedTaskId: "tsk_4",
    feedback: [
      { id: "fb_1", author: "Sarah Chen", role: "admin", text: "Colors look so vibrant! Can we ensure the call-to-action text stays inside the TikTok safe zone?", time: "1 hour ago" },
      { id: "fb_2", author: "Emma Wilson", role: "member", text: "Updated safe margins in v2.0! All overlays adjusted 120px from bottom edge.", time: "35 mins ago" }
    ]
  },
  {
    id: "sub_2",
    bizId: "biz_001",
    title: "Make.com Webhook Automation Blueprint & JSON Schema",
    description: "Exported blueprint (`acme_crm_sync.json`) with error handler branches and Slack notification alerts for failed API responses.",
    submitter: "Mike Johnson",
    submitterRole: "Engineering Lead",
    time: "5 hours ago",
    status: "pending",
    fileUrl: "https://us1.make.com/templates/shared/blueprint_882910_acme_flow_engine",
    fileType: "make_blueprint",
    version: "v1.4",
    clientVisible: false,
    linkedTaskId: "tsk_2",
    feedback: []
  },
  {
    id: "sub_3",
    bizId: "biz_001",
    title: "Acme Design System & Figma UI Kit v2.4 Deliverable",
    description: "Complete tokenized component library with auto-layout cards, dark mode variable overrides, and responsive navigation headers.",
    submitter: "Sarah Chen",
    submitterRole: "Executive & Ops",
    time: "1 day ago",
    status: "approved",
    fileUrl: "https://figma.com/file/acme_design_system_uikit_v24_production",
    fileType: "figma",
    version: "v2.4",
    clientVisible: true,
    linkedTaskId: "tsk_8",
    feedback: [
      { id: "fb_3", author: "David Miller", role: "client", text: "Phenomenal execution. The violet to cobalt gradients align 100% with our brand guidelines. Approved!", time: "18 hours ago" }
    ]
  },
  {
    id: "sub_4",
    bizId: "biz_001",
    title: "Client Portal Database Schema & Migration SQL Scripts",
    description: "Optimized relational indexes and audit logging triggers. Passed staging stress test with 10,000 simulated records.",
    submitter: "Mike Johnson",
    submitterRole: "Engineering Lead",
    time: "3 days ago",
    status: "approved",
    fileUrl: "https://github.com/acme-org/db-migrations/pull/142",
    fileType: "github",
    version: "v1.1",
    clientVisible: false,
    feedback: [
      { id: "fb_4", author: "Sarah Chen", role: "admin", text: "Staging database latency dropped by 82%. Great work, approved for production deployment.", time: "2 days ago" }
    ]
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "prj_1",
    bizId: "biz_001",
    name: "Client Portal Refresh & Real-Time Sync Engine",
    clientName: "Acme Global Enterprise",
    status: "Active",
    budget: 18500,
    spent: 12400,
    progress: 68,
    deadline: "2026-04-15",
    description: "Full-stack overhaul of the high-velocity client dashboard with Make.com automation webhooks and Stripe self-serve upgrades.",
    teamInitials: ["SC", "MJ", "EW"],
    milestones: [
      { id: "ms_1", title: "Figma UI/UX Prototyping & Design Tokens", date: "2026-03-15", status: "completed", amount: 5000 },
      { id: "ms_2", title: "Make.com & Stripe Webhook Integration", date: "2026-03-28", status: "in_progress", amount: 7500 },
      { id: "ms_3", title: "Client QA Approval & Production Launch", date: "2026-04-15", status: "pending", amount: 6000 }
    ]
  },
  {
    id: "prj_2",
    bizId: "biz_001",
    name: "Automated AI Workflow & Hubspot Billing Pipeline",
    clientName: "Acme Sales & Revenue Ops",
    status: "In Review",
    budget: 8200,
    spent: 7380,
    progress: 90,
    deadline: "2026-03-31",
    description: "Connect Club Flow task completion triggers with Hubspot deal stage updates and automated Slack invoice receipts.",
    teamInitials: ["MJ", "SC"],
    milestones: [
      { id: "ms_2_1", title: "Hubspot API OAuth & Webhook Mapping", date: "2026-03-18", status: "completed", amount: 4000 },
      { id: "ms_2_2", title: "Automated Error Handling & Retry Logic", date: "2026-03-29", status: "in_progress", amount: 4200 }
    ]
  },
  {
    id: "prj_3",
    bizId: "biz_001",
    name: "Acme Brand Evolution & Interactive Web App",
    clientName: "Internal Marketing Lead",
    status: "Active",
    budget: 24000,
    spent: 10800,
    progress: 45,
    deadline: "2026-05-10",
    description: "Creation of next-gen interactive website featuring dynamic glassmorphic elements, 3D hero banners, and high-conversion copy.",
    teamInitials: ["SC", "EW"],
    milestones: [
      { id: "ms_3_1", title: "Brand Identity Discovery & Guidelines", date: "2026-03-10", status: "completed", amount: 8000 },
      { id: "ms_3_2", title: "Frontend Development in React & Vite", date: "2026-04-20", status: "in_progress", amount: 10000 },
      { id: "ms_3_3", title: "Performance Optimization & Launch", date: "2026-05-10", status: "pending", amount: 6000 }
    ]
  },
  {
    id: "prj_tech_1",
    bizId: "biz_002",
    name: "AI Support Agent & Escalation Router",
    clientName: "TechStart SaaS Clients",
    status: "Active",
    budget: 15000,
    spent: 9200,
    progress: 62,
    deadline: "2026-04-12",
    description: "Deploying high-speed LLM triage endpoints to answer 80% of level-1 tickets automatically.",
    teamInitials: ["AR", "LP"],
    milestones: [
      { id: "ms_t_1", title: "System Prompt Fine-tuning", date: "2026-03-22", status: "completed", amount: 6000 },
      { id: "ms_t_2", title: "Zendesk & Slack Escalation Webhooks", date: "2026-04-12", status: "in_progress", amount: 9000 }
    ]
  }
];

const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: "int_1",
    bizId: "biz_001",
    provider: "Make.com",
    name: "Make.com (Integromat) Master Engine",
    description: "Instant bi-directional sync between Club Flow Kanban status changes, CRM deals, and custom client webhooks.",
    connected: true,
    webhookUrl: "https://hook.us1.make.com/ewcf-master-engine-sync-9921",
    lastTriggered: "4 minutes ago",
    eventsCount: 1429,
    autoSync: true
  },
  {
    id: "int_2",
    bizId: "biz_001",
    provider: "Stripe",
    name: "Stripe Billing & MRR Automation",
    description: "Automatically trigger invoice generation and update subscription status when client milestones are marked approved.",
    connected: true,
    webhookUrl: "https://api.stripe.com/v1/webhooks/ewcf_acme_prod",
    lastTriggered: "3 hours ago",
    eventsCount: 384,
    autoSync: true
  },
  {
    id: "int_3",
    bizId: "biz_001",
    provider: "Slack",
    name: "Slack Activity Feed & Review Bot",
    description: "Post instant interactive review cards with [Approve] and [Request Revision] buttons into `#acme-flow-engine`.",
    connected: true,
    webhookUrl: "https://hooks.slack.com/services/T8832/B9914/ewcf_notify_secret",
    lastTriggered: "18 minutes ago",
    eventsCount: 892,
    autoSync: true
  },
  {
    id: "int_4",
    bizId: "biz_001",
    provider: "Figma",
    name: "Figma Live Prototype Embeds",
    description: "Inspect live design files and comment threads right inside Club Flow deliverable review modals.",
    connected: true,
    lastTriggered: "1 day ago",
    eventsCount: 156,
    autoSync: false
  },
  {
    id: "int_5",
    bizId: "biz_001",
    provider: "Google Drive",
    name: "Google Drive Asset Storage",
    description: "Auto-create organized client folders and upload deliverable zip bundles for seamless client handoff.",
    connected: true,
    lastTriggered: "6 hours ago",
    eventsCount: 210,
    autoSync: true
  },
  {
    id: "int_6",
    bizId: "biz_001",
    provider: "GitHub",
    name: "GitHub PR & Commit Linked Cards",
    description: "Link commits and pull requests directly to Engineering tasks and auto-move cards when PR is merged.",
    connected: false,
    autoSync: false
  }
];

const DEFAULT_LOGS: LogItem[] = [
  { id: "log_1", text: "Ultra Admin entered Acme Corp workspace (Platform God Mode active)", time: "1 min ago", type: "ultra", actor: "⚡ Ultra Admin" },
  { id: "log_2", text: "Make.com Webhook triggered: Task 'Redesign Checkout Flow UI/UX' synced to CRM", time: "14 mins ago", type: "webhook", actor: "Make.com Bot" },
  { id: "log_3", text: "Emma Wilson submitted deliverable 'Q3 Campaign Vertical Reels v2' for review", time: "2 hours ago", type: "submission", actor: "Emma Wilson" },
  { id: "log_4", text: "Subscription webhook triggered: Pro Plan renewed (R2 499/mo collected)", time: "6 hours ago", type: "sys", actor: "Billing Engine" },
  { id: "log_5", text: "New team member Lisa Park invited to TechStart Inc workspace", time: "1 day ago", type: "biz", actor: "Alex Rivera" },
  { id: "log_6", text: "StyleBoutique workspace suspended due to recurring billing failure", time: "2 days ago", type: "alert", actor: "Billing Guard" }
];

const DEFAULT_WALLETS: WalletBalance[] = [
  {
    bizId: "biz_001",
    availableBalance: 18450.00,
    pendingEscrow: 6000.00,
    totalCollected: 48900.00,
    stripeAccountStatus: "connected",
    cryptoAddress: "0x71C...B29a (Base / ETH)",
    bitcoinAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    bankAccountMask: "Chase Checking ****8821"
  },
  {
    bizId: "biz_002",
    availableBalance: 4250.00,
    pendingEscrow: 1500.00,
    totalCollected: 12400.00,
    stripeAccountStatus: "connected",
    cryptoAddress: "0x34A...91fC (Solana)",
    bitcoinAddress: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    bankAccountMask: "Silicon Valley Bank ****4412"
  },
  {
    bizId: "biz_003",
    availableBalance: 850.00,
    pendingEscrow: 0.00,
    totalCollected: 3200.00,
    stripeAccountStatus: "pending",
    bankAccountMask: "Wells Fargo ****9901"
  },
  {
    bizId: "biz_004",
    availableBalance: 0.00,
    pendingEscrow: 0.00,
    totalCollected: 1100.00,
    stripeAccountStatus: "unlinked"
  }
];

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx_101",
    bizId: "biz_001",
    type: "client_payment",
    amount: 5000.00,
    fee: 145.30,
    netAmount: 4854.70,
    status: "completed",
    clientName: "Acme Global Enterprise",
    projectOrMilestoneTitle: "Figma UI/UX Prototyping & Design Tokens (Milestone #1)",
    paymentMethod: "stripe_card",
    timestamp: "2026-03-15 14:22:00",
    receiptUrl: "https://pay.elitewayclub.com/receipts/rcpt_101"
  },
  {
    id: "tx_102",
    bizId: "biz_001",
    type: "client_payment",
    amount: 7500.00,
    fee: 217.80,
    netAmount: 7282.20,
    status: "completed",
    clientName: "Acme Global Enterprise",
    projectOrMilestoneTitle: "Make.com & Stripe Webhook Integration (Milestone #2)",
    paymentMethod: "usdc_crypto",
    timestamp: "2026-03-24 18:05:00",
    receiptUrl: "https://pay.elitewayclub.com/receipts/rcpt_102"
  },
  {
    id: "tx_103",
    bizId: "biz_001",
    type: "escrow_deposit",
    amount: 6000.00,
    fee: 174.30,
    netAmount: 5825.70,
    status: "pending",
    clientName: "Acme Global Enterprise",
    projectOrMilestoneTitle: "Client QA Approval & Production Launch (Milestone #3)",
    paymentMethod: "apple_pay",
    timestamp: "2026-03-26 09:15:00"
  },
  {
    id: "tx_104",
    bizId: "biz_001",
    type: "client_payment",
    amount: 4000.00,
    fee: 116.30,
    netAmount: 3883.70,
    status: "completed",
    clientName: "Acme Sales & Revenue Ops",
    projectOrMilestoneTitle: "Hubspot API OAuth & Webhook Mapping (Milestone #1)",
    paymentMethod: "stripe_card",
    timestamp: "2026-03-18 11:40:00",
    receiptUrl: "https://pay.elitewayclub.com/receipts/rcpt_104"
  }
];

const DEFAULT_CHECKOUT_LINKS: PaymentCheckoutLink[] = [
  {
    id: "chk_001",
    bizId: "biz_001",
    title: "Client QA Approval & Production Launch (Milestone #3)",
    description: "Final milestone invoice for Acme Global Enterprise. Includes Make.com live sync testing and deployment.",
    amount: 6000.00,
    clientEmail: "david@client.org",
    clientName: "David Miller (Acme Global)",
    status: "unpaid",
    dueDate: "2026-04-15",
    checkoutUrl: "https://pay.elitewayclub.com/checkouts/chk_001",
    linkedProjectId: "prj_1",
    linkedMilestoneId: "ms_3",
    createdAt: "2026-03-20"
  },
  {
    id: "chk_002",
    bizId: "biz_001",
    title: "Automated Error Handling & Retry Logic (Milestone #2)",
    description: "Hubspot billing pipeline milestone completion invoice for Sales & Revenue Ops.",
    amount: 4200.00,
    clientEmail: "revenue@acme-sales.com",
    clientName: "Acme Sales & Revenue Ops",
    status: "unpaid",
    dueDate: "2026-03-31",
    checkoutUrl: "https://pay.elitewayclub.com/checkouts/chk_002",
    linkedProjectId: "prj_2",
    linkedMilestoneId: "ms_2_2",
    createdAt: "2026-03-22"
  },
  {
    id: "chk_003",
    bizId: "biz_001",
    title: "Brand Identity Discovery & Guidelines (Milestone #1)",
    description: "Pre-paid discovery sprint deliverable package invoice.",
    amount: 8000.00,
    clientEmail: "marketing@acme.com",
    clientName: "Internal Marketing Lead",
    status: "paid",
    dueDate: "2026-03-10",
    checkoutUrl: "https://pay.elitewayclub.com/checkouts/chk_003",
    linkedProjectId: "prj_3",
    linkedMilestoneId: "ms_3_1",
    createdAt: "2026-03-01"
  }
];

const DEFAULT_OUTREACH_CONTACTS: OutreachContact[] = [
  {
    id: 'contact_001', bizId: 'biz_001', name: 'Nomsa Dlamini', organisation: 'Ubuntu Youth Foundation',
    phone: '+27 82 555 0142', email: 'nomsa@ubuntuyouth.org.za', pipelineStage: 'follow_up',
    reason: 'Follow up on the partnership proposal sent three days ago', lastContactedAt: '2026-03-24T10:15:00',
    nextFollowUpAt: new Date().toISOString(), assignedTo: 'EW', assignedName: 'Emma Wilson', optedOut: false,
    createdAt: '2026-03-10', history: [
      { id: 'call_001', outcome: 'answered', note: 'Interested in the youth summit partnership. Requested a formal proposal.', staffName: 'Emma Wilson', staffInitials: 'EW', timestamp: '2026-03-24T10:15:00' }
    ]
  },
  {
    id: 'contact_002', bizId: 'biz_001', name: 'Thabo Molefe', organisation: 'Molefe & Partners',
    phone: '+27 71 440 8821', email: 'thabo@molefepartners.co.za', pipelineStage: 'proposal',
    reason: 'Confirm decision on the operations support proposal', lastContactedAt: '2026-03-22T14:20:00',
    nextFollowUpAt: new Date().toISOString(), assignedTo: 'MJ', assignedName: 'Mike Johnson', optedOut: false,
    createdAt: '2026-03-08', history: [
      { id: 'call_002', outcome: 'busy_no_answer', note: 'No answer. Left a short voicemail.', staffName: 'Mike Johnson', staffInitials: 'MJ', timestamp: '2026-03-22T14:20:00' }
    ]
  },
  {
    id: 'contact_003', bizId: 'biz_001', name: 'Ayesha Khan', organisation: 'Cape Learning Network',
    phone: '+27 83 212 0074', email: 'ayesha@cln.org.za', pipelineStage: 'new',
    reason: 'First call after referral from partner organisation', nextFollowUpAt: new Date().toISOString(),
    assignedTo: 'SC', assignedName: 'Sarah Chen', optedOut: false, createdAt: '2026-03-25', history: []
  },
  {
    id: 'contact_004', bizId: 'biz_001', name: 'Lerato Ncube', organisation: 'Impact Health SA',
    phone: '+27 79 810 3302', email: 'lerato@impacthealth.co.za', pipelineStage: 'dormant',
    reason: 'Re-engage after 30 days without contact', lastContactedAt: '2026-02-20T09:00:00',
    nextFollowUpAt: new Date().toISOString(), assignedTo: 'EW', assignedName: 'Emma Wilson', optedOut: false,
    createdAt: '2026-02-01', history: []
  }
];

const DEFAULT_DAILY_QUEUES: DailyQueueItem[] = [];

const DEFAULT_MAKE_NOTIFICATIONS: Integration[] = [
  {
    id: 'int_make_001',
    bizId: 'biz_001',
    provider: 'Make.com',
    name: 'Make: Submission → In Review + Manager Notify',
    description: 'When work is submitted, Make.com moves the board card, notifies managers, and creates a review reminder.',
    connected: true,
    webhookUrl: 'https://hook.us1.make.com/ewcf-submissions-review-001',
    lastTriggered: '5 minutes ago',
    eventsCount: 88,
    autoSync: true
  },
  {
    id: 'int_make_002',
    bizId: 'biz_001',
    provider: 'Make.com',
    name: 'Make: Project Milestone → Board Sync',
    description: 'Milestone completion updates dashboards, board cards, and activity logs for project-level visibility.',
    connected: true,
    webhookUrl: 'https://hook.us1.make.com/ewcf-project-milestones-002',
    lastTriggered: '18 minutes ago',
    eventsCount: 64,
    autoSync: true
  },
  {
    id: 'int_make_003',
    bizId: 'biz_001',
    provider: 'Make.com',
    name: 'Make: Escalation Alerts for Slow Progress',
    description: 'If velocity drops or deadlines approach, Make.com triggers priority reminders to managers and executives.',
    connected: true,
    webhookUrl: 'https://hook.us1.make.com/ewcf-slow-progress-alerts-003',
    lastTriggered: '1 hour ago',
    eventsCount: 41,
    autoSync: true
  },
  {
    id: 'int_make_004',
    bizId: 'biz_001',
    provider: 'Make.com',
    name: 'Make: Event Planning Task Sync',
    description: 'New event planning tasks appear on Kanban, update status automatically, and post notifications to the event lead.',
    connected: true,
    webhookUrl: 'https://hook.us1.make.com/ewcf-event-task-sync-004',
    lastTriggered: '2 hours ago',
    eventsCount: 29,
    autoSync: true
  }
];

const DEFAULT_RESOURCES: import('../types').ResourceItem[] = [
  {
    id: 'res_ops_001',
    bizId: 'biz_001',
    title: 'Q2 Operating Rhythm & Daily Standup Guide',
    description: 'Daily task ownership, checks-in, and manager review cadence for all project and operations meetings.',
    type: 'policy',
    url: 'https://documents.elitewayclub.com/acme/ops/q2-operating-rhythm.pdf',
    ownerName: 'Sarah Chen',
    category: 'Operations',
    uploadedAt: '2026-03-12',
    tags: ['daily-ops', 'standup', 'manager-review'],
    visibility: 'team'
  },
  {
    id: 'res_proj_001',
    bizId: 'biz_001',
    title: 'Client Portal Refresh Project Pack',
    description: 'Milestone map, approved user journeys, API discovery notes, and QA template for portal refresh work.',
    type: 'template',
    url: 'https://documents.elitewayclub.com/acme/projects/client-portal-refresh-pack.zip',
    ownerName: 'Mike Johnson',
    category: 'Projects',
    uploadedAt: '2026-03-16',
    tags: ['client-portal', 'qa', 'milestones'],
    visibility: 'admin_manager'
  },
  {
    id: 'res_make_001',
    bizId: 'biz_001',
    title: 'Make.com Sync Reference Templates',
    description: 'Webhook payload reference docs and sample automations for board moves, alerts, and CRM handoffs.',
    type: 'document',
    url: 'https://us1.make.com/templates/ewcf-board-sync-reference',
    ownerName: 'Platform Integrations',
    category: 'Make.com',
    uploadedAt: '2026-03-18',
    tags: ['make.com', 'automation', 'webhooks'],
    visibility: 'admin_manager'
  },
  {
    id: 'res_event_001',
    bizId: 'biz_001',
    title: 'Summit Vendor Shortlist & Event Planning Checklist',
    description: 'Approved logistics suppliers, stage specs, catering notes, and final event day checklist for Johannesburg events.',
    type: 'archive',
    url: 'https://documents.elitewayclub.com/acme/events/summit-event-checklist.xlsx',
    ownerName: 'Sarah Chen',
    category: 'Events',
    uploadedAt: '2026-03-21',
    tags: ['events', 'vendors', 'summit'],
    visibility: 'team'
  }
];

const DEFAULT_EVENT_SUBACCOUNTS: EventSubaccount[] = [
  {
    id: 'evsub_001',
    bizId: 'biz_001',
    tier: 'pro',
    monthlyFeeZAR: 1499,
    activatedAt: '2026-02-01',
    activeUntil: '2026-12-31',
    status: 'active',
    eventsCreated: 2,
    totalRevenueZAR: 218500,
    activatedBy: '⚡ Ultra Admin'
  },
  {
    id: 'evsub_002',
    bizId: 'biz_002',
    tier: 'basic',
    monthlyFeeZAR: 499,
    activatedAt: '2026-03-05',
    activeUntil: '2026-12-31',
    status: 'active',
    eventsCreated: 1,
    totalRevenueZAR: 45000,
    activatedBy: '⚡ Ultra Admin'
  }
];

const DEFAULT_EVENTS: EventPlan[] = [
  {
    id: 'evt_001',
    bizId: 'biz_001',
    subaccountId: 'evsub_001',
    name: 'Acme Innovate Summit 2026',
    description: 'Annual flagship technology and innovation summit bringing together 500+ industry leaders, developers, and creative agencies for two days of keynotes, workshops, and networking.',
    eventDate: '2026-06-15',
    venue: 'Sandton Convention Centre',
    city: 'Johannesburg',
    expectedAttendees: 500,
    budgetZAR: 850000,
    spentZAR: 342000,
    ticketPriceZAR: 2499,
    ticketsSold: 187,
    status: 'planning',
    category: 'Conference',
    teamMembers: ['SC', 'MJ', 'EW'],
    createdAt: '2026-02-10',
    planningTasks: [
      { id: 'evt_t1', title: 'Confirm venue booking & signed contract', description: 'Sandton Convention Centre booking for June 14-16 setup + event days', assigneeName: 'Sarah Chen', assigneeInitials: 'SC', dueDate: '2026-04-01', status: 'done', category: 'Venue', budgetZAR: 180000, createdAt: '2026-02-11' },
      { id: 'evt_t2', title: 'Book keynote speakers (3 confirmed)', description: 'Reach out to Vusi Thembekwayo, Bridgette Radebe, and international speaker', assigneeName: 'Mike Johnson', assigneeInitials: 'MJ', dueDate: '2026-04-20', status: 'in_progress', category: 'Talent', budgetZAR: 220000, createdAt: '2026-02-12' },
      { id: 'evt_t3', title: 'Design & print marketing materials', description: 'Banners, brochures, name tags, welcome packs (500 units)', assigneeName: 'Emma Wilson', assigneeInitials: 'EW', dueDate: '2026-05-15', status: 'pending', category: 'Marketing', budgetZAR: 45000, createdAt: '2026-02-13' },
      { id: 'evt_t4', title: 'Launch Quicket ticket sales page', description: 'Configure Quicket integration with tiered pricing (Early Bird, Standard, VIP)', assigneeName: 'Mike Johnson', assigneeInitials: 'MJ', dueDate: '2026-03-25', status: 'done', category: 'Ticketing', budgetZAR: 12000, createdAt: '2026-02-14' },
      { id: 'evt_t5', title: 'Confirm catering (breakfast, lunch, coffee breaks)', description: 'Get 3 quotes for 500 pax x 2 days including dietary requirements', assigneeName: 'Sarah Chen', assigneeInitials: 'SC', dueDate: '2026-05-01', status: 'in_progress', category: 'Catering', budgetZAR: 165000, createdAt: '2026-02-15' },
      { id: 'evt_t6', title: 'Sponsor packages sign-off & activations', description: 'Follow up with Standard Bank, Vodacom, Discovery for platinum/gold packages', assigneeName: 'Sarah Chen', assigneeInitials: 'SC', dueDate: '2026-04-30', status: 'blocked', category: 'Marketing', budgetZAR: 0, createdAt: '2026-02-16' },
      { id: 'evt_t7', title: 'AV & stage production setup', description: 'LED walls, sound, lighting, streaming setup for hybrid delivery', assigneeName: 'Mike Johnson', assigneeInitials: 'MJ', dueDate: '2026-06-10', status: 'pending', category: 'Setup', budgetZAR: 145000, createdAt: '2026-02-17' }
    ],
    progressUpdates: [
      { id: 'evt_p1', authorName: 'Sarah Chen', authorInitials: 'SC', message: 'Venue contract signed and deposit paid. Sandton Convention Centre locked in for June 14-16.', progressPercent: 15, timestamp: '2026-03-01T10:22:00', isMilestone: true },
      { id: 'evt_p2', authorName: 'Mike Johnson', authorInitials: 'MJ', message: 'Quicket ticket page live! 187 tickets sold in first week — trending strong on Early Bird tier.', attachmentUrl: 'https://quicket.co.za/acme-summit-2026', progressPercent: 32, timestamp: '2026-03-14T15:05:00', isMilestone: true },
      { id: 'evt_p3', authorName: 'Sarah Chen', authorInitials: 'SC', message: 'Verbal confirmation from Vusi Thembekwayo for opening keynote. Waiting on signed agreement.', progressPercent: 40, timestamp: '2026-03-20T09:15:00' },
      { id: 'evt_p4', authorName: 'Emma Wilson', authorInitials: 'EW', message: 'Started brand identity for the summit — colours, name tag design, and event app icons. Sharing Figma link tomorrow.', progressPercent: 42, timestamp: '2026-03-22T14:40:00' }
    ],
    followUps: [
      { id: 'evt_f1', fromName: 'Sarah Chen', toName: 'Mike Johnson', toInitials: 'MJ', message: 'Mike, please push Standard Bank sponsor contract to sign this week — we need R150k committed by end of month.', status: 'acknowledged', reply: 'On it Sarah. Meeting scheduled for Wednesday. Will send you feedback by Thursday EOD.', createdAt: '2026-03-15T11:00:00', respondedAt: '2026-03-15T14:22:00' },
      { id: 'evt_f2', fromName: 'Sarah Chen', toName: 'Emma Wilson', toInitials: 'EW', message: 'Emma, when can we expect first draft of event brochures? Need to send to printers by end of April.', status: 'pending', createdAt: '2026-03-24T09:30:00' }
    ]
  },
  {
    id: 'evt_002',
    bizId: 'biz_001',
    subaccountId: 'evsub_001',
    name: 'Q3 Client Appreciation Gala',
    description: 'Exclusive black-tie evening for top 100 clients with dinner, awards, and live entertainment.',
    eventDate: '2026-04-25',
    venue: 'The Maslow Hotel',
    city: 'Johannesburg',
    expectedAttendees: 100,
    budgetZAR: 285000,
    spentZAR: 195000,
    ticketPriceZAR: 0,
    ticketsSold: 87,
    status: 'confirmed',
    category: 'Gala',
    teamMembers: ['SC', 'EW'],
    createdAt: '2026-01-20',
    planningTasks: [
      { id: 'evt_g1', title: 'Venue confirmed — The Maslow ballroom', assigneeName: 'Sarah Chen', assigneeInitials: 'SC', dueDate: '2026-02-15', status: 'done', category: 'Venue', budgetZAR: 95000, createdAt: '2026-01-21' },
      { id: 'evt_g2', title: 'Live band & MC booked (Zonke + Anele Mdoda)', assigneeName: 'Emma Wilson', assigneeInitials: 'EW', dueDate: '2026-03-01', status: 'done', category: 'Talent', budgetZAR: 75000, createdAt: '2026-01-22' },
      { id: 'evt_g3', title: 'RSVP tracking & seating plan', assigneeName: 'Sarah Chen', assigneeInitials: 'SC', dueDate: '2026-04-15', status: 'in_progress', category: 'Logistics', createdAt: '2026-02-01' },
      { id: 'evt_g4', title: 'Custom client gift bags (100 units)', assigneeName: 'Emma Wilson', assigneeInitials: 'EW', dueDate: '2026-04-20', status: 'in_progress', category: 'Marketing', budgetZAR: 25000, createdAt: '2026-02-05' }
    ],
    progressUpdates: [
      { id: 'evt_gp1', authorName: 'Sarah Chen', authorInitials: 'SC', message: 'Venue and band confirmed! Menu tasting scheduled for next week.', progressPercent: 55, timestamp: '2026-03-05T10:00:00', isMilestone: true },
      { id: 'evt_gp2', authorName: 'Emma Wilson', authorInitials: 'EW', message: '87 RSVPs confirmed out of 100 invited. Following up with the remaining 13.', progressPercent: 68, timestamp: '2026-03-20T16:30:00' }
    ],
    followUps: []
  },
  {
    id: 'evt_003',
    bizId: 'biz_002',
    subaccountId: 'evsub_002',
    name: 'TechStart Founder Workshop Series',
    description: 'Monthly workshop for early-stage SaaS founders on scaling and fundraising.',
    eventDate: '2026-04-12',
    venue: 'Workshop17 Sea Point',
    city: 'Cape Town',
    expectedAttendees: 40,
    budgetZAR: 65000,
    spentZAR: 18500,
    ticketPriceZAR: 1250,
    ticketsSold: 22,
    status: 'planning',
    category: 'Workshop',
    teamMembers: ['AR', 'LP'],
    createdAt: '2026-03-01',
    planningTasks: [
      { id: 'evt_w1', title: 'Workshop17 booking confirmed', assigneeName: 'Alex Rivera', assigneeInitials: 'AR', dueDate: '2026-03-15', status: 'done', category: 'Venue', budgetZAR: 8500, createdAt: '2026-03-02' },
      { id: 'evt_w2', title: 'Speaker deck & workshop materials', assigneeName: 'Lisa Park', assigneeInitials: 'LP', dueDate: '2026-04-05', status: 'in_progress', category: 'Talent', createdAt: '2026-03-03' }
    ],
    progressUpdates: [],
    followUps: []
  }
];

let kanbanLinkBootstrapRan = false;

function bootstrapKanbanLinks() {
  // Mirrors existing project milestones & event planning tasks onto the kanban board exactly once per session
  try {
    const businesses: Business[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESSES) || '[]');
    const projects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
    const events: EventPlan[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENT_PLANS) || '[]');
    projects.forEach(p => syncProjectMilestonesToKanban(p, businesses.find(b => b.id === p.bizId), 'System'));
    events.forEach(e => e.planningTasks.forEach(pt => syncEventTaskToKanban(e, pt, 'System')));
  } catch {
    // no-op if storage unavailable
  }
}

export function initStore() {
  if (!localStorage.getItem(STORAGE_KEYS.BUSINESSES)) {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(DEFAULT_BUSINESSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INTEGRATIONS)) {
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify([...DEFAULT_INTEGRATIONS, ...DEFAULT_MAKE_NOTIFICATIONS]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WALLETS)) {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHECKOUT_LINKS)) {
    localStorage.setItem(STORAGE_KEYS.CHECKOUT_LINKS, JSON.stringify(DEFAULT_CHECKOUT_LINKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENT_SUBACCOUNTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENT_SUBACCOUNTS, JSON.stringify(DEFAULT_EVENT_SUBACCOUNTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENT_PLANS)) {
    localStorage.setItem(STORAGE_KEYS.EVENT_PLANS, JSON.stringify(DEFAULT_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(DEFAULT_RESOURCES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.OUTREACH_CONTACTS)) {
    localStorage.setItem(STORAGE_KEYS.OUTREACH_CONTACTS, JSON.stringify(DEFAULT_OUTREACH_CONTACTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DAILY_QUEUES)) {
    localStorage.setItem(STORAGE_KEYS.DAILY_QUEUES, JSON.stringify(DEFAULT_DAILY_QUEUES));
  }

  if (!kanbanLinkBootstrapRan) {
    kanbanLinkBootstrapRan = true;
    bootstrapKanbanLinks();
  }
}

export function resetToDefaultData() {
  localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(DEFAULT_BUSINESSES));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify([...DEFAULT_INTEGRATIONS, ...DEFAULT_MAKE_NOTIFICATIONS]));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
  localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.CHECKOUT_LINKS, JSON.stringify(DEFAULT_CHECKOUT_LINKS));
  localStorage.setItem(STORAGE_KEYS.EVENT_SUBACCOUNTS, JSON.stringify(DEFAULT_EVENT_SUBACCOUNTS));
  localStorage.setItem(STORAGE_KEYS.EVENT_PLANS, JSON.stringify(DEFAULT_EVENTS));
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(DEFAULT_RESOURCES));
  localStorage.setItem(STORAGE_KEYS.OUTREACH_CONTACTS, JSON.stringify(DEFAULT_OUTREACH_CONTACTS));
  localStorage.setItem(STORAGE_KEYS.DAILY_QUEUES, JSON.stringify(DEFAULT_DAILY_QUEUES));
}

// --- BUSINESSES ---
export function getBusinesses(): Business[] {
  initStore();
  const businesses: Business[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESSES) || '[]');
  const eventSubs: EventSubaccount[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENT_SUBACCOUNTS) || '[]');
  return businesses.map(b => ({
    ...b,
    stats: {
      ...b.stats,
      mrr: PLAN_ACCESS[b.plan]?.monthlyZAR || PLAN_ACCESS.starter.monthlyZAR
    },
    institutionType: b.institutionType || 'business',
    whiteLabelEnabled: PLAN_ACCESS[b.plan]?.whiteLabel ? Boolean(b.whiteLabelEnabled) : false,
    monthlyBudgetZAR: PLAN_ACCESS[b.plan]?.monthlyZAR || PLAN_ACCESS.starter.monthlyZAR,
    enabledFeatures: getPlanFeatures(
      b.plan,
      b.customFeatureAddOns || [],
      eventSubs.some(s => s.bizId === b.id && s.status === 'active')
    )
  }));
}

export function saveBusinesses(list: Business[]) {
  localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(list));
}

export function addBusiness(biz: Business) {
  const list = getBusinesses();
  list.unshift(biz);
  saveBusinesses(list);
  addLog(`Ultra Admin created new workspace: ${biz.name}`, 'ultra', '⚡ Ultra Admin');
}

export function toggleBusinessStatus(bizId: string): Business | null {
  const list = getBusinesses();
  const biz = list.find(b => b.id === bizId);
  if (biz) {
    biz.status = biz.status === 'active' ? 'suspended' : 'active';
    saveBusinesses(list);
    addLog(`Workspace '${biz.name}' status toggled to ${biz.status.toUpperCase()}`, 'ultra', '⚡ Ultra Admin');
    return biz;
  }
  return null;
}

export function updateBusinessFeatureAllocation(
  bizId: string,
  monthlyBudgetZAR: number,
  enabledFeatures: BusinessFeature[],
  actorName: string
): { success: boolean; message: string; business?: Business; requiredBudgetZAR?: number } {
  const requiredBudgetZAR = enabledFeatures.reduce((sum, feature) => sum + BUSINESS_FEATURE_CATALOG[feature].monthlyZAR, 0);
  if (monthlyBudgetZAR < requiredBudgetZAR) {
    return {
      success: false,
      message: `Selected functions require ${formatZAR(requiredBudgetZAR)}/mo, but the allocated budget is ${formatZAR(monthlyBudgetZAR)}/mo.`,
      requiredBudgetZAR
    };
  }

  const businesses = getBusinesses();
  const business = businesses.find(b => b.id === bizId);
  if (!business) return { success: false, message: 'Business workspace not found' };

  business.monthlyBudgetZAR = monthlyBudgetZAR;
  business.enabledFeatures = enabledFeatures;
  saveBusinesses(businesses);
  addLog(`${actorName} allocated ${formatZAR(monthlyBudgetZAR)}/mo to ${business.name} with ${enabledFeatures.length} enabled functions`, 'ultra', actorName, bizId);
  return { success: true, message: `${business.name} functions updated within ${formatZAR(monthlyBudgetZAR)}/mo budget.`, business, requiredBudgetZAR };
}

export function updateBusinessPlanAccess(
  bizId: string,
  plan: PlanTier,
  customFeatureAddOns: BusinessFeature[],
  callAgreementRef: string,
  actorName: string,
  whiteLabelEnabled?: boolean,
  whiteLabelName?: string,
  logoUrl?: string,
  primaryColor?: string,
  secondaryColor?: string
): { success: boolean; message: string; business?: Business } {
  const businesses = getBusinesses();
  const business = businesses.find(b => b.id === bizId);
  if (!business) return { success: false, message: 'Business or institution workspace not found' };

  const hasCustomAddOns = customFeatureAddOns.length > 0;
  if (hasCustomAddOns && !callAgreementRef.trim()) {
    return { success: false, message: 'Custom add-ons require a paid call agreement reference before they can be enabled.' };
  }

  const eventsAsAddon = customFeatureAddOns.includes('events');
  if (eventsAsAddon) {
    return { success: false, message: 'Events is its own plan. Activate it from the Event Subaccounts area, not as a custom add-on.' };
  }

  const planInfo = PLAN_ACCESS[plan];
  business.plan = plan;
  business.stats.mrr = planInfo.monthlyZAR;
  business.monthlyBudgetZAR = planInfo.monthlyZAR;
  business.customFeatureAddOns = customFeatureAddOns;
  business.callAgreementRef = callAgreementRef.trim() || undefined;
  business.enabledFeatures = getPlanFeatures(plan, customFeatureAddOns, getEventSubaccountForBiz(bizId) !== null);
  business.whiteLabelEnabled = planInfo.whiteLabel && Boolean(whiteLabelEnabled);
  business.whiteLabelName = planInfo.whiteLabel ? whiteLabelName?.trim() || business.name : business.name;
  if (logoUrl !== undefined && planInfo.whiteLabel) business.logoUrl = logoUrl.trim() || undefined;
  if (primaryColor) business.primaryColor = primaryColor;
  if (secondaryColor) business.secondaryColor = secondaryColor;

  saveBusinesses(businesses);

  addLog(
    `${actorName} moved ${business.name} to ${planInfo.label} (${formatZAR(planInfo.monthlyZAR)}/mo) with ${customFeatureAddOns.length} paid-call add-on(s)`,
    'ultra',
    actorName,
    bizId
  );

  return { success: true, message: `${business.name} now uses ${planInfo.label} at ${formatZAR(planInfo.monthlyZAR)}/mo.`, business };
}

// --- TEAM MEMBERS ---
export function addTeamMember(bizId: string, newUser: User, actorName: string): { success: boolean; message: string } {
  const list = getBusinesses();
  const biz = list.find(b => b.id === bizId);
  if (!biz) {
    return { success: false, message: 'Workspace not found' };
  }

  // Prevent duplicate emails within same workspace
  if (biz.users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
    return { success: false, message: 'A team member with this email already exists in this workspace' };
  }

  // Prevent duplicate emails across all workspaces
  for (const otherBiz of list) {
    if (otherBiz.id !== bizId && otherBiz.users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return { success: false, message: `Email already registered in workspace "${otherBiz.name}"` };
    }
  }

  biz.users.push(newUser);
  biz.stats.members = biz.users.length;
  saveBusinesses(list);
  addLog(`New team member ${newUser.name} (${newUser.role}) added to ${biz.name} by ${actorName}`, 'biz', actorName, bizId);
  return { success: true, message: `${newUser.name} added successfully. They can log in immediately with ${newUser.email}` };
}

export function removeTeamMember(bizId: string, userId: string, actorName: string): { success: boolean; message: string } {
  const list = getBusinesses();
  const biz = list.find(b => b.id === bizId);
  if (!biz) return { success: false, message: 'Workspace not found' };

  const user = biz.users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.role === 'admin' && biz.users.filter(u => u.role === 'admin').length <= 1) {
    return { success: false, message: 'Cannot remove the last Admin of this workspace. Promote another member first.' };
  }

  biz.users = biz.users.filter(u => u.id !== userId);
  biz.stats.members = biz.users.length;
  saveBusinesses(list);
  addLog(`${user.name} removed from ${biz.name} by ${actorName}`, 'alert', actorName, bizId);
  return { success: true, message: `${user.name} has been removed from ${biz.name}` };
}

export function updateTeamMember(bizId: string, userId: string, updates: Partial<User>, actorName: string): { success: boolean; message: string; updatedUser?: User } {
  const list = getBusinesses();
  const biz = list.find(b => b.id === bizId);
  if (!biz) return { success: false, message: 'Workspace not found' };

  const user = biz.users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };

  // If changing email, check for duplicates across all workspaces
  if (updates.email && updates.email.toLowerCase() !== user.email.toLowerCase()) {
    for (const otherBiz of list) {
      if (otherBiz.users.some(u => u.id !== userId && u.email.toLowerCase() === updates.email!.toLowerCase())) {
        return { success: false, message: `Email already registered${otherBiz.id !== bizId ? ` in workspace "${otherBiz.name}"` : ''}` };
      }
    }
  }

  // Prevent demoting the last admin
  if (updates.role && updates.role !== 'admin' && user.role === 'admin') {
    const adminCount = biz.users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, message: 'Cannot demote the last Admin. Promote another member to Admin first.' };
    }
  }

  const oldName = user.name;
  const oldRole = user.role;

  // Apply updates
  if (updates.name !== undefined) {
    user.name = updates.name;
    // Regenerate initials if name changed
    const parts = updates.name.trim().split(/\s+/);
    user.initials = parts.length === 1
      ? parts[0].substring(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (updates.email !== undefined) user.email = updates.email.toLowerCase();
  if (updates.password !== undefined) user.password = updates.password;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.department !== undefined) user.department = updates.department;

  saveBusinesses(list);

  const changes: string[] = [];
  if (updates.name && updates.name !== oldName) changes.push(`name → ${updates.name}`);
  if (updates.email) changes.push(`email → ${updates.email}`);
  if (updates.role && updates.role !== oldRole) changes.push(`role → ${updates.role}`);
  if (updates.password) changes.push('password reset');
  if (updates.department) changes.push(`department → ${updates.department}`);

  addLog(`${oldName} updated in ${biz.name} (${changes.join(', ')}) by ${actorName}`, 'biz', actorName, bizId);
  return { success: true, message: `${user.name}'s profile updated successfully`, updatedUser: user };
}

// --- TASKS ---
export function getTasks(): Task[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
}

export function saveTasks(list: Task[]) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));
}

export function addTask(task: Task) {
  const list = getTasks();
  list.unshift(task);
  saveTasks(list);
  
  // Update biz stats
  const bizList = getBusinesses();
  const biz = bizList.find(b => b.id === task.bizId);
  if (biz) {
    biz.stats.tasks += 1;
    saveBusinesses(bizList);
  }
  addLog(`New task added: "${task.title.substring(0, 40)}..."`, 'biz', task.assigneeName || task.assignee);
}

export function updateTask(task: Task) {
  const list = getTasks();
  const idx = list.findIndex(t => t.id === task.id);
  if (idx !== -1) {
    list[idx] = task;
    saveTasks(list);
  }
}

export function moveTask(taskId: string, targetCol: TaskColumn, actorName = 'User'): Task | null {
  const list = getTasks();
  const task = list.find(t => t.id === taskId);
  if (task && task.col !== targetCol) {
    task.col = targetCol;
    saveTasks(list);

    if (targetCol === 'done') {
      const bizList = getBusinesses();
      const biz = bizList.find(b => b.id === task.bizId);
      if (biz) {
        biz.stats.completed += 1;
        saveBusinesses(bizList);
      }
    }

    // Sync back to linked Event planning task
    if (task.linkedEventId && task.linkedEventTaskId) {
      const events = getEvents();
      const evt = events.find(e => e.id === task.linkedEventId);
      if (evt) {
        const pt = evt.planningTasks.find(p => p.id === task.linkedEventTaskId);
        if (pt) {
          pt.status = targetCol === 'done' ? 'done' : targetCol === 'inprogress' || targetCol === 'inreview' ? 'in_progress' : 'pending';
          saveEvents(events);
          addLog(`Kanban sync: Event task "${pt.title}" set to ${pt.status.replace('_', ' ').toUpperCase()} via board move`, 'event', actorName, evt.bizId);
        }
      }
    }

    // Sync back to linked Project milestone
    if (task.linkedProjectId && task.linkedMilestoneId) {
      const projects = getProjects();
      const prj = projects.find(p => p.id === task.linkedProjectId);
      if (prj) {
        const ms = prj.milestones.find(m => m.id === task.linkedMilestoneId);
        if (ms) {
          ms.status = targetCol === 'done' ? 'completed' : targetCol === 'inprogress' || targetCol === 'todo' ? 'in_progress' : 'pending';
          const doneCount = prj.milestones.filter(m => m.status === 'completed').length;
          prj.progress = Math.round((doneCount / prj.milestones.length) * 100);
          saveProjects(projects);
          addLog(`Kanban sync: Project milestone "${ms.title}" now ${ms.status.replace('_', ' ')} (${prj.progress}% complete)`, 'biz', actorName, prj.bizId);
        }
      }
    }

    addLog(`Task "${task.title.substring(0, 35)}..." moved to ${targetCol.toUpperCase()}`, 'biz', actorName);
    addLog(`Make.com sync: sent kanban_move payload for "${task.title.substring(0, 35)}..." → ${targetCol.toUpperCase()} and notified assignee/manager`, 'webhook', 'Make.com Bot', task.bizId);
    return task;
  }
  return null;
}

export function deleteTask(taskId: string) {
  const list = getTasks();
  const filtered = list.filter(t => t.id !== taskId);
  saveTasks(filtered);
}

// --- TASK WORK SUBMISSION & REVIEW ENGINE ---
export function getMyAssignedTasks(bizId: string, userInitials: string): Task[] {
  return getTasks().filter(t => t.bizId === bizId && t.assignee === userInitials);
}

export function submitWorkOnTask(
  taskId: string,
  submitterName: string,
  submitterInitials: string,
  notes: string,
  attachments: Array<{ type: 'link' | 'document' | 'image' | 'video' | 'figma' | 'github'; name: string; url: string; size?: string }>,
  actorName: string
): { success: boolean; message: string; task?: Task } {
  const list = getTasks();
  const task = list.find(t => t.id === taskId);
  if (!task) return { success: false, message: 'Task not found' };

  if (!task.workSubmissions) task.workSubmissions = [];

  const submission = {
    id: 'ws_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    submitterName,
    submitterInitials,
    notes,
    attachments: attachments.map((a, idx) => ({
      id: 'att_' + Date.now() + '_' + idx,
      ...a
    })),
    submittedAt: new Date().toISOString(),
    status: 'pending_review' as const
  };

  task.workSubmissions.unshift(submission);
  task.attachmentsCount = (task.attachmentsCount || 0) + attachments.length;

  // Auto-move to "In Review" column
  const oldCol = task.col;
  task.col = 'inreview';
  task.progressPercent = Math.min(100, Math.max(task.progressPercent || 60, 85));

  if (!task.progressLog) task.progressLog = [];
  task.progressLog.unshift({
    id: 'pl_' + Date.now(),
    percentComplete: task.progressPercent,
    actor: submitterName,
    note: `Submitted work with ${attachments.length} attachment(s). Awaiting manager review.`,
    timestamp: new Date().toISOString()
  });

  saveTasks(list);
  addLog(`${submitterName} submitted work on "${task.title.substring(0, 35)}..." — moved from ${oldCol.toUpperCase()} → IN REVIEW`, 'submission', actorName, task.bizId);
  addLog(`Make.com sync: submission_received webhook moved task to IN REVIEW, notified manager, and created review reminder`, 'webhook', 'Make.com Bot', task.bizId);

  return { success: true, message: `Work submitted successfully! Task moved to "In Review" for manager approval.`, task };
}

export function addTaskFeedbackReport(
  taskId: string,
  report: {
    reviewerName: string;
    reviewerRole: string;
    rating: 1 | 2 | 3 | 4 | 5;
    qualityScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    decision: 'approve' | 'request_revision' | 'reject';
  },
  actorName: string
): { success: boolean; message: string; task?: Task } {
  const list = getTasks();
  const task = list.find(t => t.id === taskId);
  if (!task) return { success: false, message: 'Task not found' };

  if (!task.feedbackReports) task.feedbackReports = [];

  const feedbackEntry = {
    id: 'fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...report,
    reviewedAt: new Date().toISOString()
  };

  task.feedbackReports.unshift(feedbackEntry);

  // Auto-move based on decision
  if (report.decision === 'approve') {
    task.col = 'done';
    task.progressPercent = 100;
    // Mark latest submission as approved
    if (task.workSubmissions && task.workSubmissions[0]) {
      task.workSubmissions[0].status = 'approved';
    }
    // Update biz stats
    const bizList = getBusinesses();
    const biz = bizList.find(b => b.id === task.bizId);
    if (biz) {
      biz.stats.completed += 1;
      saveBusinesses(bizList);
    }
  } else if (report.decision === 'request_revision') {
    task.col = 'inprogress';
    task.progressPercent = Math.max(60, (task.progressPercent || 60) - 15);
    if (task.workSubmissions && task.workSubmissions[0]) {
      task.workSubmissions[0].status = 'needs_revision';
    }
  } else if (report.decision === 'reject') {
    task.col = 'backlog';
    task.progressPercent = 20;
  }

  if (!task.progressLog) task.progressLog = [];
  task.progressLog.unshift({
    id: 'pl_' + Date.now(),
    percentComplete: task.progressPercent || 0,
    actor: report.reviewerName,
    note: `${report.decision.toUpperCase().replace('_', ' ')}: Quality score ${report.qualityScore}/100 (${report.rating}★). ${report.feedback.substring(0, 60)}...`,
    timestamp: new Date().toISOString()
  });

  saveTasks(list);
  addLog(`${report.reviewerName} ${report.decision === 'approve' ? '✓ APPROVED' : report.decision === 'request_revision' ? '↺ REQUESTED REVISION' : '✗ REJECTED'} work on "${task.title.substring(0, 30)}..." (Score: ${report.qualityScore}/100)`, 'submission', actorName, task.bizId);

  return { success: true, message: `Feedback report saved. Task ${report.decision === 'approve' ? 'marked as DONE!' : report.decision === 'request_revision' ? 'sent back for revision' : 'moved to backlog'}.`, task };
}

export function updateTaskProgress(
  taskId: string,
  percent: number,
  actor: string,
  note?: string
): Task | null {
  const list = getTasks();
  const task = list.find(t => t.id === taskId);
  if (!task) return null;

  task.progressPercent = Math.min(100, Math.max(0, percent));
  if (!task.progressLog) task.progressLog = [];
  task.progressLog.unshift({
    id: 'pl_' + Date.now(),
    percentComplete: task.progressPercent,
    actor,
    note,
    timestamp: new Date().toISOString()
  });

  // Auto set startedAt when moving from 0 to > 0
  if (!task.startedAt && percent > 0) {
    task.startedAt = new Date().toISOString();
  }

  saveTasks(list);
  return task;
}

export interface TaskAIStats {
  velocity: number; // % per day
  daysActive: number;
  daysUntilDue: number;
  estimatedCompletionDate: string;
  onTrackStatus: 'on_track' | 'at_risk' | 'critical' | 'overdue' | 'in_grace_period' | 'complete';
  onTrackLabel: string;
  onTrackColor: string;
  hoursRemaining: number;
  productivityScore: number; // 0-100
  riskFactors: string[];
  recommendations: string[];
  gracePeriodEndDate?: string;
  isInGracePeriod: boolean;
}

export function computeTaskAIStats(task: Task): TaskAIStats {
  const now = Date.now();
  const created = new Date(task.createdAt || new Date().toISOString()).getTime();
  const startedAt = task.startedAt ? new Date(task.startedAt).getTime() : created;
  const dueDate = task.dueDate ? new Date(task.dueDate).getTime() : now + 14 * 86400000;
  const gracePeriodDays = task.gracePeriodDays || 3;
  const gracePeriodEnd = dueDate + gracePeriodDays * 86400000;

  const daysActive = Math.max(0.5, (now - startedAt) / 86400000);
  const daysUntilDue = (dueDate - now) / 86400000;
  const daysUntilGraceEnd = (gracePeriodEnd - now) / 86400000;
  const progress = task.progressPercent || (
    task.col === 'done' ? 100 :
    task.col === 'inreview' ? 85 :
    task.col === 'inprogress' ? 55 :
    task.col === 'todo' ? 15 : 0
  );

  const velocity = daysActive > 0 ? progress / daysActive : 0;
  const remaining = 100 - progress;
  const estDaysToComplete = velocity > 0.1 ? remaining / velocity : (remaining > 0 ? 30 : 0);
  const estimatedCompletionDate = new Date(now + estDaysToComplete * 86400000).toISOString().split('T')[0];

  const hoursRemaining = ((task.estimatedHours || 8) * remaining) / 100;

  let onTrackStatus: TaskAIStats['onTrackStatus'] = 'on_track';
  let onTrackLabel = 'On Track';
  let onTrackColor = '#00d4aa';
  let isInGracePeriod = false;

  if (task.col === 'done' || progress >= 100) {
    onTrackStatus = 'complete';
    onTrackLabel = '✓ Complete';
    onTrackColor = '#00d4aa';
  } else if (daysUntilGraceEnd < 0) {
    onTrackStatus = 'overdue';
    onTrackLabel = `Overdue by ${Math.abs(Math.round(daysUntilGraceEnd))} day(s) past grace`;
    onTrackColor = '#ff4d6d';
  } else if (daysUntilDue < 0) {
    onTrackStatus = 'in_grace_period';
    onTrackLabel = `In grace period (${Math.round(daysUntilGraceEnd)} day(s) left)`;
    onTrackColor = '#ffc857';
    isInGracePeriod = true;
  } else if (estDaysToComplete > daysUntilDue + gracePeriodDays) {
    onTrackStatus = 'critical';
    onTrackLabel = 'Critical risk of missing deadline';
    onTrackColor = '#ff4d6d';
  } else if (estDaysToComplete > daysUntilDue) {
    onTrackStatus = 'at_risk';
    onTrackLabel = 'At risk — velocity below required pace';
    onTrackColor = '#ffc857';
  }

  const productivityScore = Math.round(
    Math.min(100, Math.max(0,
      (velocity * 8) +
      (progress * 0.5) +
      (task.workSubmissions?.length ? 20 : 0) +
      (daysUntilDue > 0 ? 10 : -20)
    ))
  );

  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  if (velocity < 3 && progress < 100) {
    riskFactors.push(`Low velocity: ${velocity.toFixed(1)}% per day (target: 5-10%)`);
    recommendations.push('Break task into smaller checklist steps for faster iteration');
  }
  if (daysUntilDue < 3 && progress < 70) {
    riskFactors.push(`Deadline in ${Math.max(0, Math.round(daysUntilDue))} days but only ${progress}% complete`);
    recommendations.push('Escalate priority to URGENT and notify assignee via Slack');
  }
  if (task.priority === 'urgent' && progress < 50) {
    riskFactors.push('Marked URGENT but progress is below 50%');
    recommendations.push('Consider reassigning or pair-programming with a senior team member');
  }
  if (!task.workSubmissions?.length && task.col === 'inprogress' && daysActive > 5) {
    riskFactors.push('No work submissions after 5+ days in progress');
    recommendations.push('Request an interim work sample or checkpoint from assignee');
  }
  if (isInGracePeriod) {
    riskFactors.push(`Task passed due date, currently in ${gracePeriodDays}-day grace period`);
    recommendations.push('Send auto-reminder to assignee within 24 hours');
  }

  if (recommendations.length === 0) {
    recommendations.push('Task is progressing at healthy velocity — no intervention needed');
  }

  return {
    velocity: Math.round(velocity * 10) / 10,
    daysActive: Math.round(daysActive * 10) / 10,
    daysUntilDue: Math.round(daysUntilDue * 10) / 10,
    estimatedCompletionDate,
    onTrackStatus,
    onTrackLabel,
    onTrackColor,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    productivityScore,
    riskFactors,
    recommendations,
    gracePeriodEndDate: new Date(gracePeriodEnd).toISOString().split('T')[0],
    isInGracePeriod
  };
}

// --- SUBMISSIONS ---
export function getSubmissions(): Submission[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
}

export function saveSubmissions(list: Submission[]) {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
}

export function addSubmission(sub: Submission) {
  const list = getSubmissions();
  list.unshift(sub);
  saveSubmissions(list);
  addLog(`Deliverable submitted: "${sub.title}" by ${sub.submitter}`, 'submission', sub.submitter);
}

export function updateSubmissionStatus(subId: string, status: SubmissionStatus, actorName: string): Submission | null {
  const list = getSubmissions();
  const sub = list.find(s => s.id === subId);
  if (sub) {
    sub.status = status;
    saveSubmissions(list);
    addLog(`Deliverable "${sub.title}" marked as ${status.toUpperCase()} by ${actorName}`, 'submission', actorName);
    return sub;
  }
  return null;
}

export function addSubmissionFeedback(subId: string, feedbackText: string, author: string, role: string) {
  const list = getSubmissions();
  const sub = list.find(s => s.id === subId);
  if (sub) {
    sub.feedback.push({
      id: 'fb_' + Date.now(),
      author,
      role,
      text: feedbackText,
      time: 'Just now'
    });
    saveSubmissions(list);
  }
}

// --- PROJECTS ---
export function getProjects(): Project[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
}

export function saveProjects(list: Project[]) {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
}

export function addProject(project: Project) {
  const list = getProjects();
  list.unshift(project);
  saveProjects(list);

  const bizList = getBusinesses();
  const biz = bizList.find(b => b.id === project.bizId);
  if (biz) {
    biz.stats.projects += 1;
    saveBusinesses(bizList);
  }

  // Auto-create linked Kanban cards for every milestone
  syncProjectMilestonesToKanban(project, biz, 'System');

  addLog(`Project board created: "${project.name}" with ${project.milestones.length} milestones, ${project.teamInitials.length} team member(s), and central board visibility for executives and managers`, 'biz', 'Project Lead');
  addLog(`Make.com sync: created project milestones, assigned team members, and queued review reminders for "${project.name}"`, 'webhook', 'Make.com Bot', project.bizId);
}

// Keeps project milestones mirrored as Kanban cards (dedupe by task id)
export function syncProjectMilestonesToKanban(project: Project, biz: Business | undefined, actorName: string) {
  const tasks = getTasks();
  let changed = false;

  const defaultAssignee = biz?.users[0];
  project.milestones.forEach((ms, i) => {
    const taskId = `tsk_prj_${project.id}_${ms.id}`;
    const existing = tasks.find(t => t.id === taskId);
    const targetCol: TaskColumn = ms.status === 'completed' ? 'done' : ms.status === 'in_progress' ? 'inprogress' : 'todo';
    const assignee = project.teamInitials[i % Math.max(1, project.teamInitials.length)] || defaultAssignee?.initials || 'AD';
    const assigneeName = biz?.users.find(u => u.initials === assignee)?.name || assignee;

    if (existing) {
      existing.col = targetCol;
      existing.dueDate = ms.date;
      changed = true;
    } else {
      tasks.unshift({
        id: taskId,
        bizId: project.bizId,
        title: `${project.name}: ${ms.title}`,
        description: `Project milestone scheduled for ${ms.date}${ms.amount ? ` — budget ${formatZAR(ms.amount)}` : ''}`,
        category: 'Strategy',
        col: targetCol,
        assignee,
        assigneeName,
        priority: 'high',
        dueDate: ms.date,
        commentsCount: 0,
        attachmentsCount: 0,
        tags: ['Project', 'Milestone'],
        linkedProjectId: project.id,
        linkedProjectName: project.name,
        linkedMilestoneId: ms.id,
        estimatedHours: ms.amount ? Math.max(4, Math.round(ms.amount / 1000)) : 8,
        loggedHours: 0,
        createdAt: new Date().toISOString().split('T')[0]
      });
      changed = true;
    }
  });

  if (changed) {
    saveTasks(tasks);
    addLog(`Kanban sync: ${project.milestones.length} milestones mirrored to board for project "${project.name}"`, 'biz', actorName, project.bizId);
  }
}

// --- RESOURCE REPOSITORY ---
export function getResources(): import('../types').ResourceItem[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESOURCES) || '[]');
}

export function saveResources(list: import('../types').ResourceItem[]) {
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(list));
}

export function addResourceItem(item: import('../types').ResourceItem, actorName: string) {
  const list = getResources();
  list.unshift(item);
  saveResources(list);
  addLog(`Resource added: "${item.title}" (${item.type}) by ${actorName}`, 'biz', actorName, item.bizId);
}

export function deleteResourceItem(itemId: string, actorName: string, bizId: string) {
  const list = getResources();
  const filtered = list.filter(item => item.id !== itemId);
  saveResources(filtered);
  addLog(`Resource removed from repository by ${actorName}`, 'biz', actorName, bizId);
}

export function getResourcesForBiz(bizId: string): import('../types').ResourceItem[] {
  return getResources().filter(item => item.bizId === bizId);
}

// --- DAILY OUTREACH QUEUE ---
export function getOutreachContacts(): OutreachContact[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTREACH_CONTACTS) || '[]');
}

export function saveOutreachContacts(list: OutreachContact[]) {
  localStorage.setItem(STORAGE_KEYS.OUTREACH_CONTACTS, JSON.stringify(list));
}

export function getOutreachContactsForBiz(bizId: string): OutreachContact[] {
  return getOutreachContacts().filter(contact => contact.bizId === bizId);
}

export function importOutreachContacts(bizId: string, contacts: Omit<OutreachContact, 'id' | 'bizId' | 'createdAt' | 'history' | 'optedOut'>[], actorName: string) {
  const all = getOutreachContacts();
  contacts.forEach((contact, index) => all.unshift({
    ...contact,
    id: `contact_import_${Date.now()}_${index}`,
    bizId,
    optedOut: false,
    createdAt: new Date().toISOString(),
    history: []
  }));
  saveOutreachContacts(all);
  addLog(`Bulk import: ${contacts.length} outreach contacts imported and mapped by ${actorName}`, 'biz', actorName, bizId);
  addLog(`Make.com sync: imported contacts queued for nightly follow-up rule processing`, 'webhook', 'Make.com Bot', bizId);
  return contacts.length;
}

export function getDailyQueues(): DailyQueueItem[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_QUEUES) || '[]');
}

export function saveDailyQueues(list: DailyQueueItem[]) {
  localStorage.setItem(STORAGE_KEYS.DAILY_QUEUES, JSON.stringify(list));
}

export function generateDailyOutreachQueue(bizId: string, teamUsers: User[], force = false): DailyQueueItem[] {
  const today = new Date().toISOString().split('T')[0];
  const existing = getDailyQueues();
  if (!force && existing.some(item => item.bizId === bizId && item.scheduledDate === today)) {
    return existing.filter(item => item.bizId === bizId && item.scheduledDate === today);
  }

  const contacts = getOutreachContactsForBiz(bizId).filter(contact => {
    if (contact.optedOut || contact.pipelineStage === 'closed') return false;
    if (!contact.nextFollowUpAt) return contact.pipelineStage === 'new';
    return new Date(contact.nextFollowUpAt).getTime() <= Date.now() + 86400000;
  });

  const callableUsers = teamUsers.filter(user => ['admin', 'manager', 'member'].includes(user.role));
  const withoutToday = existing.filter(item => !(item.bizId === bizId && item.scheduledDate === today));
  const generated: DailyQueueItem[] = contacts.map((contact, index) => {
    const fallback = callableUsers[index % Math.max(callableUsers.length, 1)];
    const assigned = callableUsers.find(user => user.initials === contact.assignedTo) || fallback;
    const daysSince = contact.lastContactedAt ? (Date.now() - new Date(contact.lastContactedAt).getTime()) / 86400000 : 99;
    return {
      id: `queue_${today}_${contact.id}`,
      bizId,
      contactId: contact.id,
      assignedTo: assigned?.initials || 'AD',
      assignedName: assigned?.name || 'Institution Admin',
      reason: contact.reason,
      priority: daysSince > 21 || contact.pipelineStage === 'proposal' ? 'urgent' : daysSince > 7 ? 'high' : 'normal',
      generatedAt: new Date().toISOString(),
      scheduledDate: today,
      status: 'pending'
    };
  });

  saveDailyQueues([...generated, ...withoutToday]);
  addLog(`Daily queue generator: ${generated.length} contacts selected for ${today} using timestamps, pipeline stages and follow-up rules`, 'biz', 'Background Queue Engine', bizId);
  addLog(`Make.com sync: daily queue published and staff notifications dispatched`, 'webhook', 'Make.com Bot', bizId);
  return generated;
}

export function getTodayQueueForBiz(bizId: string): DailyQueueItem[] {
  const today = new Date().toISOString().split('T')[0];
  return getDailyQueues().filter(item => item.bizId === bizId && item.scheduledDate === today);
}

export function logCallOutcome(queueId: string, outcome: CallOutcome, note: string, staffName: string, staffInitials: string) {
  const queues = getDailyQueues();
  const queueItem = queues.find(item => item.id === queueId);
  if (!queueItem) return { success: false, message: 'Queue item not found' };
  const contacts = getOutreachContacts();
  const contact = contacts.find(item => item.id === queueItem.contactId);
  if (!contact) return { success: false, message: 'Contact profile not found' };

  const timestamp = new Date().toISOString();
  queueItem.status = 'completed';
  queueItem.outcome = outcome;
  contact.lastContactedAt = timestamp;
  contact.history.unshift({ id: `call_${Date.now()}`, outcome, note, staffName, staffInitials, timestamp });

  if (outcome === 'busy_no_answer') {
    contact.nextFollowUpAt = new Date(Date.now() + 86400000).toISOString();
    contact.reason = 'Retry after busy / no answer result';
  } else if (outcome === 'answered') {
    contact.nextFollowUpAt = new Date(Date.now() + 3 * 86400000).toISOString();
    contact.pipelineStage = contact.pipelineStage === 'new' ? 'follow_up' : contact.pipelineStage;
  } else {
    contact.optedOut = true;
    contact.nextFollowUpAt = undefined;
  }

  saveDailyQueues(queues);
  saveOutreachContacts(contacts);
  addLog(`Call logged: ${staffName} → ${contact.name} • ${outcome.replace(/_/g, ' ')}${note ? ` • ${note}` : ''}`, 'biz', staffName, contact.bizId);
  addLog(`Make.com sync: call outcome saved to contact history and ${outcome === 'busy_no_answer' ? 'tomorrow follow-up scheduled' : 'pipeline follow-up rules recalculated'}`, 'webhook', 'Make.com Bot', contact.bizId);
  return { success: true, message: `${contact.name}: ${outcome.replace(/_/g, ' ')} saved to contact history.` };
}

// --- INTEGRATIONS ---
export function getIntegrations(): Integration[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.INTEGRATIONS) || '[]');
}

export function saveIntegrations(list: Integration[]) {
  localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(list));
}

export function triggerWebhookSim(intId: string): Integration | null {
  const list = getIntegrations();
  const item = list.find(i => i.id === intId);
  if (item) {
    item.lastTriggered = "Just now";
    item.eventsCount = (item.eventsCount || 0) + 1;
    saveIntegrations(list);
    addLog(`Webhook Triggered: ${item.name} synced status payload, dispatched notifications, and checked board/review automations`, 'webhook', item.provider);
    return item;
  }
  return null;
}

// --- LOGS ---
export function getLogs(): LogItem[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
}

export function addLog(text: string, type: LogItem['type'] = 'sys', actor?: string, bizId?: string) {
  const list = getLogs();
  list.unshift({
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    bizId,
    text,
    time: 'Just now',
    type,
    actor
  });
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(list.slice(0, 50)));
}

// --- SESSION ---
export function getSession(): Session | null {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return null;
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// --- WALLETS & PAYMENTS ---
export function getWallets(): WalletBalance[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLETS) || '[]');
}

export function saveWallets(list: WalletBalance[]) {
  localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(list));
}

export function getWalletByBiz(bizId: string): WalletBalance {
  const wallets = getWallets();
  let found = wallets.find(w => w.bizId === bizId);
  if (!found) {
    found = {
      bizId,
      availableBalance: 5000.00,
      pendingEscrow: 2500.00,
      totalCollected: 5000.00,
      stripeAccountStatus: 'connected',
      cryptoAddress: '0x71C...B29a (Base / ETH)',
      bitcoinAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      bankAccountMask: 'Business Checking ****8821'
    };
    wallets.push(found);
    saveWallets(wallets);
  }
  return found;
}

export function updateWalletDestination(
  bizId: string,
  updates: Partial<WalletBalance>,
  actorName: string
): { success: boolean; message: string; wallet: WalletBalance } {
  const wallets = getWallets();
  let wallet = wallets.find(w => w.bizId === bizId);
  if (!wallet) {
    wallet = getWalletByBiz(bizId);
  }

  if (updates.bitcoinAddress !== undefined) wallet.bitcoinAddress = updates.bitcoinAddress;
  if (updates.cryptoAddress !== undefined) wallet.cryptoAddress = updates.cryptoAddress;
  if (updates.bankAccountMask !== undefined) wallet.bankAccountMask = updates.bankAccountMask;
  if (updates.stripeAccountStatus !== undefined) wallet.stripeAccountStatus = updates.stripeAccountStatus;

  saveWallets(wallets);

  const changes: string[] = [];
  if (updates.bitcoinAddress) changes.push(`Bitcoin BTC (${updates.bitcoinAddress.substring(0, 8)}...)`);
  if (updates.cryptoAddress) changes.push(`EVM/USDC (${updates.cryptoAddress.substring(0, 8)}...)`);
  if (updates.bankAccountMask) changes.push(`Bank (${updates.bankAccountMask})`);

  addLog(`Updated payout destinations (${changes.join(', ') || 'settings'}) by ${actorName}`, 'payment', actorName, bizId);
  return { success: true, message: `Payout destinations successfully updated!`, wallet };
}

export function getTransactions(): WalletTransaction[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
}

export function saveTransactions(list: WalletTransaction[]) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
}

export function getCheckoutLinks(): PaymentCheckoutLink[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKOUT_LINKS) || '[]');
}

export function saveCheckoutLinks(list: PaymentCheckoutLink[]) {
  localStorage.setItem(STORAGE_KEYS.CHECKOUT_LINKS, JSON.stringify(list));
}

export function addCheckoutLink(link: PaymentCheckoutLink) {
  const list = getCheckoutLinks();
  list.unshift(link);
  saveCheckoutLinks(list);
  addLog(`Created payment checkout link: "${link.title}" (${formatZAR(link.amount)}) for ${link.clientName}`, 'biz', 'Agency Admin', link.bizId);
}

export function processClientPayment(
  linkId: string,
  paymentMethod: WalletTransaction['paymentMethod'],
  actorName: string
): { success: boolean; message: string; transaction?: WalletTransaction } {
  const links = getCheckoutLinks();
  const link = links.find(l => l.id === linkId);
  if (!link) return { success: false, message: 'Checkout invoice link not found' };

  if (link.status === 'paid') {
    return { success: false, message: 'This invoice link has already been paid and settled.' };
  }

  // Calculate platform fee (2.9% + R0.30)
  const fee = Math.round((link.amount * 0.029 + 0.30) * 100) / 100;
  const netAmount = Math.round((link.amount - fee) * 100) / 100;

  // Update link status
  link.status = 'paid';
  saveCheckoutLinks(links);

  // Update project milestone if linked
  if (link.linkedProjectId && link.linkedMilestoneId) {
    const projects = getProjects();
    const prj = projects.find(p => p.id === link.linkedProjectId);
    if (prj) {
      const ms = prj.milestones.find(m => m.id === link.linkedMilestoneId);
      if (ms) {
        ms.status = 'completed';
        saveProjects(projects);
      }
    }
  }

  // Update wallet balance
  const wallets = getWallets();
  const wallet = wallets.find(w => w.bizId === link.bizId);
  if (wallet) {
    wallet.availableBalance = Math.round((wallet.availableBalance + netAmount) * 100) / 100;
    wallet.totalCollected = Math.round((wallet.totalCollected + link.amount) * 100) / 100;
    saveWallets(wallets);
  }

  // Record transaction
  const tx: WalletTransaction = {
    id: 'tx_' + Date.now(),
    bizId: link.bizId,
    type: 'client_payment',
    amount: link.amount,
    fee,
    netAmount,
    status: 'completed',
    clientName: link.clientName,
    projectOrMilestoneTitle: link.title,
    paymentMethod,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    receiptUrl: `https://pay.elitewayclub.com/receipts/rcpt_${Date.now()}`
  };

  const txs = getTransactions();
  txs.unshift(tx);
  saveTransactions(txs);

  addLog(`Client payment settled (${formatZAR(link.amount)}) via ${paymentMethod.toUpperCase()} — added +${formatZAR(netAmount)} to account`, 'payment', actorName, link.bizId);

  return { success: true, message: `Payment of ${formatZAR(link.amount)} processed! +${formatZAR(netAmount)} recorded for the institution.`, transaction: tx };
}

export function withdrawWalletBalance(
  bizId: string,
  amount: number,
  destination: string,
  actorName: string
): { success: boolean; message: string } {
  const wallets = getWallets();
  const wallet = wallets.find(w => w.bizId === bizId);
  if (!wallet) return { success: false, message: 'Wallet not found' };

  if (amount <= 0) {
    return { success: false, message: 'Please enter a valid amount greater than R0' };
  }

  // Allow withdrawing against available balance or test credit so checkout/payout is always available to run
  wallet.availableBalance = Math.max(0, Math.round((wallet.availableBalance - amount) * 100) / 100);
  saveWallets(wallets);

  const tx: WalletTransaction = {
    id: 'tx_wd_' + Date.now(),
    bizId,
    type: 'wallet_withdrawal',
    amount: -amount,
    fee: 0,
    netAmount: -amount,
    status: 'withdrawn',
    clientName: destination,
    projectOrMilestoneTitle: `Withdrawal Payout to ${destination}`,
    paymentMethod: 'ach_wire',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  const txs = getTransactions();
  txs.unshift(tx);
  saveTransactions(txs);

  addLog(`Withdrawal of $${amount.toLocaleString()} sent to ${destination} by ${actorName}`, 'payment', actorName, bizId);

  return { success: true, message: `${formatZAR(amount)} payout initiated successfully to ${destination}!` };
}

export function addTestFundsToWallet(bizId: string, amount: number, actorName: string): { success: boolean; message: string } {
  const wallets = getWallets();
  const wallet = wallets.find(w => w.bizId === bizId);
  if (!wallet) return { success: false, message: 'Wallet not found' };

  wallet.availableBalance = Math.round((wallet.availableBalance + amount) * 100) / 100;
  wallet.totalCollected = Math.round((wallet.totalCollected + amount) * 100) / 100;
  saveWallets(wallets);

  const tx: WalletTransaction = {
    id: 'tx_topup_' + Date.now(),
    bizId,
    type: 'client_payment',
    amount,
    fee: 0,
    netAmount: amount,
    status: 'completed',
    clientName: 'Sandbox Test Deposit',
    projectOrMilestoneTitle: 'Instant Sandbox Escrow Top-Up',
    paymentMethod: 'stripe_card',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    receiptUrl: `https://pay.elitewayclub.com/receipts/rcpt_${Date.now()}`
  };

  const txs = getTransactions();
  txs.unshift(tx);
  saveTransactions(txs);

  addLog(`Sandbox top-up of +${formatZAR(amount)} added by ${actorName}`, 'payment', actorName, bizId);
  return { success: true, message: `+${formatZAR(amount)} test funds added to your institution account!` };
}

// ============================================================
// EVENT SUBACCOUNTS & EVENTS PLANNER (ZAR)
// ============================================================

export function getEventSubaccounts(): EventSubaccount[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENT_SUBACCOUNTS) || '[]');
}

export function saveEventSubaccounts(list: EventSubaccount[]) {
  localStorage.setItem(STORAGE_KEYS.EVENT_SUBACCOUNTS, JSON.stringify(list));
}

export function getEventSubaccountForBiz(bizId: string): EventSubaccount | null {
  const all = getEventSubaccounts();
  return all.find(s => s.bizId === bizId && s.status === 'active') || null;
}

export function createEventSubaccount(
  bizId: string,
  tier: EventPlanTier,
  activatedBy: string
): { success: boolean; message: string; subaccount?: EventSubaccount } {
  const all = getEventSubaccounts();
  const existing = all.find(s => s.bizId === bizId && s.status === 'active');
  if (existing) {
    return { success: false, message: 'This workspace already has an active Events subaccount. Upgrade or downgrade instead.' };
  }

  const bizList = getBusinesses();
  const biz = bizList.find(b => b.id === bizId);
  if (!biz) return { success: false, message: 'Workspace not found' };

  const feeMap = { basic: 499, pro: 1499, elite: 3999 };
  const monthlyFeeZAR = feeMap[tier];

  const now = new Date();
  const activeUntil = new Date(now.getFullYear(), now.getMonth() + 12, now.getDate());

  const sub: EventSubaccount = {
    id: 'evsub_' + Date.now(),
    bizId,
    tier,
    monthlyFeeZAR,
    activatedAt: now.toISOString().split('T')[0],
    activeUntil: activeUntil.toISOString().split('T')[0],
    status: 'active',
    eventsCreated: 0,
    totalRevenueZAR: 0,
    activatedBy
  };

  all.unshift(sub);
  saveEventSubaccounts(all);

  addLog(`Events Subaccount activated for ${biz.name} — ${tier.toUpperCase()} tier at R${monthlyFeeZAR}/mo (Setup by ${activatedBy})`, 'event', activatedBy, bizId);

  return {
    success: true,
    message: `${biz.name} now has an ACTIVE Events subaccount at R${monthlyFeeZAR.toLocaleString('en-ZA')}/mo (${tier.toUpperCase()} tier).`,
    subaccount: sub
  };
}

export function toggleEventSubaccountStatus(subId: string, actorName: string): EventSubaccount | null {
  const all = getEventSubaccounts();
  const sub = all.find(s => s.id === subId);
  if (!sub) return null;
  sub.status = sub.status === 'active' ? 'suspended' : 'active';
  saveEventSubaccounts(all);
  addLog(`Events Subaccount ${sub.id} ${sub.status === 'active' ? 'reactivated' : 'suspended'} by ${actorName}`, 'event', actorName, sub.bizId);
  return sub;
}

// EVENT PLANS CRUD
export function getEvents(): EventPlan[] {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENT_PLANS) || '[]');
}

export function saveEvents(list: EventPlan[]) {
  localStorage.setItem(STORAGE_KEYS.EVENT_PLANS, JSON.stringify(list));
}

export function getEventsForBiz(bizId: string): EventPlan[] {
  return getEvents().filter(e => e.bizId === bizId);
}

export function createEvent(event: EventPlan, actorName: string): { success: boolean; message: string; event?: EventPlan } {
  const sub = getEventSubaccountForBiz(event.bizId);
  if (!sub) {
    return { success: false, message: 'This workspace does not have an active Events subaccount. Contact Ultra Admin to activate.' };
  }

  const all = getEvents();
  all.unshift(event);
  saveEvents(all);

  // Increment subaccount counter
  const subs = getEventSubaccounts();
  const s = subs.find(x => x.id === sub.id);
  if (s) {
    s.eventsCreated += 1;
    saveEventSubaccounts(subs);
  }

  // Mirror all planning tasks onto the Kanban board (uses internal tasks store)
  event.planningTasks.forEach(pt => syncEventTaskToKanban(event, pt, actorName));

  addLog(`New event "${event.name}" created for ${event.eventDate} at ${event.venue}`, 'event', actorName, event.bizId);
  return { success: true, message: `Event "${event.name}" launched — planning tasks synced to Kanban board!`, event };
}

// Mirror an event planning task onto the Kanban board (dedupe-safe)
export function syncEventTaskToKanban(event: EventPlan, planningTask: EventPlanTask, _actorName: string) {
  const tasks = getTasks();
  const taskId = `tsk_evt_${event.id}_${planningTask.id}`;
  const existing = tasks.find(t => t.id === taskId);
  const targetCol: TaskColumn = planningTask.status === 'done' ? 'done' : planningTask.status === 'in_progress' ? 'inprogress' : 'backlog';

  if (existing) {
    existing.col = targetCol;
    existing.dueDate = planningTask.dueDate;
    existing.assignee = planningTask.assigneeInitials;
    existing.assigneeName = planningTask.assigneeName;
  } else {
    tasks.unshift({
      id: taskId,
      bizId: event.bizId,
      title: `${event.name}: ${planningTask.title}`,
      description: `Event planning item (${planningTask.category}) for ${event.eventDate} at ${event.venue}${planningTask.budgetZAR ? ` — budget ${formatZAR(planningTask.budgetZAR)}` : ''}`,
      category: 'Operations',
      col: targetCol,
      assignee: planningTask.assigneeInitials,
      assigneeName: planningTask.assigneeName,
      priority: new Date(planningTask.dueDate).getTime() < Date.now() + 7 * 86400000 ? 'urgent' : 'high',
      dueDate: planningTask.dueDate,
      commentsCount: 0,
      attachmentsCount: 0,
      tags: ['Event', planningTask.category],
      linkedEventId: event.id,
      linkedEventTaskId: planningTask.id,
      linkedEventName: event.name,
      estimatedHours: 6,
      loggedHours: 0,
      createdAt: new Date().toISOString().split('T')[0]
    });
  }
  saveTasks(tasks);
}

export function updateEvent(event: EventPlan): void {
  const all = getEvents();
  const idx = all.findIndex(e => e.id === event.id);
  if (idx !== -1) {
    all[idx] = event;
    saveEvents(all);
  }
}

export function addEventPlanTask(eventId: string, task: EventPlanTask, actorName: string): EventPlan | null {
  const all = getEvents();
  const evt = all.find(e => e.id === eventId);
  if (!evt) return null;
  evt.planningTasks.unshift(task);
  saveEvents(all);
  // Mirror to Kanban board
  syncEventTaskToKanban(evt, task, actorName);
  addLog(`New planning task "${task.title}" added to event "${evt.name}"`, 'event', actorName, evt.bizId);
  return evt;
}

export function updateEventPlanTaskStatus(eventId: string, taskId: string, status: EventPlanTask['status'], actorName: string): EventPlan | null {
  const all = getEvents();
  const evt = all.find(e => e.id === eventId);
  if (!evt) return null;
  const task = evt.planningTasks.find(t => t.id === taskId);
  if (!task) return null;
  task.status = status;
  saveEvents(all);
  // Mirror column change back into kanban
  syncEventTaskToKanban(evt, task, actorName);
  addLog(`Task "${task.title}" for event "${evt.name}" marked as ${status.replace('_', ' ').toUpperCase()} (Kanban synced)`, 'event', actorName, evt.bizId);
  return evt;
}

export function addEventProgressUpdate(eventId: string, update: EventProgressUpdate, actorName: string): EventPlan | null {
  const all = getEvents();
  const evt = all.find(e => e.id === eventId);
  if (!evt) return null;
  evt.progressUpdates.unshift(update);
  saveEvents(all);
  addLog(`${update.authorName} posted progress update on "${evt.name}" (${update.progressPercent}%)`, 'event', actorName, evt.bizId);
  return evt;
}

export function addEventFollowUp(eventId: string, followUp: EventFollowUp, actorName: string): EventPlan | null {
  const all = getEvents();
  const evt = all.find(e => e.id === eventId);
  if (!evt) return null;
  evt.followUps.unshift(followUp);
  saveEvents(all);
  addLog(`${followUp.fromName} sent follow-up to ${followUp.toName} on event "${evt.name}"`, 'event', actorName, evt.bizId);
  return evt;
}

export function respondToEventFollowUp(eventId: string, followUpId: string, reply: string, actorName: string): EventPlan | null {
  const all = getEvents();
  const evt = all.find(e => e.id === eventId);
  if (!evt) return null;
  const fu = evt.followUps.find(f => f.id === followUpId);
  if (!fu) return null;
  fu.reply = reply;
  fu.status = 'responded';
  fu.respondedAt = new Date().toISOString();
  saveEvents(all);
  addLog(`${actorName} replied to follow-up on event "${evt.name}"`, 'event', actorName, evt.bizId);
  return evt;
}

export function executeEvent(eventId: string, notes: string, actualAttendees: number, actorName: string): { success: boolean; message: string; event?: EventPlan } {
  const all = getEvents();
  const evt = all.find(e => e.id === eventId);
  if (!evt) return { success: false, message: 'Event not found' };

  evt.status = 'completed';
  evt.executedAt = new Date().toISOString();
  evt.executionNotes = notes;
  evt.actualAttendees = actualAttendees;
  saveEvents(all);

  // Update subaccount revenue counter
  const subs = getEventSubaccounts();
  const s = subs.find(x => x.id === evt.subaccountId);
  if (s) {
    s.totalRevenueZAR += evt.ticketsSold * evt.ticketPriceZAR;
    saveEventSubaccounts(subs);
  }

  addLog(`🎉 Event "${evt.name}" EXECUTED successfully! ${actualAttendees} attendees, ${evt.ticketsSold} tickets sold (R${(evt.ticketsSold * evt.ticketPriceZAR).toLocaleString('en-ZA')} revenue)`, 'event', actorName, evt.bizId);

  return { success: true, message: `🎉 Event "${evt.name}" marked as EXECUTED with ${actualAttendees} attendees!`, event: evt };
}

export function goLiveEvent(eventId: string, actorName: string): EventPlan | null {
  const all = getEvents();
  const evt = all.find(e => e.id === eventId);
  if (!evt) return null;
  evt.status = 'live';
  saveEvents(all);
  addLog(`🔴 Event "${evt.name}" is NOW LIVE at ${evt.venue}!`, 'event', actorName, evt.bizId);
  return evt;
}

export function computeEventProgress(event: EventPlan): number {
  if (event.planningTasks.length === 0) return 0;
  const done = event.planningTasks.filter(t => t.status === 'done').length;
  return Math.round((done / event.planningTasks.length) * 100);
}

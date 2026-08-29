export type PlanTier = 'starter' | 'pro' | 'enterprise' | 'god_tier';
export type WorkspaceStatus = 'active' | 'suspended' | 'trial';
export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'client';
export type BusinessFeature = 'kanban' | 'projects' | 'submissions' | 'team' | 'integrations' | 'events' | 'notifications' | 'resources' | 'outreach';
export type InstitutionType = 'business' | 'ngo' | 'school' | 'university' | 'church' | 'government' | 'agency' | 'healthcare' | 'other';
export type TaskColumn = 'backlog' | 'todo' | 'inprogress' | 'inreview' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SubmissionStatus = 'pending' | 'approved' | 'revision' | 'rejected';
export type ProjectStatus = 'Active' | 'In Review' | 'Planning' | 'Completed' | 'On Hold';
export type LogType = 'ultra' | 'biz' | 'sys' | 'alert' | 'webhook' | 'submission' | 'payment' | 'event';
export type EventPlanTier = 'basic' | 'pro' | 'elite';
export type EventStatus = 'planning' | 'confirmed' | 'live' | 'completed' | 'cancelled';
export type EventTaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done';

export interface EventSubaccount {
  id: string;
  bizId: string;
  tier: EventPlanTier;
  monthlyFeeZAR: number; // e.g. R499, R1499, R3999
  activatedAt: string;
  activeUntil: string;
  status: 'active' | 'suspended' | 'cancelled';
  eventsCreated: number;
  totalRevenueZAR: number;
  activatedBy: string;
}

export interface EventPlanTask {
  id: string;
  title: string;
  description?: string;
  assigneeName: string;
  assigneeInitials: string;
  dueDate: string;
  status: EventTaskStatus;
  category: 'Venue' | 'Catering' | 'Marketing' | 'Logistics' | 'Talent' | 'Ticketing' | 'Legal' | 'Setup';
  budgetZAR?: number;
  createdAt: string;
}

export interface EventProgressUpdate {
  id: string;
  authorName: string;
  authorInitials: string;
  message: string;
  attachmentUrl?: string;
  progressPercent: number;
  timestamp: string;
  isMilestone?: boolean;
}

export interface EventFollowUp {
  id: string;
  fromName: string;
  toName: string;
  toInitials: string;
  message: string;
  status: 'pending' | 'acknowledged' | 'responded';
  reply?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface EventPlan {
  id: string;
  bizId: string;
  subaccountId: string;
  name: string;
  description: string;
  eventDate: string;
  venue: string;
  city: string;
  expectedAttendees: number;
  actualAttendees?: number;
  budgetZAR: number;
  spentZAR: number;
  ticketPriceZAR: number;
  ticketsSold: number;
  status: EventStatus;
  category: 'Conference' | 'Workshop' | 'Wedding' | 'Corporate' | 'Concert' | 'Launch' | 'Gala' | 'Community';
  coverImage?: string;
  teamMembers: string[]; // initials
  planningTasks: EventPlanTask[];
  progressUpdates: EventProgressUpdate[];
  followUps: EventFollowUp[];
  createdAt: string;
  executedAt?: string;
  executionNotes?: string;
}

export interface WalletBalance {
  bizId: string;
  availableBalance: number; // USD ready to withdraw
  pendingEscrow: number; // USD processing from client checkout
  totalCollected: number; // All-time USD volume
  stripeAccountStatus: 'connected' | 'pending' | 'unlinked';
  cryptoAddress?: string;
  bitcoinAddress?: string; // Bitcoin BTC address for payouts
  bankAccountMask?: string;
}

export interface WalletTransaction {
  id: string;
  bizId: string;
  type: 'client_payment' | 'milestone_payout' | 'saas_subscription' | 'wallet_withdrawal' | 'escrow_deposit';
  amount: number;
  fee: number; // Platform fee
  netAmount: number; // Added to agency wallet
  status: 'completed' | 'pending' | 'processing' | 'withdrawn';
  clientName: string;
  projectOrMilestoneTitle: string;
  paymentMethod: 'stripe_card' | 'apple_pay' | 'google_pay' | 'usdc_crypto' | 'bitcoin_crypto' | 'ach_wire';
  timestamp: string;
  receiptUrl?: string;
}

export interface PaymentCheckoutLink {
  id: string;
  bizId: string;
  title: string;
  description: string;
  amount: number;
  clientEmail: string;
  clientName: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'draft';
  dueDate: string;
  checkoutUrl: string;
  linkedProjectId?: string;
  linkedMilestoneId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  initials: string;
  avatarUrl?: string;
  department?: string;
  joinedAt?: string;
}

export interface BusinessStats {
  projects: number;
  tasks: number;
  members: number;
  completed: number;
  mrr: number;
}

export interface Business {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  plan: PlanTier;
  status: WorkspaceStatus;
  institutionType?: InstitutionType;
  customDomain?: string;
  logoUrl?: string;
  whiteLabelName?: string;
  whiteLabelEnabled?: boolean;
  customFeatureAddOns?: BusinessFeature[];
  callAgreementRef?: string;
  createdAt: string;
  users: User[];
  stats: BusinessStats;
  monthlyBudgetZAR?: number;
  enabledFeatures?: BusinessFeature[];
  settings?: {
    enableClientPortal: boolean;
    autoWebhookSync: boolean;
    requireReviewForDone: boolean;
    slackChannel?: string;
  };
}

export interface ResourceItem {
  id: string;
  bizId: string;
  title: string;
  description?: string;
  type: 'document' | 'policy' | 'template' | 'link' | 'media' | 'brand' | 'archive';
  url: string;
  ownerName: string;
  category: 'Operations' | 'Projects' | 'Events' | 'HR' | 'Finance' | 'Institutional' | 'Make.com';
  uploadedAt: string;
  tags: string[];
  visibility: 'admin_manager' | 'team' | 'client';
}

export type CallOutcome = 'answered' | 'busy_no_answer' | 'opt_out' | 'not_interested';

export interface ContactActivity {
  id: string;
  outcome: CallOutcome;
  note: string;
  staffName: string;
  staffInitials: string;
  timestamp: string;
}

export interface OutreachContact {
  id: string;
  bizId: string;
  name: string;
  organisation?: string;
  phone: string;
  email?: string;
  pipelineStage: 'new' | 'follow_up' | 'proposal' | 'partner' | 'dormant' | 'closed';
  reason: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  assignedTo?: string;
  assignedName?: string;
  optedOut: boolean;
  createdAt: string;
  history: ContactActivity[];
}

export interface DailyQueueItem {
  id: string;
  bizId: string;
  contactId: string;
  assignedTo: string;
  assignedName: string;
  reason: string;
  priority: 'normal' | 'high' | 'urgent';
  generatedAt: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'skipped';
  outcome?: CallOutcome;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskWorkSubmission {
  id: string;
  submitterName: string;
  submitterInitials: string;
  notes: string;
  attachments: TaskAttachment[];
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'needs_revision';
}

export interface TaskAttachment {
  id: string;
  type: 'link' | 'document' | 'image' | 'video' | 'figma' | 'github';
  name: string;
  url: string;
  size?: string;
}

export interface TaskFeedbackReport {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: 1 | 2 | 3 | 4 | 5;
  qualityScore: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  decision: 'approve' | 'request_revision' | 'reject';
  reviewedAt: string;
}

export interface TaskProgressLog {
  id: string;
  percentComplete: number;
  actor: string;
  note?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  bizId: string;
  title: string;
  description?: string;
  category: 'Design' | 'Dev' | 'Marketing' | 'Strategy' | 'Operations' | 'AI Workflow';
  col: TaskColumn;
  assignee: string; // initials
  assigneeName?: string;
  priority: TaskPriority;
  dueDate?: string;
  gracePeriodDays?: number; // Extra days after due date before task is critically overdue
  startedAt?: string; // When work moved into inprogress
  commentsCount: number;
  attachmentsCount: number;
  tags: string[];
  checklist?: TaskChecklistItem[];
  estimatedHours?: number;
  loggedHours?: number;
  progressPercent?: number; // 0-100 current progress
  progressLog?: TaskProgressLog[];
  workSubmissions?: TaskWorkSubmission[]; // Members' submitted work
  feedbackReports?: TaskFeedbackReport[]; // Manager review reports
  // Linked sources (synced with Projects & Events Planner)
  linkedProjectId?: string;
  linkedProjectName?: string;
  linkedMilestoneId?: string;
  linkedEventId?: string;
  linkedEventTaskId?: string;
  linkedEventName?: string;
  createdAt: string;
}

export interface SubmissionFeedback {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
}

export interface Submission {
  id: string;
  bizId: string;
  title: string;
  description?: string;
  submitter: string;
  submitterRole?: string;
  time: string;
  status: SubmissionStatus;
  fileUrl: string;
  fileType: 'figma' | 'zip' | 'video' | 'make_blueprint' | 'pdf' | 'github';
  version: string;
  feedback: SubmissionFeedback[];
  linkedTaskId?: string;
  clientVisible?: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
  amount?: number;
}

export interface Project {
  id: string;
  bizId: string;
  name: string;
  clientName?: string;
  status: ProjectStatus;
  budget: number;
  spent: number;
  progress: number;
  deadline: string;
  description?: string;
  milestones: ProjectMilestone[];
  teamInitials: string[];
}

export interface Integration {
  id: string;
  bizId: string;
  provider: 'Make.com' | 'Stripe' | 'Slack' | 'Figma' | 'Google Drive' | 'GitHub' | 'Open AI / Claude';
  name: string;
  description: string;
  connected: boolean;
  webhookUrl?: string;
  lastTriggered?: string;
  eventsCount?: number;
  autoSync: boolean;
}

export interface LogItem {
  id: string;
  bizId?: string;
  text: string;
  time: string;
  type: LogType;
  actor?: string;
}

export interface Session {
  type: 'ultra' | 'business';
  userId: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  bizId?: string | null;
  bizName?: string;
  ultraOverride?: boolean;
}

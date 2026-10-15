export type UserRole = 'owner' | 'team_leader' | 'junior_team_leader' | 'agent' | 'dialog_officer';

export type EmploymentStatus = 'ACTIVE' | 'TEMPORARY_SUSPENDED' | 'RESIGNED' | 'TERMINATED' | 'PROBATION' | 'BLOCKED' | 'SUSPENDED' | 'EXITED';

export type EmployeeIdApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AppTarget = 'agent' | 'management' | 'audit';

export type ManagementRoute = 
  | 'dashboard'
  | 'mobile-app'
  | 'performance'
  | 'daily-summary'
  | 'targets'
  | 'attendance'
  | 'sales'
  | 'activations'
  | 'teams'
  | 'reports'
  | 'employees'
  | 'devices'
  | 'messages'
  | 'presentation'
  | 'payments'
  | 'audit-trail'
  | 'history'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  agentCode?: string;
  nic?: string;
  phone?: string;
  mobile?: string;
  teamId?: string;
  teamName?: string;
  teamLeaderId?: string;
  teamLeaderName?: string;
  avatar?: string;
  employmentStatus?: EmploymentStatus;
  joinedDate?: string;
  createdAt?: string;
  designation?: string;
  workLocation?: string;
  district?: string;
  address?: string;
  isAppDownloaded?: boolean;
  isLoggedIn?: boolean;
  lastLoginAt?: string;
  appVersion?: string;
  jobPosition?: string;
  idApprovalStatus?: EmployeeIdApprovalStatus;
  idApprovedAt?: string;
  idApprovedBy?: string;
  ownerSignatureUrl?: string;
  idRejectedReason?: string;
  approvedByOwner?: boolean;
  password?: string;
  pinCode?: string;
  tempPassword?: string;
  status?: string;
  employeeId?: string;
  kycDocuments?: {
    gnCertificate?: string;
    policeReport?: string;
    nicFront?: string;
    nicBack?: string;
  };
  gramaNiladhariReportUrl?: string;
  policeReportUrl?: string;
  gramaReportName?: string;
  policeReportName?: string;
  gramaReportUploadedAt?: string;
  policeReportUploadedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  description?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  userId?: string;
  agentId?: string;
  agentCode?: string;
  agentName?: string;
  userName?: string;
  userRole?: UserRole;
  role?: string;
  teamId?: string;
  teamName?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'present' | 'absent' | 'half_day' | 'on_leave' | 'completed';
  checkInTime?: string;
  checkOutTime?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  notes?: string;
}

export interface ProductSale {
  id: string;
  agentId: string;
  agentCode: string;
  agentName: string;
  teamId?: string;
  productType: 'govimithuru' | 'sayuru' | string;
  productName?: string;
  channel?: string;
  quantity?: number;
  msisdn?: string;
  customerName?: string;
  customerMobile?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  saleDate?: string;
  date?: string;
  time?: string;
  status?: 'COMPLETED' | 'PENDING' | 'CANCELLED' | string;
  amount?: number;
  notes?: string;
  activationMethod?: 'KEYPAD_DIAL' | 'APP_LINK_SHARE' | 'MANUAL';
  dialCode?: string;
  appShareChannel?: 'WHATSAPP' | 'SMS' | 'QR' | 'DIRECT';
}

export interface IvrEntry {
  id: string;
  agentId: string;
  agentCode: string;
  agentName?: string;
  teamId?: string;
  ivrCampaign?: string;
  callDurationSeconds?: number;
  durationSeconds?: number;
  callerNumber?: string;
  customerPhone?: string;
  timestamp?: string;
  date?: string;
  callStatus?: string;
  status?: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | string;
  notes?: string;
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  userId?: string;
  agentId?: string;
  agentCode?: string;
  agentName?: string;
  userName?: string;
  userRole?: UserRole;
  teamId?: string;
  teamLeaderId?: string;
  startDate: string;
  endDate: string;
  daysCount?: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'pending' | 'approved' | 'rejected';
  appliedAt?: string;
  submittedAt?: string;
  reviewedBy?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: UserRole;
  receiverId?: string;
  receiverName?: string;
  receiverRole?: UserRole;
  teamId?: string;
  message?: string;
  content?: string;
  timestamp: string;
  read?: boolean;
  fileUrl?: string;
}

export interface MeetingFile {
  id: string;
  name: string;
  url: string;
  size?: number;
}

export interface Meeting {
  id: string;
  code?: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  scheduledTime?: string;
  date?: string;
  time?: string;
  createdBy?: string;
  creatorName?: string;
  hostId?: string;
  hostName?: string;
  hostRole?: string;
  teamId?: string;
  targetAudience?: string;
  targetTeamName?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'active' | 'scheduled';
  meetingUrl?: string;
  meetingLink?: string;
  files?: MeetingFile[];
  attachedFiles?: any[];
}

export interface SecurityAlert {
  id: string;
  type: 'FAKE_GPS_DETECTED' | 'UNAUTHORIZED_ACCESS' | 'MOCK_LOCATION_BLOCKED';
  userId: string;
  userName: string;
  agentCode: string;
  role: string;
  details: string;
  coordinates?: { latitude: number; longitude: number };
  timestamp: string;
  resolved?: boolean;
}

export interface ColdStorageArchive {
  id: string;
  fiscalMonth: string;
  archivedAt: string;
  archivedBy: string;
  totalSalesRecords: number;
  totalAttendanceRecords: number;
  totalLocationRecords: number;
  dataSnapshot?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  productCode?: string;
  shortDescription?: string;
  fullContent?: string;
  keyBenefits?: string[];
  pricing?: string;
  activationCode?: string;
  salesGuidance?: string | string[];
  faqs?: Array<{ question: string; answer: string }> | any;
  content?: string;
  updatedAt?: string;
  author?: string;
}

export interface EmployeeVerification {
  id: string;
  userId: string;
  agentCode?: string;
  idNumber?: string;
  userRole?: UserRole;
  userName: string;
  nic?: string;
  address?: string;
  contactNumber?: string;
  nicFrontUrl?: string;
  nicBackUrl?: string;
  idPhotoUrl?: string;
  gramaNiladhariReportUrl?: string;
  policeReportUrl?: string;
  gramaReportName?: string;
  policeReportName?: string;
  approvedBy?: string;
  selfieUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'verified' | 'pending';
  submittedAt: string;
  verifiedAt?: string;
}

export interface MonthlyProductTargets {
  id?: string;
  month?: string;
  totalGovimithuruTarget?: number;
  totalSayuruTarget?: number;
  govimithuruIvr?: number;
  govimithuruApp?: number;
  sayuruIvr?: number;
  sayuruApp?: number;
}

export interface TeamProductTargets {
  id?: string;
  teamId: string;
  teamName?: string;
  month?: string;
  govimithuruTarget?: number;
  sayuruTarget?: number;
  govimithuruIvr?: number;
  govimithuruApp?: number;
  sayuruIvr?: number;
  sayuruApp?: number;
}

export interface AgentProductTarget {
  id?: string;
  agentId: string;
  agentCode?: string;
  agentName?: string;
  month?: string;
  govimithuruTarget?: number;
  sayuruTarget?: number;
  govimithuruIvr?: number;
  govimithuruApp?: number;
  sayuruIvr?: number;
  sayuruApp?: number;
}

export interface CompanyWeeklyReport {
  id: string;
  title?: string;
  reportType?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  totalSales?: number;
  summary?: string;
  createdById?: string;
  attachedAt?: string;
  entries?: any[];
}

export interface VaultFile {
  id: string;
  name?: string;
  fileName?: string;
  title?: string;
  fileSizeMB?: number;
  notes?: string;
  category: string;
  url?: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  size?: number;
}

export interface MarketingPost {
  id: string;
  title: string;
  content?: string;
  description?: string;
  mediaUrl?: string;
  platform?: string;
  contentType?: string;
  scheduledTime?: string;
  publishedAt?: string;
  views?: number;
  likes?: number;
  targetAudience?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'published' | 'draft' | 'scheduled';
  createdAt?: string;
}

export interface WebAiChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'owner' | string;
  senderName?: string;
  message?: string;
  text?: string;
  timestamp: string;
}

export interface SystemDoctorLog {
  id: string;
  timestamp: string;
  level?: 'INFO' | 'WARNING' | 'ERROR';
  module?: string;
  issueType?: string;
  status?: string;
  message: string;
}

export interface DailyJobRoleReport {
  id: string;
  date: string;
  agentId: string;
  reportText: string;
  attendanceStatus?: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerRole: UserRole;
  receiverId: string;
  receiverName: string;
  receiverRole?: string;
  type: 'audio' | 'video' | 'voice' | string;
  status: 'ringing' | 'connected' | 'ended' | 'rejected';
  startTime: string;
  endTime?: string;
}

export interface SmsLogRecord {
  id: string;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  recipient?: string;
  recipientName?: string;
  recipientMobile?: string;
  message: string;
  type?: string;
  status: 'SENT' | 'FAILED' | 'PENDING' | 'delivered' | string;
  timestamp?: string;
  sentAt?: string;
  cost?: number;
}

export interface LocationRecord {
  id: string;
  employee_id: string;
  agent_code: string;
  employee_name: string;
  team_id?: string;
  team_name?: string;
  role: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  batteryLevel?: number;
  timestamp: string;
  time_display?: string;
  date?: string;
  hour?: number;
  status?: string;
  detected_village?: string;
  district_si?: string;
  created_at?: string;
  source?: string;
  sessionId?: string;
  deviceId?: string;
  gpsPermissionStatus?: string;
  gpsState?: string;
  appState?: string;
  networkState?: string;
}

export interface LocationTrackingConfig {
  intervalMinutes?: number;
  highAccuracy?: boolean;
  trackingEnabled?: boolean;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  startHour?: number | string;
  endHour?: number | string;
  liveThresholdMinutes?: number;
  recentThresholdMinutes?: number;
  staleThresholdMinutes?: number;
  updateIntervalSeconds?: number;
  stationaryRadiusMeters?: number;
  stationaryDurationMinutes?: number;
  enableOutsideWorkingHours?: boolean;
}

export interface MotivationBannerMessage {
  id: string;
  text: string;
  category: string;
  isActive: boolean;
  createdBy: string;
}

export interface CompanyMessage {
  id: string;
  title: string;
  content: string;
  category: string;
  mediaType: string;
  targetAudience: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  status: string;
  readBy: string[];
}

export interface DialogPerformanceRecord {
  id: string;
  agentId: string;
  agentCode: string;
  agentName: string;
  teamId?: string;
  reportDate: string;
  productCode: string;
  dialogSales: number;
  customerUsage: string;
  qualityResult: string;
  revenueLkr: number;
  pointsScore: number;
  updatedAt: string;
}

export interface TrainingProgressRecord {
  id: string;
  agentId: string;
  moduleName: string;
  progressPercent: number;
  completed: boolean;
}

export interface QuizResultRecord {
  id: string;
  agentId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  takenAt: string;
  completedAt?: string;
}

export interface WorkAreaRecord {
  id: string;
  agentId: string;
  agentName: string;
  district: string;
  areaName: string;
  assignedDate: string;
  timestamp?: string;
}

export interface EmployeeIdAuditLog {
  id: string;
  userId?: string;
  employeeId?: string;
  agentCode?: string;
  employeeName?: string;
  action: string;
  performedBy?: string;
  timestamp: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export type ActivationStatus = 'Pending_Verification' | 'Successful' | 'Failed';

export interface AppActivationRecord {
  id: string;
  activationReference: string;
  agentId: string;
  agentCode: string;
  agentName: string;
  teamId?: string;
  teamName?: string;
  customerMobile: string;
  customerName?: string;
  servicePack: 'Sayuru_828' | 'Govimithuru_616' | 'Sayuru_App' | 'Govimithuru_App' | string;
  servicePackName: string;
  ussdString: string;
  channel: 'USSD_DIALER' | 'APP_LINK';
  status: ActivationStatus;
  dialedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  confirmationToken?: string;
  failureReason?: string;
  location?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  dialogMatched?: boolean;
  notes?: string;
}

export interface UssdServiceConfig {
  id: string;
  servicePack: string;
  displayName: string;
  baseUssdCode: string;
  targetedUssdTemplate: string;
  productCode: string;
  dailyRateLkr: number;
  monthlyCommissionLkr: number;
  isActive: boolean;
  notes?: string;
}

export interface DialogReportImportRow {
  id: string;
  transactionRef: string;
  msisdn: string;
  serviceCode: string;
  productName: string;
  carrierTimestamp: string;
  matchedActivationRef?: string;
  matchedAgentCode?: string;
  matchedAgentName?: string;
  matchStatus: 'MATCHED' | 'UNMATCHED' | 'FLAGGED';
  revenueLkr: number;
  verifiedAt?: string;
  auditorNotes?: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'ID_APPROVED'
    | 'ID_REJECTED'
    | 'USSD_DIAL'
    | 'ACTIVATION_PENDING'
    | 'ACTIVATION_SUCCESS'
    | 'ACTIVATION_FAILED'
    | 'SALES_VERIFIED'
    | 'ATTENDANCE_CHECKIN'
    | 'TARGET_UPDATE'
    | 'SUPERVISOR_NOTE'
    | 'SYSTEM_CONFIG'
    | string;
  category: 'SECURITY' | 'VERIFICATION' | 'USSD_OPERATION' | 'ATTENDANCE' | 'SALES' | 'MANAGEMENT';
  actorId: string;
  actorName: string;
  actorRole: UserRole | string;
  targetUserId?: string;
  targetUserName?: string;
  targetAgentCode?: string;
  referenceId?: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'INFO';
  metadata?: Record<string, any>;
}


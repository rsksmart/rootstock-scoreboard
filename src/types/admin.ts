/**
 * Admin Role Types and Interfaces
 * Defines the role-based access control system for the voting platform
 */

export enum AdminRole {
  NONE = 0,           // Regular user with no admin privileges
  TEAM_MANAGER = 1,   // Can add/remove teams
  VOTE_ADMIN = 2,     // Can manage voting periods and configuration
  RECOVERY_ADMIN = 3, // Can trigger emergency mode and recovery actions
  SUPER_ADMIN = 4     // Full system control and admin management
}

export interface AdminInfo {
  role: AdminRole;
  joinTimestamp: number;
  isActive: boolean;
}

export interface VotingStatus {
  isActive: boolean;
  startTime: number;
  endTime: number;
  totalVotes: number;
  votingToken: string;
}

export interface AdvancedAdminInfo extends AdminInfo {
  stakedAmount: bigint;
  slashCount: number;
  rewardsClaimed: bigint;
}

// Human-readable role names
export const ROLE_NAMES: Record<AdminRole, string> = {
  [AdminRole.NONE]: "User",
  [AdminRole.TEAM_MANAGER]: "Team Manager",
  [AdminRole.VOTE_ADMIN]: "Vote Admin",
  [AdminRole.RECOVERY_ADMIN]: "Recovery Admin",
  [AdminRole.SUPER_ADMIN]: "Super Admin"
};

// Role colors matching brand theme
export const ROLE_COLORS: Record<AdminRole, string> = {
  [AdminRole.NONE]: "gray",
  [AdminRole.TEAM_MANAGER]: "cyan",      // #0093cb
  [AdminRole.VOTE_ADMIN]: "green",       // #78C700
  [AdminRole.RECOVERY_ADMIN]: "orange",  // #FF9100
  [AdminRole.SUPER_ADMIN]: "pink"        // #FF71E1
};

// Role-specific Tailwind classes for badges
export const ROLE_STYLES: Record<AdminRole, string> = {
  [AdminRole.NONE]: "bg-gray-800 text-gray-300 border-gray-600",
  [AdminRole.TEAM_MANAGER]: "bg-custom-cyan/20 text-custom-cyan border-custom-cyan/40",
  [AdminRole.VOTE_ADMIN]: "bg-custom-green/20 text-custom-green border-custom-green/40",
  [AdminRole.RECOVERY_ADMIN]: "bg-custom-orange/20 text-custom-orange border-custom-orange/40",
  [AdminRole.SUPER_ADMIN]: "bg-custom-pink/20 text-custom-pink border-custom-pink/40"
};

// Role permissions descriptions
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  [AdminRole.NONE]: [
    "Cast votes for teams",
    "View team information"
  ],
  [AdminRole.TEAM_MANAGER]: [
    "Add new teams",
    "Remove teams",
    "Update team details",
    "All NONE permissions"
  ],
  [AdminRole.VOTE_ADMIN]: [
    "Enable/disable voting",
    "Set voting duration",
    "Configure voting limits",
    "Set voting token",
    "All TEAM_MANAGER permissions"
  ],
  [AdminRole.RECOVERY_ADMIN]: [
    "Trigger emergency mode",
    "Emergency withdrawals",
    "Add emergency admins",
    "All VOTE_ADMIN permissions"
  ],
  [AdminRole.SUPER_ADMIN]: [
    "Full system control",
    "Manage all admins",
    "System reset",
    "Resolve emergencies",
    "All permissions"
  ]
};

// Role icons for visual indicators
export const ROLE_ICONS: Record<AdminRole, string> = {
  [AdminRole.NONE]: "",
  [AdminRole.TEAM_MANAGER]: "👥",
  [AdminRole.VOTE_ADMIN]: "🗳️",
  [AdminRole.RECOVERY_ADMIN]: "🚨",
  [AdminRole.SUPER_ADMIN]: "👑"
};

// Helper function to get role name
export const getRoleName = (role: AdminRole): string => {
  return ROLE_NAMES[role] || "Unknown";
};

// Helper function to check if role has minimum privilege
export const hasMinimumRole = (userRole: AdminRole, requiredRole: AdminRole): boolean => {
  return userRole >= requiredRole;
};
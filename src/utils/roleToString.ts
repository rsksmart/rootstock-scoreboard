import { AdminRole } from '@/constants';

export const roleToString = (role: AdminRole): string => {
  switch (role) {
    case AdminRole.NONE:
      return 'None';
    case AdminRole.TEAM_MANAGER:
      return 'Team Manager';
    case AdminRole.VOTE_ADMIN:
      return 'Vote Admin';
    case AdminRole.RECOVERY_ADMIN:
      return 'Recovery Admin';
    case AdminRole.SUPER_ADMIN:
      return 'Super Admin';
    default:
      return 'Unknown Role';
  }
};

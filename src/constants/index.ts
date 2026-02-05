
export const TEAM_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_TEAM_MANAGER_ADDRESS;
export const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER;
export const GOVERNANCE_TOKEN = process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN;
export const PINATA_URL = process.env.NEXT_PUBLIC_PINATA_URL;

export const FETCH_STATUS = {
  INIT: 'INIT',
  WAIT_WALLET: 'WAIT_WALLET',
  WAIT_TX: 'WAIT_TX',
  COMPLETED: 'COMPLETED',
  ERROR: "ERROR",
}

export enum AdminRole {
  NONE = 0,
  TEAM_MANAGER = 1,
  VOTE_ADMIN = 2,
  RECOVERY_ADMIN = 3,
  SUPER_ADMIN = 4,
}

export const DUMMY_TOKEN_IMAGE = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23111111'/><circle cx='50' cy='50' r='40' stroke='%23FF9100' stroke-width='4' fill='none'/><path d='M50 30 L50 70 M35 40 L65 40 M35 60 L65 60' stroke='%23FF9100' stroke-width='4' stroke-linecap='round'/></svg>`;

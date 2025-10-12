
export const TEAM_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_TEAM_MANAGER_ADDRESS;
export const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER;
export const GOVERNANCE_TOKEN = process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN;
export const PINATA_URL = process.env.NEXT_PUBLIC_PINATA_URL;

console.log('🔍 DEBUG - TEAM_MANAGER_ADDRESS:', TEAM_MANAGER_ADDRESS);
console.log('🔍 DEBUG - All env vars:', process.env);

export const FETCH_STATUS = {
  INIT: 'INIT',
  WAIT_WALLET: 'WAIT_WALLET',
  WAIT_TX: 'WAIT_TX',
  COMPLETED: 'COMPLETED',
  ERROR: "ERROR",
}
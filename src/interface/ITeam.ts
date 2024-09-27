export interface ITeam {
  teamName: string
  uri: string
  symbol: string
  memeTokenAddress: string
  leaderAddress: string
  score?: number
}
export interface ICreateTeam {
  teamName: string
  memeTokenAddress: string,
  teamLeaderAddress?: string,
}
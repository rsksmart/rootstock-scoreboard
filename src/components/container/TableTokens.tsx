import React, { useEffect, useState } from 'react'
import AddVoteDialog from '../dialog/AddVoteDialog';
import { useAuth } from '@/context/AuthContext';
import { ITeam } from '@/interface/ITeam';
import useManager from '@/hooks/useManager';
import { TeamRowComp } from './Team';

function TableTokens() {
  const [dialog, setDialog] = useState<boolean>(false);
  const { teams, setTeam } = useAuth();
  const { getVotingStatus } = useManager();
  const [isVotingActive, setIsVotingActive] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getVotingStatus();

      if (status) {
        const now = Math.floor(Date.now() / 1000);

        const isActuallyActive =
          status.isActive && (status.endTime === 0 || status.endTime > now);

        setIsVotingActive((prev) =>
          prev !== isActuallyActive ? isActuallyActive : prev
        );
      }
    };
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [getVotingStatus, teams]);

  const teamsFiltered = () => {
    const newTeams = teams?.sort((a, b) => b.score! - a.score!);
    if (!teams?.length) return [];
    const lead = newTeams![0];
    const teamsLead: ITeam[] = newTeams!.filter((t) => t.teamName.includes(lead.teamName.split('-')[0]));
    const withoutLead: ITeam[] = newTeams!.filter((t) => !t.teamName.includes(lead.teamName.split('-')[0]))
      .sort((a, b) => a.teamName.localeCompare(b.teamName))
      .sort((a, b) => b.score! - a.score!);
    return teamsLead.concat(withoutLead);
  }

  return (
    <>
      {
        teams?.length === 0 ?
        <div className='w-full flex justify-center mt-10'>
          <span className='text-6xl italic text-zinc-800'>No Teams</span>
        </div>
      :
        <table className='w-full table-fixed mt-5 border-spacing-5'>
          <thead className='bg-zinc-900 h-14'>
            <tr>
              <th>Logo</th>
              <th>Team Name</th>
              <th>Symbol</th>
              <th>Leader Address</th>
              <th>Meme Toke Address</th>
              <th>Score</th>
              <th>Option</th>
            </tr>
          </thead>
          <tbody>
            {
              teamsFiltered()?.map((team, i) => (
                <TeamRowComp
                key={i}
                team={team}
                {...team}
                i={i}
                setDialog={setDialog}
                setTeam={setTeam}
                isVotingActive={isVotingActive}
              />
              ))
            }
          </tbody>
        </table>
      }

      <AddVoteDialog
        open={dialog}
        closeDialog={() => setDialog(false)}
      />
    </>
  )
}

export default TableTokens

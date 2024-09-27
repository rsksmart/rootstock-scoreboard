import React, { useState } from 'react'
import AddVoteDialog from '../dialog/AddVoteDialog';
import Button from '../common/Button';
import { useAuth } from '@/context/AuthContext';
import { PINATA_URL } from '@/constants';
import CopyIcon from '../icons/CopyIcon';
import CopyContent from './CopyContent';
import { ITeam } from '@/interface/ITeam';

function TableTokens() {
  const [dialog, setDialog] = useState<boolean>(false);
  const { teams, setTeam } = useAuth();

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
                <tr key={i} className='text-center h-14 pt-3 border-spacing-3 border-b border-zinc-800 hover:bg-zinc-900'>
                  <td>
                    <div className='flex justify-center'>
                      <img src={`${PINATA_URL}${team.uri}`} alt="" className='w-10 h-10 rounded-full' />
                    </div>
                  </td>
                  <td>{ team.teamName }</td>
                  <td>{ team.symbol }</td>
                  <td>
                    <CopyContent address={team.leaderAddress} />
                  </td>
                  <td>
                    <CopyContent address={team.memeTokenAddress} />
                  </td>
                  <td>
                    <span className={`${(i === 0 && team.score) ? 'text-custom-lime font-semibold' : ''}`}>{team.score}</span>
                  </td>
                  <td>
                    <div className='flex justify-center'>
                      <Button
                        variant='secondary'
                        onClick={() => { setDialog(true); setTeam(team) }}
                        className=''
                        width={80}
                      >
                        Vote
                      </Button>
                    </div>
                  </td>
                </tr>
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

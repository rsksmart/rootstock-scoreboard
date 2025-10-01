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
          <span className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic text-zinc-800'>No Teams</span>
        </div>
      :
        <div className='w-full overflow-x-auto mt-5'>
          <table className='w-full min-w-[800px] table-fixed border-spacing-5'>
            <thead className='bg-zinc-900 h-12 sm:h-14'>
              <tr className='text-xs sm:text-sm md:text-base'>
                <th className='w-16 sm:w-20'>Logo</th>
                <th className='w-32 sm:w-40'>Team Name</th>
                <th className='w-24 sm:w-28'>Symbol</th>
                <th className='w-36 sm:w-44'>Leader Address</th>
                <th className='w-36 sm:w-44'>Meme Token Address</th>
                <th className='w-20 sm:w-24'>Score</th>
                <th className='w-24 sm:w-28'>Option</th>
              </tr>
            </thead>
            <tbody>
              {
                teamsFiltered()?.map((team, i) => (
                  <tr key={i} className='text-center h-12 sm:h-14 pt-3 border-spacing-3 border-b border-zinc-800 hover:bg-zinc-900 text-xs sm:text-sm md:text-base'>
                    <td>
                      <div className='flex justify-center'>
                        <img src={`${PINATA_URL}${team.uri}`} alt="" className='w-8 h-8 sm:w-10 sm:h-10 rounded-full' />
                      </div>
                    </td>
                    <td className='truncate px-2'>{ team.teamName }</td>
                    <td>{ team.symbol }</td>
                    <td className='px-2'>
                      <CopyContent address={team.leaderAddress} />
                    </td>
                    <td className='px-2'>
                      <CopyContent address={team.memeTokenAddress} />
                    </td>
                    <td>
                      <span className={`${(i === 0 && team.score) ? 'text-custom-lime font-semibold text-sm sm:text-base' : ''}`}>{team.score}</span>
                    </td>
                    <td>
                      <div className='flex justify-center'>
                        <Button
                          variant='secondary'
                          onClick={() => { setDialog(true); setTeam(team) }}
                          className='text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2'
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
        </div>
      }

      <AddVoteDialog
        open={dialog}
        closeDialog={() => setDialog(false)}
      />
    </>
  )
}

export default TableTokens

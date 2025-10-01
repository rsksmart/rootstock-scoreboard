'use client'
import { useEffect, useState } from 'react';
import Button from '../common/Button'
import Title from './Title'
import useManager from '@/hooks/useManager';
import { useAuth } from '@/context/AuthContext';
import { AdminRole } from '@/types/admin';
import RoleGuard from '../guards/RoleGuard';
import TableTokens from './TableTokens';
import AddTeamDialog from '../dialog/AddTeamDialog';
import TableLoader from '../loader/TableLoader';

function Content() {
  const [dialog, setDialog] = useState<boolean>(false);

  const { getTeams } = useManager();
  const { provider, teamLoading } = useAuth();
  useEffect(() => {
    getTeams();
  }, [provider, getTeams]);
  return (
    <>
      <section className='mt-5 sm:mt-5 pt-3 sm:pt-5 w-full px-3 sm:px-6 lg:w-[90%] xl:w-[1300px] m-auto'>
        <div className='w-full flex flex-col'>
          <div className='flex gap-3'>
            <div className='flex-1'>
              <Title />
            </div>
          </div>
        </div>
        <div className='mt-6 sm:mt-8 md:mt-10'>
          <div className='w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4'>
            <h2 className='text-xl sm:text-2xl font-bold'>Teams List</h2>
            <RoleGuard
              requiredRole={AdminRole.TEAM_MANAGER}
              fallback={
                <div className="text-sm text-zinc-500 italic">
                  Only Team Managers can add teams
                </div>
              }
            >
              <Button
                onClick={() => setDialog(true)}
                variant='secondary'
                outline
              >Add Team</Button>
            </RoleGuard>
          </div>
          {
            teamLoading ? <TableLoader /> : <TableTokens />
          }
        </div>
      </section>
      <AddTeamDialog open={dialog} closeDialog={() => setDialog(false)} />
    </>
  )
}

export default Content

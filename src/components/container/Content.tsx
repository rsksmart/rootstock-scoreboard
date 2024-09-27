'use client'
import { useEffect, useState } from 'react';
import Button from '../common/Button'
import Title from './Title'
import useManager from '@/hooks/useManager';
import { useAuth } from '@/context/AuthContext';
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
      <section className='mt-16 pt-5 w-full lg:w-[90%] xl:w-[1300px] m-auto'>
        <div className='w-full flex flex-col'>
          <div className='flex gap-3'>
            <div className='flex-1'>
              <Title />
            </div>
          </div>
        </div>
        <div className='mt-10'>
          <div className='w-full flex justify-between'>
            <h2 className='text-2xl font-bold'>Teams List</h2>
            <Button
              onClick={() => setDialog(true)}
              variant='secondary'
              outline
            >Add Team</Button>
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

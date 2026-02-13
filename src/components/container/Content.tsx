'use client'
import { useEffect, useState } from 'react';
import Button from '../common/Button'
import Title from './Title'
import useManager from '@/hooks/useManager';
import { useAuth } from '@/context/AuthContext';
import TableTokens from './TableTokens';
import AddTeamDialog from '../dialog/AddTeamDialog';
import TableLoader from '../loader/TableLoader';
import { AdminRole } from '@/constants';
import { IVotingStatus } from '@/interface/IVotingStatus';
import Countdown from '../extras/Countdown';
import AddAdminDialog from '../dialog/AddAdminDialog';
import KickstartVotingDialog from '../dialog/KickstartDialog';

function Content() {
  const [dialog, setDialog] = useState<boolean>(false);
  const [votingStatus, setVotingStatus] = useState<IVotingStatus | null>(null);
  const [kickstartOpen, setKickstartOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const { getTeams, getVotingStatus, checkAdminPermissions } = useManager();
  const { provider, teamLoading } = useAuth();
  const [userStatus, setUserStatus] = useState<{
    isAuthorized: boolean;
    role: AdminRole;
  }>({ isAuthorized: false, role: AdminRole.NONE });

  useEffect(() => {
    let isCurrent = true;
    const init = async () => {
      await getTeams();
      let status = await getVotingStatus();
      if (isCurrent) {
        if (status) {
          setVotingStatus(status);
        }
        let result = await checkAdminPermissions();
        setUserStatus(result);
      }
    };
    init();
    return () => {
      isCurrent = false;
    };
  }, [provider, getTeams,getVotingStatus, checkAdminPermissions]);

  return (
    <>
      <section className='mt-16 pt-5 w-full lg:w-[90%] xl:w-[1300px] m-auto'>
        <div className='w-full flex flex-col'>
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
            <div className='flex-1'>
              <Title />
            </div>
            {votingStatus?.isActive && (
              <Countdown
                endTime={votingStatus.endTime}
                onFinished={getVotingStatus}
              />
            )}
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          {userStatus.isAuthorized && (
            <div className="flex items-end">
              <Button
                onClick={() => setKickstartOpen(true)}
                variant="secondary"
                outline
              >
                {votingStatus?.isActive ? "Update" : "Kickstart"}
              </Button>
            </div>
          )}
          {userStatus.isAuthorized &&
            userStatus.role === AdminRole.SUPER_ADMIN && (
              <div className="flex items-end">
                <Button
                  onClick={() => setIsAdminModalOpen(true)}
                  variant="secondary"
                  outline
                >
                  Add Admin
                </Button>
              </div>
            )}
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

        <KickstartVotingDialog
        open={kickstartOpen}
        closeDialog={() => setKickstartOpen(false)}
        onSuccess={async () => {
          const status = await getVotingStatus();
          if (status) setVotingStatus(status);
        }}
        votingStatus={votingStatus}
      />
      <AddAdminDialog
        open={isAdminModalOpen}
        closeDialog={() => setIsAdminModalOpen(false)}
      />
    </>
  )
}

export default Content

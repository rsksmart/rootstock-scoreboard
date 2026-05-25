'use client'
import { useEffect, useState } from 'react';
import Button from '../common/Button'
import Title from './Title'
import useManager from '@/hooks/useManager';
import { useAuth } from '@/context/AuthContext';
import TableTokens from './TableTokens';
import AddTeamDialog from '../dialog/AddTeamDialog';
import TableLoader from '../loader/TableLoader';
import { AdminRole, GOVERNANCE_TOKEN } from '@/constants';
import { IVotingStatus } from '@/interface/IVotingStatus';
import { formatAddress } from '@/utils/formatAddress';
import Countdown from '../extras/Countdown';
import AddAdminDialog from '../dialog/AddAdminDialog';
import KickstartVotingDialog from '../dialog/KickstartDialog';
import EmergencyDialog from '../dialog/EmergencyDialog';
import WithdrawDialog from '../dialog/WithdrawDialog';
import { roleToString } from '@/utils/roleToString';
import { toast } from 'react-toastify';

function Content() {
  const [dialog, setDialog] = useState<boolean>(false);
  const [votingStatus, setVotingStatus] = useState<IVotingStatus | null>(null);
  const [kickstartOpen, setKickstartOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const { getTeams, getVotingStatus, checkAdminPermissions, getIsEmergencyMode } = useManager();
  const { teamLoading, address, isEmergencyMode, setIsEmergencyMode } = useAuth();
  const [userStatus, setUserStatus] = useState<{
    isAdminAuthorized: boolean;
    isVotingAuthorized: boolean;
    role: AdminRole;
  }>({ isAdminAuthorized: false, isVotingAuthorized: false, role: AdminRole.NONE });
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const initGlobalData = async () => {
      const contractIsInEmergency = await getIsEmergencyMode();
      if (isCurrent) setIsEmergencyMode(contractIsInEmergency);

      const status = await getVotingStatus();
      if (isCurrent && status) {
        setVotingStatus(status);
      }

      await getTeams();
    };
    initGlobalData();
    return () => {
      isCurrent = false;
    };
  }, [getIsEmergencyMode, getTeams, getVotingStatus, setIsEmergencyMode]);

  useEffect(() => {
    let isCurrent = true;
    const initUserRole = async () => {
      setIsCheckingRole(true);
      if (!address) {
        if (isCurrent) {
          setUserStatus({ isAdminAuthorized: false, isVotingAuthorized: false, role: AdminRole.NONE });
          setIsCheckingRole(false);
        }
        return;
      }
      const result = await checkAdminPermissions();
      if (isCurrent) {
        setUserStatus(result);
        setIsCheckingRole(false);
      }
    };
    initUserRole();
    return () => {
      isCurrent = false;
    };
  }, [address, checkAdminPermissions]);


  return (
    <>
      <section className='mt-16 pt-5 w-full lg:w-[90%] xl:w-[1300px] m-auto'>
        {isEmergencyMode && (
          <div className="mb-8 w-full p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-4 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-pulse shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold text-lg tracking-wide text-red-400">Emergency Mode Active</h3>
              <p className="text-sm text-red-400/90 font-medium mt-1">The system is currently in emergency mode. Regular operations might be restricted or paused.</p>
            </div>
          </div>
        )}
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
        {address && userStatus && (
          <div className="mt-6 flex flex-col gap-3">
            <h2 className="text-2xl font-semibold text-gray-100 tracking-wide">
              Welcome, <span className="text-amber-500 drop-shadow-sm">
                {isCheckingRole ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  userStatus.role === AdminRole.NONE ? 'User' : roleToString(userStatus.role)
                )}
              </span>{isCheckingRole ? '' : '!'}
            </h2>

            {GOVERNANCE_TOKEN && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>Governance Token:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(GOVERNANCE_TOKEN!);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 hover:border-zinc-500/50 transition-colors rounded px-2 py-1 gap-2 group focus:outline-none focus:ring-1 focus:ring-custom-orange cursor-pointer"
                  title="Copy token address"
                >
                  <span className="font-mono text-zinc-300 group-hover:text-white transition-colors">
                    {formatAddress(GOVERNANCE_TOKEN!)}
                  </span>
                  <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors p-0.5 rounded-sm">
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
        <div className="mt-8 flex gap-4">
          {userStatus.isVotingAuthorized && (
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
          {
            (userStatus.role === AdminRole.SUPER_ADMIN || userStatus.role === AdminRole.RECOVERY_ADMIN) && (
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
          {isEmergencyMode &&
            (userStatus.role === AdminRole.SUPER_ADMIN || userStatus.role === AdminRole.RECOVERY_ADMIN) && (
              <div className="flex items-end">
                <Button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  variant="secondary"
                  outline
                >
                  Withdraw
                </Button>
              </div>
            )}
          {((isEmergencyMode && userStatus.role === AdminRole.SUPER_ADMIN) || (!isEmergencyMode && userStatus.role === AdminRole.RECOVERY_ADMIN)) && (
            <div className="flex items-end">
              <Button
                onClick={() => setIsEmergencyModalOpen(true)}
                variant="secondary"
                outline
                width={160}
              >
                {isEmergencyMode ? "Exit Emergency" : "Enter Emergency"}
              </Button>
            </div>
          )}
        </div>
        <div className='mt-10'>
          <div className='w-full flex justify-between'>
            <h2 className='text-2xl font-bold'>Teams List</h2>
            {userStatus.isAdminAuthorized && (
              <Button
                onClick={() => setDialog(true)}
                variant='secondary'
                outline
              >Add Team</Button>
            )}
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
        userRole={userStatus.role}
      />
      <EmergencyDialog
        open={isEmergencyModalOpen}
        closeDialog={() => setIsEmergencyModalOpen(false)}
        userRole={userStatus.role}
      />
      <WithdrawDialog
        open={isWithdrawModalOpen}
        closeDialog={() => setIsWithdrawModalOpen(false)}
      />
    </>
  )
}

export default Content

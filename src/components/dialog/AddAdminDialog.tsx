'use client';
import React, { useState } from 'react';
import BaseDialog from './BaseDialog';
import Button from '../common/Button';
import Input from '../common/Input';
import ContentDialog from './ContentDialog';
import { AdminRole } from '@/types/admin';
import { FETCH_STATUS } from '@/constants';
import { ethers } from 'ethers';

interface AddAdminDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (address: string, role: AdminRole) => Promise<void>;
  isLoading: number;
}

const STEP_STATUS = {
  INIT: 0,
  CONFIRM: 1,
};

export default function AddAdminDialog({
  open,
  onClose,
  onAdd,
  isLoading,
}: AddAdminDialogProps) {
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<AdminRole>(AdminRole.TEAM_MANAGER);
  const [validAddress, setValidAddress] = useState(true);
  const [step, setStep] = useState(STEP_STATUS.INIT);

  const getRoleName = (role: AdminRole): string => {
    switch (role) {
      case AdminRole.TEAM_MANAGER: return 'TEAM_MANAGER';
      case AdminRole.VOTE_ADMIN: return 'VOTE_ADMIN';
      case AdminRole.RECOVERY_ADMIN: return 'RECOVERY_ADMIN';
      case AdminRole.SUPER_ADMIN: return 'SUPER_ADMIN';
      default: return 'NONE';
    }
  };

  const handleSubmit = async () => {
    const isValid = ethers.isAddress(address);
    setValidAddress(isValid);

    if (step === STEP_STATUS.INIT && address && isValid) {
      setStep(STEP_STATUS.CONFIRM);
      setValidAddress(true);
      return;
    }

    if (step === STEP_STATUS.CONFIRM && address && isValid) {
      await onAdd(address, role);
    }
  };

  const init = () => {
    setAddress('');
    setRole(AdminRole.TEAM_MANAGER);
    setValidAddress(true);
    setStep(STEP_STATUS.INIT);
  };

  const handleClose = () => {
    init();
    onClose();
  };

  const handleReset = () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      onClose();
    }
    init();
  };

  return (
    <BaseDialog open={open} closeDialog={handleClose} className="w-full max-w-[480px] h-auto min-h-[400px] sm:h-[400px] mx-4 sm:mx-0 bg-black border border-zinc-700">
      <div className="w-full h-full flex flex-col">
        <ContentDialog
          initialContent={
            <>
              <h2 className={`${step === STEP_STATUS.INIT ? 'bg-custom-green' : 'bg-custom-pink'} mt-1 font-bold text-base sm:text-lg text-black w-max px-1 items-start`}>
                {step === STEP_STATUS.INIT ? 'ADD ADMINISTRATOR' : 'CONFIRM ADMIN DATA'}
              </h2>

              <form className={`w-full mt-3 sm:mt-5 items-center flex flex-wrap form-team ${step === STEP_STATUS.CONFIRM ? 'confirm' : ''}`}>
                <div className="w-full px-1 py-1.5 sm:p-2">
                  <label htmlFor="address" className="font-semibold text-xs sm:text-sm ml-1 sm:ml-3 mb-1 block">
                    Administrator Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    id="address"
                    name="address"
                    placeholder="0x..."
                    height={32}
                    className="ml-1 sm:ml-3"
                  />
                  {!validAddress && (
                    <span className="text-red-500 text-xs ml-1 sm:ml-3 mt-1 block">enter a valid address</span>
                  )}
                  <div className="team-detail ml-1 sm:ml-3 text-xs sm:text-sm break-all">{address}</div>
                </div>

                <div className="w-full px-1 py-1.5 sm:p-2">
                  <label htmlFor="role" className="font-semibold text-xs sm:text-sm ml-1 sm:ml-3 mb-1 block">
                    Admin Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(Number(e.target.value) as AdminRole)}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white ml-1 sm:ml-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-custom-green"
                    style={{ height: '32px' }}
                  >
                    <option value={AdminRole.TEAM_MANAGER}>TEAM_MANAGER</option>
                    <option value={AdminRole.VOTE_ADMIN}>VOTE_ADMIN</option>
                    <option value={AdminRole.RECOVERY_ADMIN}>RECOVERY_ADMIN</option>
                    <option value={AdminRole.SUPER_ADMIN}>SUPER_ADMIN</option>
                  </select>
                  <div className="team-detail ml-1 sm:ml-3 text-xs sm:text-sm text-custom-green font-semibold">{getRoleName(role)}</div>
                </div>

                {step === STEP_STATUS.CONFIRM && (
                  <div className="w-full px-1 py-1.5 sm:p-2 mt-1">
                    <div className="ml-1 sm:ml-3 border-l-2 border-custom-orange pl-3 py-1.5">
                      <p className="text-xs text-zinc-400 mb-1">
                        This admin will be able to:
                      </p>
                      <ul className="text-xs text-zinc-300 space-y-0.5">
                        {role >= AdminRole.TEAM_MANAGER && <li>• Manage teams</li>}
                        {role >= AdminRole.VOTE_ADMIN && <li>• Control voting</li>}
                        {role >= AdminRole.RECOVERY_ADMIN && <li>• Trigger emergency mode</li>}
                        {role === AdminRole.SUPER_ADMIN && <li className="text-custom-orange font-semibold">• Manage administrators</li>}
                      </ul>
                    </div>
                  </div>
                )}
              </form>

              <div className="w-full flex flex-row mt-3 justify-between gap-2 px-1 sm:px-0">
                <Button
                  outline
                  onClick={() => {step === STEP_STATUS.INIT ? handleClose() : setStep(STEP_STATUS.INIT)}}
                  width={120}
                  className="flex-1 sm:flex-none sm:w-[120px] text-sm"
                >
                  {step === STEP_STATUS.INIT ? 'Cancel' : 'Back'}
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="secondary"
                  outline
                  width={120}
                  className="flex-1 sm:flex-none sm:w-[120px] text-sm"
                >
                  {step === STEP_STATUS.INIT ? 'Next' : 'Add Admin'}
                </Button>
              </div>
            </>
          }
          status={isLoading}
          loadingTitle="Adding Administrator"
          createdTitle="Admin was Added"
          onClose={handleReset}
          btnError="try again"
        />
      </div>
    </BaseDialog>
  );
}

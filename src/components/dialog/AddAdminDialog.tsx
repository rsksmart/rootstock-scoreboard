"use client";
import BaseDialog from "./BaseDialog";
import Button from "../common/Button";
import { FETCH_STATUS, AdminRole } from "@/constants";
import { useState } from "react";
import ContentDialog from "./ContentDialog";
import { useAuth } from "@/context/AuthContext";
import useManager from "@/hooks/useManager";
import ConnectWalletButton from "../navigation/ConnectWalletButton";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { formatAddress } from "@/utils/formatAddress";
import { roleToString } from "@/utils/roleToString";

type Props = {
  open: boolean;
  closeDialog: () => void;
  onSuccess?: () => void;
  userRole: AdminRole;
};

function AddAdminDialog({ open, closeDialog, onSuccess, userRole }: Props) {
  const { isLoading, setIsLoading, contractErrorText, assignAdminRole } =
    useManager();
  const { address, isEmergencyMode } = useAuth();

  const [targetAddress, setTargetAddress] = useState<string>("");
  const [role, setRole] = useState<AdminRole>(AdminRole.TEAM_MANAGER);

  const handleCloseDialog = () => {
    setIsLoading(FETCH_STATUS.INIT);
    setTargetAddress("");
    setRole(AdminRole.TEAM_MANAGER);

    closeDialog();
  };

  const successMessage = `${roleToString(role)} role assigned to ${formatAddress(
    targetAddress
  )}`;

  const onAddAdmin = async () => {
    if (!isEmergencyMode && userRole === AdminRole.RECOVERY_ADMIN) {
      toast.error("Recovery Admin can only add Admins during emergency mode.");
      return;
    }
    const cleanAddress = targetAddress.trim().toLowerCase();
    if (!ethers.isAddress(cleanAddress)) {
      toast.error("Please enter a valid wallet address.");
      return;
    }
    if (role === AdminRole.NONE) {
      toast.error("Please select a valid permission level.");
      return;
    }
    if (cleanAddress === address?.toLowerCase()) {
      toast.error("You cannot re-add yourself.");
      return;
    }

    const isSuccess = await assignAdminRole(cleanAddress, role, isEmergencyMode);
    if (!isSuccess) return;
    if (onSuccess) onSuccess();
  };

  return (
    <BaseDialog
      open={open}
      closeDialog={handleCloseDialog}
      className="w-[490px] h-fit min-h-[420px] pb-6 bg-black border border-zinc-700 transition-all duration-200"
    >
      <div className="w-full h-full flex flex-col">
        {!address && (
          <div className="absolute inset-0 w-full h-full flex justify-center items-center z-50">
            <div className="absolute w-full h-full bg-black opacity-80"></div>
            <div className="relative z-20">
              <ConnectWalletButton />
            </div>
          </div>
        )}

        <ContentDialog
          status={isLoading}
          loadingTitle="Assigning Role"
          createdTitle={successMessage}
          onClose={handleCloseDialog}
          btnError="Try Again"
          errorText={contractErrorText}
          initialContent={
            <>
              <h2 id="dialog-title" className="bg-custom-orange mt-1 font-bold text-xl text-black w-max px-1 uppercase">
                Add New Admin
              </h2>

              {isEmergencyMode && (
                <div className="mt-6 mx-3 p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-start gap-2 text-sm text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong>Action enhanced:</strong> Admin roles can be assigned by <strong>SUPER_ADMIN</strong> or <strong>RECOVERY_ADMIN</strong> while the system is in Emergency Mode.</span>
                </div>
              )}

              <div className="w-full mt-6 flex flex-col gap-5 px-3">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-zinc-400 uppercase">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    className="bg-transparent border border-zinc-700 p-2 w-full text-white outline-none focus:border-custom-orange text-sm font-mono"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-zinc-400 uppercase">
                    Assign Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(Number(e.target.value))}
                    className="bg-black border border-zinc-700 p-2 w-full text-white outline-none focus:border-custom-orange"
                  >
                    <option value={AdminRole.TEAM_MANAGER}>Team Manager</option>
                    <option value={AdminRole.VOTE_ADMIN}>Vote Admin</option>
                    <option value={AdminRole.RECOVERY_ADMIN}>
                      Recovery Admin
                    </option>
                    <option value={AdminRole.SUPER_ADMIN}>Super Admin</option>
                  </select>
                </div>

                <p className="text-zinc-500 text-[11px] italic">
                  * Admins are granted permissions hierarchically based on the
                  contract logic.
                </p>
              </div>

              <div className="w-full flex mt-10 justify-between px-2">
                <Button outline onClick={handleCloseDialog} width={100}
                  aria-label="Cancel and close dialog">
                  Cancel
                </Button>
                <Button
                  onClick={onAddAdmin}
                  variant="secondary"
                  outline
                  width={180}
                >
                  Assign Role
                </Button>
              </div>
            </>
          }
        />
      </div>
    </BaseDialog>
  );
}

export default AddAdminDialog;

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

type Props = {
  open: boolean;
  closeDialog: () => void;
  onSuccess?: () => void;
};

function AddAdminDialog({ open, closeDialog, onSuccess }: Props) {
  const { isLoading, setIsLoading, contractErrorText, assignAdminRole } =
    useManager();
  const { address } = useAuth();

  const [targetAddress, setTargetAddress] = useState<string>("");
  const [role, setRole] = useState<AdminRole>(AdminRole.TEAM_MANAGER);

  const handleCloseDialog = () => {
    setIsLoading(FETCH_STATUS.INIT);
    setTargetAddress("");
    setRole(AdminRole.TEAM_MANAGER);

    closeDialog();
  };

  const getRoleName = (r: AdminRole) => {
    const names: Record<number, string> = {
      [AdminRole.TEAM_MANAGER]: "Team Manager",
      [AdminRole.VOTE_ADMIN]: "Vote Admin",
      [AdminRole.RECOVERY_ADMIN]: "Recovery Admin",
      [AdminRole.SUPER_ADMIN]: "Super Admin",
    };

    return names[r] || "Invalid Role";
  };

  const successMessage = `${getRoleName(role)} role assigned to ${formatAddress(
    targetAddress
  )}`;

  const onAddAdmin = async () => {
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

    const isSuccess = await assignAdminRole(cleanAddress, role);
    if (!isSuccess) return;
    if (onSuccess) onSuccess();
  };

  return (
    <BaseDialog
      open={open}
      closeDialog={handleCloseDialog}
      className="w-[490px] h-[420px] bg-black border border-zinc-700 transition-all duration-200"
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
              <h2 className="bg-custom-orange mt-1 font-bold text-xl text-black w-max px-1 uppercase">
                Add New Admin
              </h2>

              <div className="w-full mt-8 flex flex-col gap-5 px-3">
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
                <Button outline onClick={handleCloseDialog} width={100}>
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

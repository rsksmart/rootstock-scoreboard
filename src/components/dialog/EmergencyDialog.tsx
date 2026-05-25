"use client";
import BaseDialog from "./BaseDialog";
import Button from "../common/Button";
import { FETCH_STATUS, AdminRole } from "@/constants";
import ContentDialog from "./ContentDialog";
import { useAuth } from "@/context/AuthContext";
import useManager from "@/hooks/useManager";
import ConnectWalletButton from "../navigation/ConnectWalletButton";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  closeDialog: () => void;
  userRole: AdminRole;
};

function EmergencyDialog({ open, closeDialog, userRole }: Props) {
  const { isLoading, setIsLoading, contractErrorText, triggerEmergencyMode, resolveEmergency } = useManager();
  const { address, isEmergencyMode, setIsEmergencyMode } = useAuth();

  const handleCloseDialog = () => {
    setIsLoading(FETCH_STATUS.INIT);
    closeDialog();
  };

  const handleEmergencyAction = async () => {
    if (isEmergencyMode) {
      if (userRole !== AdminRole.SUPER_ADMIN) {
        toast.error("Only a Super Admin can resolve an emergency.");
        return;
      }
      const success = await resolveEmergency();
      if (!success) return;
      setIsEmergencyMode(false);
    } else {
      if (userRole !== AdminRole.RECOVERY_ADMIN) {
        toast.error("Only a Recovery Admin can trigger an emergency.");
        return;
      }
      const success = await triggerEmergencyMode();
      if (!success) return;
      setIsEmergencyMode(true);
    }
  };

  return (
    <BaseDialog
      open={open}
      closeDialog={handleCloseDialog}
      className="w-[490px] h-fit min-h-[320px] pb-6 bg-black border border-zinc-700 transition-all duration-200"
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
          loadingTitle={isEmergencyMode ? "Resolving Emergency" : "Triggering Emergency"}
          createdTitle={isEmergencyMode ? "Emergency Triggered" : "Emergency Resolved"}
          onClose={handleCloseDialog}
          btnError="Try Again"
          errorText={contractErrorText}
          initialContent={
            <>
              <h2 id="dialog-title" className={`${isEmergencyMode ? 'bg-custom-green' : 'bg-red-500'} mt-1 font-bold text-xl text-black w-max px-2 uppercase`}>
                {isEmergencyMode ? "Resolve Emergency" : "Trigger Emergency"}
              </h2>

              <div className="w-full mt-8 flex flex-col gap-5 px-3">
                <p className="text-gray-300">
                  {isEmergencyMode
                    ? "Are you sure you want to resolve the emergency and restore standard operations? Only a Super Admin can perform this action."
                    : "Are you sure you want to trigger emergency mode? This will restrict certain platform operations. Only a Recovery Admin can perform this action."}
                </p>
              </div>

              <div className="w-full flex mt-10 justify-between px-2">
                <Button outline onClick={handleCloseDialog} width={100} aria-label="Cancel and close dialog">
                  Cancel
                </Button>
                <Button
                  onClick={handleEmergencyAction}
                  variant="secondary"
                  outline
                  width={200}
                >
                  {isEmergencyMode ? "Resolve Emergency" : "Trigger Emergency"}
                </Button>
              </div>
            </>
          }
        />
      </div>
    </BaseDialog>
  );
}

export default EmergencyDialog;

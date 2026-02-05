"use client";
import BaseDialog from "./BaseDialog";
import Button from "../common/Button";
import { FETCH_STATUS } from "@/constants";
import { useState } from "react";
import ContentDialog from "./ContentDialog";
import { useAuth } from "@/context/AuthContext";
import useManager from "@/hooks/useManager";
import ConnectWalletButton from "../navigation/ConnectWalletButton";
import { IVotingStatus } from "@/interface/IVotingStatus";

type Props = {
  open: boolean;
  closeDialog: () => void;
  onSuccess: () => void;
  votingStatus: IVotingStatus | null;
};

function KickstartVotingDialog({
  open,
  closeDialog,
  onSuccess,
  votingStatus,
}: Props) {
  const {
    isLoading,
    setIsLoading,
    getVotingStatus,
    contractErrorText,
    kickStartVoting,
  } = useManager();
  const { address } = useAuth();

  // Local state for the form
  const [value, setValue] = useState<number>(1);
  const [unit, setUnit] = useState<string>("hours");

  const handleCloseDialog = () => {
    if (isLoading === FETCH_STATUS.COMPLETED) {
      getVotingStatus(); // Refresh status if we finished
    }
    setIsLoading(FETCH_STATUS.INIT);
    closeDialog();
  };

  const onKickstart = async () => {
    const multipliers: { [key: string]: number } = {
      minutes: 60,
      hours: 3600,
      days: 86400,
      weeks: 604800,
    };
    const totalSeconds = value * multipliers[unit];

    console.log(totalSeconds);

    const isSuccess = await kickStartVoting(totalSeconds);
    if (!isSuccess) return;
    onSuccess();
  };

  return (
    <BaseDialog
      open={open}
      closeDialog={handleCloseDialog}
      className="w-[490px] h-[380px] bg-black border border-zinc-700 transition-all duration-200"
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
          loadingTitle="Initiating Voting"
          createdTitle="Voting is now LIVE"
          onClose={handleCloseDialog}
          btnError="Try Again"
          errorText={contractErrorText}
          initialContent={
            <>
              <h2 className="bg-custom-orange mt-1 font-bold text-xl text-black w-max px-1">
                {votingStatus?.isActive
                  ? "UPDATE SESSION TIMER"
                  : "START VOTING SESSION"}
              </h2>

              <div className="w-full mt-10 flex flex-col gap-2">
                <label className="font-bold text-base ml-3 block">
                  {" "}
                  {votingStatus?.isActive
                    ? "New Remaining Duration"
                    : "Set Duration"}
                </label>
                <div className="flex gap-2 px-3">
                  <input
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="bg-transparent border border-zinc-700 p-2 w-24 text-white outline-none focus:border-custom-orange"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-black border border-zinc-700 p-2 flex-1 text-white outline-none focus:border-custom-orange"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
                <p className="text-zinc-500 text-xs ml-3 mt-2 italic">
                  * This will open voting for all registered teams.
                </p>
                {votingStatus?.isActive && (
                  <p className="text-custom-orange text-[10px] ml-3 mt-2 italic font-bold">
                    * Note: This will overwrite the current timer. The session
                    will end exactly {value} {unit} from the moment you confirm.
                  </p>
                )}
              </div>

              <div className="w-full flex mt-12 justify-between px-2">
                <Button outline onClick={handleCloseDialog} width={100}>
                  Cancel
                </Button>
                <Button
                  onClick={onKickstart}
                  variant="secondary"
                  outline
                  width={180}
                >
                  {votingStatus?.isActive ? "Update Timer" : "Start Voting"}
                </Button>
              </div>
            </>
          }
        />
      </div>
    </BaseDialog>
  );
}

export default KickstartVotingDialog;

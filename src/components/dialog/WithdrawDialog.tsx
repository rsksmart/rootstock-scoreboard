"use client";
import BaseDialog from "./BaseDialog";
import Button from "../common/Button";
import { FETCH_STATUS, TEAM_MANAGER_ADDRESS } from "@/constants";
import { useState, useEffect } from "react";
import ContentDialog from "./ContentDialog";
import { ABI_ERC20 } from "@/utils/Abi";
import { useAuth } from "@/context/AuthContext";
import useManager from "@/hooks/useManager";
import ConnectWalletButton from "../navigation/ConnectWalletButton";
import { ethers } from "ethers";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  closeDialog: () => void;
};

function WithdrawDialog({ open, closeDialog }: Props) {
  const { isLoading, setIsLoading, contractErrorText, emergencyWithdraw, getTokenDecimals } = useManager();
  const { address, provider, isEmergencyMode } = useAuth();

  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [receiver, setReceiver] = useState<string>(address || "");
  const [amount, setAmount] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBalance = async () => {
      const cleanToken = tokenAddress.trim().toLowerCase();
      if (!ethers.isAddress(cleanToken) || !provider || !TEAM_MANAGER_ADDRESS) {
        setTokenBalance(null);
        setTokenSymbol("");
        return;
      }
      try {
        const tokenContract = new ethers.Contract(cleanToken, ABI_ERC20, provider);
        const [balance, decimals, symbol] = await Promise.all([
          tokenContract.balanceOf(TEAM_MANAGER_ADDRESS),
          tokenContract.decimals(),
          tokenContract.symbol().catch(() => "Tokens")
        ]);
        if (isMounted) {
          const formatted = ethers.formatUnits(balance, Number(decimals));
          setTokenBalance(formatted);
          setTokenSymbol(symbol);
        }
      } catch (err) {
        if (isMounted) {
          setTokenBalance("Error fetching balance");
          setTokenSymbol("");
        }
      }
    };
    fetchBalance();
    return () => { isMounted = false; };
  }, [tokenAddress, provider]);

  const handleCloseDialog = () => {
    setIsLoading(FETCH_STATUS.INIT);
    setTokenAddress("");
    setReceiver(address || "");
    setAmount("");
    setTokenBalance(null);
    setTokenSymbol("");
    setIsConfirming(false);
    closeDialog();
  };

  const handleReview = () => {
    if (!isEmergencyMode) {
      toast.error("Emergency withdrawals are only permitted during active emergency mode.");
      return;
    }

    const cleanToken = tokenAddress.trim().toLowerCase();
    const cleanReceiver = receiver.trim().toLowerCase();

    if (!ethers.isAddress(cleanToken)) {
      toast.error("Please enter a valid token address.");
      return;
    }
    if (!ethers.isAddress(cleanReceiver)) {
      toast.error("Please enter a valid receiver address.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsConfirming(true);
  };

  const handleSubmitWithdraw = async () => {
    const cleanToken = tokenAddress.trim().toLowerCase();
    const cleanReceiver = receiver.trim().toLowerCase();

    try {
      const decimals = await getTokenDecimals(cleanToken);
      const parsedAmount = ethers.parseUnits(amount, decimals).toString();
      const isSuccess = await emergencyWithdraw(cleanToken, cleanReceiver, parsedAmount);
      if (isSuccess) {
        setIsConfirming(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Invalid amount format.");
    }
  };

  return (
    <BaseDialog
      open={open}
      closeDialog={handleCloseDialog}
      className="w-[490px] h-fit min-h-[380px] pb-6 bg-black border border-zinc-700 transition-all duration-200"
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
          loadingTitle="Processing Withdrawal"
          createdTitle="Funds Successfully Withdrawn"
          onClose={handleCloseDialog}
          btnError="Try Again"
          errorText={contractErrorText}
          initialContent={
            <>
              <h2 id="dialog-title" className="bg-red-500 mt-1 font-bold text-xl text-black w-max px-2 uppercase shadow-sm">
                Emergency Withdraw
              </h2>

              {!isEmergencyMode && (
                <div className="mt-6 mx-3 p-3 bg-red-950/40 border border-red-500/50 rounded flex items-start gap-2 text-sm text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong>Action disabled:</strong> Emergency withdrawals can only be performed while the system is in Emergency Mode.</span>
                </div>
              )}

              {!isConfirming ? (
                <div className={`w-full ${isEmergencyMode ? 'mt-8' : 'mt-4'} flex flex-col gap-4 px-3`}>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-zinc-400 uppercase">
                    Token Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="bg-transparent border border-zinc-700 p-2 w-full text-white outline-none focus:border-red-500 text-sm font-mono"
                  />
                  {tokenBalance !== null && (
                    <span className="text-xs text-emerald-400 font-medium tracking-wide">
                      Contract Balance: {tokenBalance} {tokenSymbol}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-zinc-400 uppercase">
                    Receiver Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    className="bg-transparent border border-zinc-700 p-2 w-full text-white outline-none focus:border-red-500 text-sm font-mono"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-zinc-400 uppercase">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent border border-zinc-700 p-2 w-full text-white outline-none focus:border-red-500 text-sm font-mono"
                  />
                </div>

                  <p className="text-zinc-500 text-[11px] italic mt-1">
                    * Funds will be transferred directly to the receiver. This action cannot be reversed.
                  </p>
                </div>
              ) : (
                <div className={`w-full ${isEmergencyMode ? 'mt-8' : 'mt-4'} flex flex-col gap-4 px-3`}>
                  <div className="bg-zinc-900 border border-zinc-700 rounded p-4 flex flex-col gap-3">
                    <h3 className="text-white font-bold text-lg mb-2">Review Withdrawal</h3>

                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-400 text-xs uppercase font-bold">Token Address</span>
                      <span className="text-white text-sm font-mono bg-black p-2 rounded border border-zinc-800 break-all">{tokenAddress}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-400 text-xs uppercase font-bold">Receiver Address</span>
                      <span className="text-white text-sm font-mono bg-black p-2 rounded border border-zinc-800 break-all">{receiver}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-400 text-xs uppercase font-bold">Amount</span>
                      <span className="text-red-400 text-lg font-bold bg-black p-2 rounded border border-zinc-800">
                        {amount} {tokenSymbol}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-950/40 border border-yellow-500/50 rounded flex items-start gap-2 text-sm text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span><strong>Please confirm:</strong> This transaction is irreversible. The tokens will be permanently transferred to the specified receiver.</span>
                  </div>
                </div>
              )}

              <div className="w-full flex mt-6 justify-between px-2">
                {!isConfirming ? (
                  <>
                    <Button outline onClick={handleCloseDialog} width={100} ariaLabel="Cancel and close dialog">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReview}
                      variant="primary"
                      className={!isEmergencyMode ? 'opacity-50 cursor-not-allowed' : ''}
                      disabled={!isEmergencyMode}
                      width={200}
                    >
                      Review Withdraw
                    </Button>
                  </>
                ) : (
                  <>
                    <Button outline onClick={() => setIsConfirming(false)} width={100} ariaLabel="Back to edit">
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitWithdraw}
                      variant="primary"
                      width={200}
                    >
                      Confirm Transaction
                    </Button>
                  </>
                )}
              </div>
            </>
          }
        />
      </div>
    </BaseDialog>
  );
}

export default WithdrawDialog;

import BaseDialog from './BaseDialog';
import Button from '../common/Button';
import { ReactNode } from 'react';

type AdminActionConfirmProps = {
  open: boolean;
  title: string;
  action: string;
  consequences: string[];
  requiresRole: string;
  isReversible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export default function AdminActionConfirm({
  open,
  title,
  action,
  consequences,
  requiresRole,
  isReversible,
  onConfirm,
  onCancel,
  children,
}: AdminActionConfirmProps) {
  return (
    <BaseDialog open={open} closeDialog={onCancel} className="w-full max-w-[490px] h-auto mx-4 sm:mx-0 bg-black border border-zinc-700">
      <div className="w-full h-full flex flex-col py-2">
        {/* Title */}
        <h2 className="bg-custom-orange font-bold text-lg sm:text-xl text-black w-max px-1 mb-4">
          {title}
        </h2>

        {/* Action Description */}
        <div className="w-full mb-4">
          <div className="w-full flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-800 pb-3">
            <span className="font-semibold text-sm sm:text-base text-zinc-500">Action:</span>
            <span className="text-sm sm:text-base text-white break-words">{action}</span>
          </div>
        </div>

        {/* Children (for role selector, etc) */}
        {children}

        {/* Consequences */}
        <div className="w-full mb-4">
          <div className="border-l-2 border-red-500 pl-3 py-2">
            <p className="font-semibold text-sm sm:text-base text-red-400 mb-2">
              Consequences:
            </p>
            <ul className="space-y-1">
              {consequences.map((consequence, index) => (
                <li key={index} className="text-xs sm:text-sm text-zinc-300">
                  • {consequence}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reversibility & Info */}
        <div className="w-full space-y-2 mb-4">
          {!isReversible && (
            <div className="w-full flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-custom-orange/20 pb-2">
              <span className="font-semibold text-xs sm:text-sm text-custom-orange">⚠️ Irreversible:</span>
              <span className="text-xs sm:text-sm text-zinc-400">This action cannot be undone</span>
            </div>
          )}
          <div className="w-full flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-custom-green/20 pb-2">
            <span className="font-semibold text-xs sm:text-sm text-zinc-500">Required Role:</span>
            <span className="text-xs sm:text-sm text-custom-green font-semibold">{requiresRole}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-row justify-between gap-2 px-1 sm:px-0">
          <Button
            onClick={onCancel}
            outline
            width={140}
            className="flex-1 sm:flex-none sm:w-[140px]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="secondary"
            outline
            width={140}
            className="flex-1 sm:flex-none sm:w-[140px]"
          >
            Confirm
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

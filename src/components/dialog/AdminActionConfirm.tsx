import BaseDialog from './BaseDialog';
import Button from '../common/Button';

type AdminActionConfirmProps = {
  open: boolean;
  title: string;
  action: string;
  consequences: string[];
  requiresRole: string;
  isReversible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
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
}: AdminActionConfirmProps) {
  return (
    <BaseDialog open={open} closeDialog={onCancel} className="w-full max-w-[520px] h-auto mx-4 sm:mx-0">
      <div className="flex flex-col gap-6 pt-2">
        {/* Title */}
        <div>
          <h2 className="bg-custom-orange font-bold text-lg sm:text-xl text-black w-max px-2 py-1 mb-2">
            {title}
          </h2>
          <p className="text-sm text-zinc-400">
            Required Role: <span className="text-custom-green font-semibold">{requiresRole}</span>
          </p>
        </div>

        {/* Action Description */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Action:</h3>
          <p className="text-sm text-zinc-300">{action}</p>
        </div>

        {/* Consequences */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>Consequences:</span>
          </h3>
          <ul className="space-y-2">
            {consequences.map((consequence, index) => (
              <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{consequence}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reversibility Warning */}
        {!isReversible && (
          <div className="bg-custom-orange/10 border border-custom-orange/30 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-custom-orange font-semibold">
              ⚠️ This action cannot be undone. Proceed with caution.
            </p>
          </div>
        )}

        {/* Transparency Note */}
        <div className="bg-custom-green/10 border border-custom-green/30 rounded-lg p-3">
          <p className="text-xs text-zinc-400">
            ℹ️ All admin actions are permanently recorded on-chain and publicly visible in the Admin Activity Log.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onCancel}
            outline
            width={0}
            className="w-full sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="secondary"
            outline
            width={0}
            className="w-full sm:flex-1 bg-custom-orange hover:bg-custom-orange/80 border-custom-orange text-black font-bold"
          >
            Confirm Action
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

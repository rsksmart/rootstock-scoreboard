import BaseDialog from './BaseDialog';
import Button from '../common/Button';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <BaseDialog open={open} closeDialog={onCancel} className="w-full max-w-[420px] h-auto mx-4 sm:mx-0">
      <div className="flex flex-col gap-6 pt-2">
        {/* Title */}
        <div>
          <h2 className={`${danger ? 'bg-red-500' : 'bg-custom-green'} font-bold text-lg sm:text-xl text-black w-max px-2 py-1`}>
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          {message}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onCancel}
            outline
            width={0}
            className="w-full sm:flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="secondary"
            outline
            width={0}
            className={`w-full sm:flex-1 ${danger ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

import React, { useState } from 'react';
import BaseDialog from './BaseDialog';
import Button from '../common/Button';
import Input from '../common/Input';

type TypedConfirmDialogProps = {
  open: boolean;
  title: string;
  action: string;
  consequences: string[];
  confirmText: string; // Text user must type to confirm
  onConfirm: () => void;
  onCancel: () => void;
};

export default function TypedConfirmDialog({
  open,
  title,
  action,
  consequences,
  confirmText,
  onConfirm,
  onCancel,
}: TypedConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (inputValue !== confirmText) {
      setError(`You must type "${confirmText}" to confirm`);
      return;
    }

    setInputValue('');
    setError('');
    onConfirm();
  };

  const handleCancel = () => {
    setInputValue('');
    setError('');
    onCancel();
  };

  return (
    <BaseDialog open={open} closeDialog={handleCancel} className="w-full max-w-[480px] h-auto mx-4 sm:mx-0 bg-black border-2 border-red-500">
      <div className="w-full h-full flex flex-col py-2">
        {/* Title */}
        <h2 className="bg-red-500 font-bold text-base sm:text-lg text-white w-max px-1 mb-3">
          {title}
        </h2>

        {/* Compact Warning */}
        <div className="w-full mb-3 border-l-2 border-red-500 pl-3 bg-red-500/5 py-2">
          <p className="text-red-400 text-xs sm:text-sm">
            <span className="font-bold">PERMANENT</span> action - Cannot be undone
          </p>
        </div>

        {/* Consequences */}
        <div className="w-full mb-3">
          <ul className="space-y-0.5 text-xs text-zinc-300">
            {consequences.map((consequence, index) => (
              <li key={index}>• {consequence}</li>
            ))}
          </ul>
        </div>

        {/* Typed Confirmation */}
        <div className="w-full mb-3">
          <label className="block text-xs font-semibold text-red-400 mb-1.5">
            Type <span className="font-mono bg-red-500/20 px-1.5 py-0.5 rounded text-xs">{confirmText}</span>:
          </label>
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            placeholder={`Type "${confirmText}"`}
            height={32}
            className="border-red-500 focus:ring-red-500"
          />
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="w-full flex flex-row justify-between gap-2 px-1 sm:px-0">
          <Button
            onClick={handleCancel}
            outline
            width={120}
            className="flex-1 sm:flex-none sm:w-[120px] text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none sm:w-[120px] bg-red-600 hover:bg-red-700 border-red-600 text-sm"
            width={120}
            disabled={inputValue !== confirmText}
          >
            Confirm
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

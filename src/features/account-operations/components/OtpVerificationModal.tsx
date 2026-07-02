import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface OtpVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<void>;
  isVerifying: boolean;
  error?: string | null;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  open,
  onOpenChange,
  onVerify,
  isVerifying,
  error
}) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length > 0) {
      onVerify(code.trim());
    }
  };

  React.useEffect(() => {
    if (open) {
      setCode('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Подтверждение экспорта</DialogTitle>
          <DialogDescription>
            Введите код подтверждения из SMS, отправленного на ваш номер.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="otp-code" className="text-sm font-medium">Код подтверждения</label>
            <Input
              id="otp-code"
              type="text"
              placeholder="Введите код..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              disabled={isVerifying}
              autoFocus
              className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isVerifying}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isVerifying || !code.trim()}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Проверка...
                </>
              ) : (
                "Подтвердить"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

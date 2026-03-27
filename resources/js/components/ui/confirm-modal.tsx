import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle} from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />,
          buttonVariant: 'destructive' as const,
          iconBg: 'bg-red-100 dark:bg-red-900/20',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
          buttonVariant: 'default' as const,
          iconBg: 'bg-orange-100 dark:bg-orange-900/20',
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />,
          buttonVariant: 'default' as const,
          iconBg: 'bg-green-100 dark:bg-green-900/20',
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
          buttonVariant: 'default' as const,
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div>
              <DialogTitle className="text-left">{title}</DialogTitle>
              <DialogDescription className="text-left mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.buttonVariant}
            onClick={onConfirm}
            disabled={loading}
            color={variant === 'success' ? 'green' : variant === 'default' ? 'blue' : undefined}
            className={variant === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Procesando...
              </>
            ) : (
              <>
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

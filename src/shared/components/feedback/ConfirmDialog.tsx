import Modal from '@/shared/components/feedback/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Modal
    open={open}
    title={title}
    description={description}
    onClose={onClose}
    footer={
      <>
        <button
          type="button"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-sm text-slate-600">{description}</p>
  </Modal>
);

export default ConfirmDialog;

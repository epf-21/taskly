import { Modal } from "./modal";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

interface Props {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onAccept: () => void | Promise<void>;
  acceptLabel?: string;
}

export const ModalDelete = ({
  open,
  title,
  description,
  onClose,
  onAccept,
  acceptLabel = "Delete",
}: Props) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
            <AlertTriangle size={20} />
          </span>
          <p className="text-sm leading-6 text-taskly-muted">{description}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isAccepting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => void handleAccept()}
            disabled={isAccepting}
          >
            {isAccepting ? "Deleting..." : acceptLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

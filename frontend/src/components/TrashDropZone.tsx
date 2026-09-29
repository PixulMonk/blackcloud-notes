import { useDroppable } from "@dnd-kit/react";
import { Trash2 } from "lucide-react";

import { Button } from "./ui/button";
import { useAppStoreActions } from "@/store/useAppStore";

const TrashDropZone = () => {
  const { ref } = useDroppable({
    id: "trash",
  });

  const { setActiveView } = useAppStoreActions();

  return (
    <Button
      ref={ref}
      variant="ghost"
      className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
      onClick={() => setActiveView({ type: "trash" })}
    >
      <Trash2 className="size-4 opacity-70" />
      <span>Trash</span>
    </Button>
  );
};

export default TrashDropZone;

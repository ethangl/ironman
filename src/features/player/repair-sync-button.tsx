import { MetronomeIcon } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import { useRooms } from "@/features/rooms";

export const RepairSyncButton: FC = () => {
  const { repairSync } = useRooms();
  return (
    <Button variant="overlay" size="icon-sm" onClick={repairSync}>
      <MetronomeIcon />
    </Button>
  );
};

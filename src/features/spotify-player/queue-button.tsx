import { ListMusicIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function QueueButton() {
  return (
    <Button variant="overlay" size="icon">
      <ListMusicIcon />
    </Button>
  );
}

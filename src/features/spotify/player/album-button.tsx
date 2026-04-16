import { Button } from "@/components/ui/button";
import { AudioLinesIcon } from "lucide-react";

export function AlbumButton() {
  return (
    <Button variant="overlay" size="icon">
      <AudioLinesIcon />
    </Button>
  );
}

import { useState } from "react";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquareIcon, PanelRightCloseIcon } from "lucide-react";
import { useRooms } from "../runtime/rooms-provider";

export function RoomCreateForm() {
  const { createRoom } = useRooms();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const createdRoomId = await createRoom({
        name,
        description,
      });
      if (!createdRoomId) {
        return;
      }

      setName("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sidebar bgClassName="dark:bg-cyan-400/50" className="text-cyan-300">
      <Section className="flex flex-none gap-2 h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="mr-auto"
          onClick={() => setIsChatExpanded((expanded) => !expanded)}
        >
          {isChatExpanded ? <PanelRightCloseIcon /> : <MessageSquareIcon />}
        </Button>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Start a Room</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              name="room-name"
              value={name}
              onValueChange={setName}
              placeholder="Weekend warmup"
              className="h-11 bg-white/10"
            />
            <Input
              name="room-description"
              value={description}
              onValueChange={setDescription}
              placeholder="What kind of room is this?"
              className="h-11 bg-white/10"
            />
            <Button
              type="submit"
              size="lg"
              disabled={submitting || !name.trim()}
            >
              {submitting ? "Opening room..." : "Create room"}
            </Button>
          </form>
        </SectionContent>
      </Section>
    </Sidebar>
  );
}

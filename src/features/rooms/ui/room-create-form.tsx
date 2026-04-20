import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRooms } from "../runtime/rooms-provider";

export function RoomCreateForm() {
  const navigate = useNavigate();
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
      const roomId = await createRoom({
        name,
        description,
      });
      if (!roomId) {
        return;
      }

      setName("");
      setDescription("");
      navigate(`/rooms/${roomId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
          <Button type="submit" size="lg" disabled={submitting || !name.trim()}>
            {submitting ? "Opening room..." : "Create room"}
          </Button>
        </form>
      </SectionContent>
    </Section>
  );
}

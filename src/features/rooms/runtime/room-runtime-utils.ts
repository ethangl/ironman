import { toast } from "sonner";

export function normalizeRoomErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong.";
}

export function reportRoomError(error: unknown) {
  toast.error(normalizeRoomErrorMessage(error));
}

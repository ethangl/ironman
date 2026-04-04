import { useCopyToClipboard } from "usehooks-ts";
import { useCallback } from "react";
import { toast } from "sonner";

export function useCopy() {
  const [, copy] = useCopyToClipboard();

  const copyWithToast = useCallback(
    async (text: string) => {
      const ok = await copy(text);
      if (ok) {
        toast.success("Copied to clipboard", { description: text });
      } else {
        toast.error("Failed to copy to clipboard");
      }
    },
    [copy],
  );

  return copyWithToast;
}

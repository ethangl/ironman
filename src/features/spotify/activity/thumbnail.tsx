import { PlayIcon } from "lucide-react";
import { ComponentProps, FC, KeyboardEvent } from "react";

import { AlbumArt } from "@/components/album-art";
import { cn } from "@/lib/utils";

type ThumbnailProps = ComponentProps<"div"> & {
  description?: string;
  handlePlay?: () => void;
  name: string;
  src: string | null;
};

export const Thumbnail: FC<ThumbnailProps> = ({
  className,
  name,
  description,
  src,
  handlePlay,
  onClick,
  onKeyDown,
  ...props
}) => {
  const isPlayable = typeof handlePlay === "function";

  const runClick = () => {
    handlePlay?.();
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isPlayable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      runClick();
    }
  };

  return (
    <div
      className={cn(
        "group flex-none select-none rounded-xl bg-accent/15 p-3",
        isPlayable && "cursor-pointer transition hover:bg-accent/25",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlayable) return;
        runClick();
      }}
      onKeyDown={handleKeyPress}
      role={isPlayable ? "button" : undefined}
      tabIndex={isPlayable ? 0 : undefined}
      {...props}
    >
      <div className="relative">
        <AlbumArt src={src} className="size-32" />
        {isPlayable ? (
          <div className="pointer-events-none absolute inset-0 z-10 m-auto rounded-2xl bg-black/50 opacity-0 transition-all group-hover:bg-black/75 group-hover:opacity-100">
            <PlayIcon
              fill="currentColor"
              strokeWidth={0}
              className="absolute inset-0 m-auto size-10 text-white"
            />
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex max-w-32 items-center gap-2">
        <div className="min-w-0 space-y-px truncate">
          <h3 className="truncate text-xs">{name}</h3>
          {description ? (
            <h5 className="truncate text-[10px] text-muted-foreground">
              {description}
            </h5>
          ) : null}
        </div>
      </div>
    </div>
  );
};

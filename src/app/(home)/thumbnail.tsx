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
        "group bg-accent/15 flex-none p-3 rounded-xl select-none",
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
          <div className="absolute bg-black/50 group-hover:bg-black/75 inset-0 m-auto opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-all z-10">
            <PlayIcon
              fill="currentColor"
              strokeWidth={0}
              className="absolute inset-0 m-auto size-10 text-white"
            />
          </div>
        ) : null}
      </div>
      <div className="flex gap-2 items-center mt-2 max-w-32">
        <div className="min-w-0 space-y-px truncate">
          <h3 className="text-xs truncate">{name}</h3>
          {description && (
            <h5 className="text-muted-foreground text-[10px] truncate">
              {description}
            </h5>
          )}
        </div>
      </div>
    </div>
  );
};

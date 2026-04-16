import { PlayIcon } from "lucide-react";
import { ComponentProps, FC, KeyboardEvent } from "react";

import { AlbumArt } from "@/components/album-art";
import { cn } from "@/lib/utils";
import { BackgroundOverlay } from "../../../components/background-overlay";

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
  const nameLength = Math.max(1, name.replace(/\s+/g, "").length);
  const nameFontSize =
    nameLength <= 4
      ? 132
      : nameLength <= 6
        ? 132 - (nameLength - 4) * 18
        : nameLength === 7
          ? 72
          : Math.max(44, 72 - (nameLength - 7) * 16);

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
        "group flex-none relative select-none",
        isPlayable && "cursor-pointer",
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
      <BackgroundOverlay className="bg-black! mix-blend-plus-darker opacity-15 group-hover:opacity-30" />
      <div className="relative">
        <AlbumArt
          src={src}
          className="duration-555 size-40 group-hover:shadow-black/80"
        />
        <div className="absolute duration-555 inset-0 pointer-events-none rounded-xl transition-[backdrop-filter] group-hover:backdrop-brightness-15 group-hover:backdrop-invert-10 z-10">
          {isPlayable ? (
            <PlayIcon
              fill="currentColor"
              strokeWidth={0}
              className="absolute inset-0 m-auto size-10 text-white"
            />
          ) : (
            <div
              style={{ fontSize: `${nameFontSize}px` }}
              className="absolute duration-555 font-display font-extralight font-stretch-[25%] leading-[0.9] left-1/2 opacity-0 group-hover:opacity-100 text-center text-pretty top-1/2 -tracking-[0.015em] -translate-x-1/2 -translate-y-1/2 uppercase w-[90%]"
            >
              {name}
            </div>
          )}
        </div>
      </div>
      {isPlayable && (
        <div className="flex max-w-40 mix-blend-plus-lighter items-center gap-2 px-3 py-2">
          <div className="min-w-0 space-y-px truncate text-white">
            <h3 className="font-medium opacity-90 truncate text-sm">{name}</h3>
            {description ? (
              <h5 className="font-bold opacity-40 text-[11px] truncate">
                {description}
              </h5>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

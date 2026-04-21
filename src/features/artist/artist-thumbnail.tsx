import { PlayIcon } from "lucide-react";
import { ComponentProps, FC, KeyboardEvent } from "react";

import { AlbumArt } from "@/components/album-art";
import { BackgroundOverlay } from "@/components/background-overlay";
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
        "group flex-none relative select-none w-48",
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
          className="duration-555 group-hover:shadow-black/80 size-full"
        />
        <div className="absolute group-hover:backdrop-blur-2xl duration-333 ease-out inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-all z-10">
          <div className="absolute flex items-center justify-center left-1/2 text-white top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%]">
            {isPlayable ? (
              <PlayIcon
                fill="currentColor"
                strokeWidth={0}
                className="size-20"
              />
            ) : (
              <span
                style={{ fontSize: `${nameFontSize}px` }}
                className="font-display font-extralight font-stretch-[25%] leading-[0.9] text-center text-pretty -tracking-[0.015em] uppercase"
              >
                {name}
              </span>
            )}
          </div>
        </div>
      </div>
      {isPlayable && (
        <div className="mix-blend-plus-lighter px-3 py-2.5 space-y-px truncate text-white w-full">
          <h3 className="font-medium opacity-90 text-sm truncate">{name}</h3>
          {description ? (
            <h5 className="font-bold opacity-40 text-[11px] truncate">
              {description}
            </h5>
          ) : null}
        </div>
      )}
    </div>
  );
};

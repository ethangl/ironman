import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

export type AlbumArtProps = ComponentProps<"div"> & { src: string | null };

export const AlbumArt: FC<AlbumArtProps> = ({ className, children, src }) => {
  return (
    <div
      className={cn(
        "aspect-square bg-palette-2 flex font-bold items-center justify-center overflow-hidden relative rounded-2xl shadow-lg shadow-black/25 size-8 text-palette-4",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="absolute block object-cover size-full"
        />
      ) : (
        "?"
      )}
      {children}
    </div>
  );
};

"use client";

import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

export type AlbumArtProps = ComponentProps<"div"> & { src: string | null };

export const AlbumArt: FC<AlbumArtProps> = ({ className, src, ...props }) => {
  return (
    <div
      className={cn(
        "bg-palette-2 flex font-bold items-center justify-center overflow-hidden relative rounded-2xl shadow-md shadow-black/25 size-8 text-palette-4",
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute block object-cover" />
      ) : (
        "?"
      )}
    </div>
  );
};

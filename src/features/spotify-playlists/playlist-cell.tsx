import { FC, PropsWithChildren, ReactNode } from "react";

import { AlbumArt } from "@/components/album-art";

export type PlaylistCellProps = PropsWithChildren & {
  count?: number;
  image?: string | null;
  name: string;
  subtitle?: ReactNode;
};

export const PlaylistCell: FC<PlaylistCellProps> = ({
  children,
  count,
  image,
  name,
  subtitle,
}) => (
  <>
    <div className="flex gap-2 items-center">
      {count && (
        <div className="bg-black/25 font-bold flex items-center justify-center rounded-3xl text-xs size-8">
          {count}
        </div>
      )}
      {image ? <AlbumArt src={image} className="size-10" /> : null}
    </div>
    <div className="space-y-0.5">
      <h3 className="font-medium text-sm truncate">{name}</h3>
      {subtitle && (
        <h5 className="text-muted-foreground text-xs truncate">{subtitle}</h5>
      )}
    </div>
    <div className="flex gap-2 items-center">{children}</div>
  </>
);

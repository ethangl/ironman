import { CSSProperties, FC } from "react";

import { cn } from "@/lib/utils";

export type AvatarProps = {
  id?: string;
  image: string | null;
  name: string | null;
  sizeClassName?: string;
};

export const Avatar: FC<AvatarProps> = ({
  id = "undefined",
  image,
  name,
  sizeClassName = "size-16 text-7xl",
}) => {
  const normalizedName = name || "anonymous";

  let hash = 0;

  for (const ch of id) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;

  const hue = ((hash % 360) + 360) % 360;

  return (
    <div
      className={cn(
        "bg-(--user-color)/10 flex flex-none items-center justify-center rounded-full text-(--user-color)",
        sizeClassName,
      )}
      style={{ "--user-color": `oklch(0.98 0.4 ${hue})` } as CSSProperties}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={normalizedName}
          className={cn("rounded-full", sizeClassName)}
        />
      ) : (
        <span
          className={cn(
            "block font-decorative size-auto! -ml-[0.05em] mt-[0.05em] uppercase",
            sizeClassName,
          )}
        >
          {normalizedName[0]}
        </span>
      )}
    </div>
  );
};

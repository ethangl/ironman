import { FC, PropsWithChildren } from "react";
import { Shader, Swirl } from "shaders/react";

import { cn } from "@/lib/utils";
import { useNowPlaying } from "./use-now-playing";

export const PlayerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { displayImage, isPlaying, palette } = useNowPlaying();

  return (
    <section
      className={cn(
        "flex overflow-hidden relative rounded-3xl select-none transition-all",
        isPlaying
          ? "duration-888 ease-elastic h-16 opacity-100"
          : "duration-333 ease-out h-0 opacity-0 pointer-events-none",
      )}
    >
      <div className="absolute pointer-events-none inset-0 overflow-hidden z-0">
        <Shader className="relative size-full">
          <Swirl
            blendMode="normal-oklch"
            colorA={palette[0]}
            colorB={palette[2]}
            colorSpace="oklch"
            detail={0.5}
            speed={0.5}
          />
        </Shader>
        {displayImage && (
          <img
            src={displayImage}
            alt=""
            className="absolute blur-md mix-blend-overlay object-cover opacity-40 scale-200 size-full -translate-y-[25%]"
          />
        )}
      </div>
      {children}
    </section>
  );
};

"use client";

import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";
import { ComponentProps as SwirlProps } from "shaders/core/Swirl";
import { FilmGrain, Shader, Swirl } from "shaders/react";
import { useNowPlaying } from "./use-now-playing";

export type PlayerWrapperProps = ComponentProps<"section"> & {
  fullScreen?: boolean;
  shaderProps?: Omit<SwirlProps, "colorSpace" | "blend">;
  toggled: boolean;
};

export const PlayerWrapper: FC<PlayerWrapperProps> = ({
  children,
  className,
  fullScreen = false,
  shaderProps,
  toggled,
  ...props
}) => {
  const { isPlaying } = useNowPlaying();

  return (
    <section
      className={cn(
        "fixed backdrop-blur-lg backdrop-brightness-200 backdrop-saturate-150 duration-888 inset-2 max-w-md mx-auto overflow-auto p-1 rounded-4xl select-none shadow-xl text-black dark:text-white transition top-auto z-50",
        toggled && isPlaying
          ? "duration-888 ease-elastic opacity-100 scale-100 translate-y-0"
          : "duration-333 ease-out opacity-0 pointer-events-none scale-90 translate-y-[125%]",
        fullScreen && "inset-0 max-w-auto p-0 rounded-none",
        className,
      )}
      {...props}
    >
      <div className="relative h-full w-full">
        <div className="absolute pointer-events-none inset-0 overflow-hidden opacity-80 rounded-3xl z-0">
          <Shader className="h-full w-full">
            <FilmGrain strength={0.07}>
              <Swirl colorSpace="oklch" {...shaderProps} />
            </FilmGrain>
          </Shader>
        </div>
        {children}
      </div>
    </section>
  );
};

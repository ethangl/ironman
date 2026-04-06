"use client";

import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";
import { ComponentProps as SwirlProps } from "shaders/core/Swirl";
import { FilmGrain, Shader, Swirl } from "shaders/react";

export type PlayerWrapperProps = ComponentProps<"section"> & {
  shaderProps?: Omit<SwirlProps, "colorSpace" | "blend">;
  toggled: boolean;
  untoggledClassname?: string;
};

export const PlayerWrapper: FC<PlayerWrapperProps> = ({
  children,
  className,
  shaderProps,
  toggled,
  untoggledClassname = "translate-y-[200%]",
  ...props
}) => (
  <section
    className={cn(
      "fixed backdrop-blur-md backdrop-brightness-400 backdrop-saturate-200 inset-2 max-w-md mx-auto overflow-auto p-1 rounded-4xl select-none shadow-xl text-black dark:text-white transition top-auto z-50",
      !toggled && untoggledClassname,
      className,
    )}
    {...props}
  >
    <div className="relative">
      <div className="absolute pointer-events-none inset-0 overflow-hidden opacity-90 rounded-3xl z-0">
        <Shader className="h-full w-full">
          <FilmGrain strength={0.075}>
            <Swirl colorSpace="oklch" {...shaderProps} />
          </FilmGrain>
        </Shader>
      </div>
      {children}
    </div>
  </section>
);

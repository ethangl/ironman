import { ComponentProps, FC } from "react";
import { FilmGrain, Shader, Swirl } from "shaders/react";

import { cn } from "@/lib/utils";
import { useNowPlaying } from "./use-now-playing";

export type PlayerWrapperProps = ComponentProps<"section"> & {
  fullScreen?: boolean;
  toggled: boolean;
};

export const PlayerWrapper: FC<PlayerWrapperProps> = ({
  children,
  className,
  fullScreen = false,
  toggled,
  ...props
}) => {
  const { displayImage, isPlaying, palette } = useNowPlaying();

  return (
    <section
      className={cn(
        "fixed backdrop-blur-md backdrop-brightness-200 backdrop-saturate-150 duration-888 inset-3 max-w-sm mx-auto overflow-auto p-1 rounded-4xl select-none shadow-2xl text-white transition top-auto z-50",
        toggled && isPlaying
          ? "duration-888 ease-elastic opacity-100 scale-100 translate-y-0"
          : "duration-333 ease-out opacity-0 pointer-events-none scale-90 translate-y-[125%]",
        fullScreen && "inset-0 max-w-auto p-0 rounded-none",
        className,
      )}
      {...props}
    >
      <div className="relative h-full w-full">
        <div className="absolute pointer-events-none inset-0 overflow-hidden rounded-3xl z-0">
          <Shader className="relative size-full">
            <Swirl
              blendMode="normal-oklch"
              colorA={palette[0]}
              colorB={palette[1]}
              colorSpace="oklch"
              detail={0.75}
              speed={0.2}
            />
            <FilmGrain strength={0.08} />
          </Shader>{" "}
          {displayImage && (
            <img
              src={displayImage}
              alt=""
              className="absolute blur-md mix-blend-overlay object-cover opacity-40 scale-200 size-full -translate-y-[25%]"
            />
          )}
        </div>
        {children}
      </div>
    </section>
  );
};

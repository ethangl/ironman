"use client";

import { LockIcon, LockOpenIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const LockInButton: FC<ButtonProps> = ({ ...props }) => {
  const { count, streak, lockIn, surrender } = useNowPlaying();

  return (
    <Button
      variant="secondary"
      size="sm"
      className="group bg-white/10 hover:bg-white/5 gap-2 min-w-8 px-2"
      onClick={streak?.active ? surrender : lockIn}
      data-streak-active={!!streak?.active}
      {...props}
    >
      {streak?.active ? (
        <>
          <LockIcon className="group-hover:hidden" />
          <LockOpenIcon className="hidden group-hover:block" />
          <span className="font-bold text-sm tracking-tighter">
            <span className="tabular-nums">{count}</span>
            <span className="ml-px opacity-50">x</span>
          </span>
        </>
      ) : (
        <>
          <LockOpenIcon className="group-hover:hidden" />
          <LockIcon className="hidden group-hover:block" />
        </>
      )}
    </Button>
  );
};

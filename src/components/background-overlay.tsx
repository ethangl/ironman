import { FC } from "react";

export const BackgroundOverlay: FC = () => (
  <div className="absolute backdrop-brightness-600 backdrop-contrast-600 bg-section-color/50 duration-555 inset-0 mix-blend-exclusion opacity-25 rounded-[inherit] -z-1" />
);

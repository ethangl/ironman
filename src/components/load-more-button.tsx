import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EllipsisIcon } from "lucide-react";

export type LoadMoreButtonProps = ButtonProps & { loading: boolean };

export const LoadMoreButton: FC<ButtonProps & { loading: boolean }> = ({
  loading,
  ...props
}) => (
  <Button variant="secondary" {...props} className="w-full rounded-xl">
    {loading ? <Spinner /> : <EllipsisIcon />}
  </Button>
);

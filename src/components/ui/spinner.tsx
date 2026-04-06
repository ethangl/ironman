import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-mist-500 border-t-white",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };

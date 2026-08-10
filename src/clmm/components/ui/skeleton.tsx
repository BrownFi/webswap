import { cn } from "@clmm/utils/common/cn";

/* Shimmer skeleton: a faint base with a soft gradient sweeping across it — smoother
 * than a plain opacity pulse. Callers can override the base bg/size via className. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("relative overflow-hidden rounded-md bg-white/[0.04]", className)} {...props}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>
    );
}

export { Skeleton };

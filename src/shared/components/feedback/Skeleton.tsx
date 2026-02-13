import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/60',
      className,
    )}
    aria-hidden="true"
  />
);

export default Skeleton;

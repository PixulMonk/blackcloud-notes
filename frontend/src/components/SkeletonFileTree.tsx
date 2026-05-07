import { Skeleton } from '@/components/ui/skeleton';

const items = [
  { level: 0, width: 'w-1/2', folder: true },
  { level: 1, width: 'w-2/3' },
  { level: 1, width: 'w-1/2' },
  { level: 0, width: 'w-2/3', folder: true },
  { level: 0, width: 'w-3/4' },
  { level: 2, width: 'w-1/3' },
];

function SkeletonFileTree() {
  return (
    <div className="flex w-full flex-col gap-2 px-3 py-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2"
          style={{ paddingLeft: `${item.level * 16}px` }}
        >
          <Skeleton
            className={
              item.folder
                ? 'h-4 w-4 rounded-md animate-pulse'
                : 'h-3.5 w-3.5 rounded-sm animate-pulse'
            }
          />

          <Skeleton className={`h-3 ${item.width} rounded animate-pulse`} />
        </div>
      ))}
    </div>
  );
}

export default SkeletonFileTree;

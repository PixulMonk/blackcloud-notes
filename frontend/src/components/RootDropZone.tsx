import { useDroppable } from '@dnd-kit/react';

function RootDropZone() {
  const { ref, isDropTarget } = useDroppable({ id: 'root' });

  return (
    <div
      ref={ref}
      className={`flex-1 min-h-[100px] w-full transition-colors rounded-md ${
        isDropTarget ? 'bg-accent/20' : ''
      }`}
    />
  );
}

export default RootDropZone;

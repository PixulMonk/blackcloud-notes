import { useDataStore } from '@/store/useDataStore';

const SyncingIndicator = () => {
  const isSyncing = useDataStore((state) => state.isSyncing);
  return (
    <div className="mx-4 my-0 text-right">
      <p
        className={`text-muted-foreground text-sm ${isSyncing ? 'visible animate-pulse' : 'invisible'}`}
      >
        Syncing...
      </p>
    </div>
  );
};

export default SyncingIndicator;

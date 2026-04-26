import { useData } from '@/store/useDataStore';

const SyncingIndicator = () => {
  const { isSyncing } = useData();
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

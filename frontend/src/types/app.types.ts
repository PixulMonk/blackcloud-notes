export type AppView =
  | { type: 'editor' }
  | { type: 'trash' }
  | { type: 'archived' }
  | { type: 'settings' };
// Add new types along with renderView function at HomePage.tsx

export interface AppState {
  activeView: AppView | null;
  actions: AppStateActions;
}

export interface AppStateActions {
  setActiveView: (view: AppView | null) => void;
}

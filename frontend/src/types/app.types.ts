export type AppView =
  | { type: 'empty' }
  | { type: 'editor' }
  | { type: 'trash' }
  | { type: 'archived' }
  | { type: 'settings' };
// Add new types along with renderView function at HomePage.tsx

export interface AppState {
  activeView: AppView;
  actions: AppStateActions;
}

export interface AppStateActions {
  setActiveView: (view: AppView) => void;
}

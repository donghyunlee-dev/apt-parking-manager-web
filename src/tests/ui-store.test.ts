import { describe, expect, it } from 'vitest';
import useUiStore from '@/shared/store/uiStore';

describe('ui store', () => {
  it('toggles sidebar', () => {
    const initial = useUiStore.getState().sidebarOpen;
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(!initial);
  });

  it('opens and closes modal', () => {
    useUiStore.getState().openModal('test', { id: 1 });
    expect(useUiStore.getState().modalState.open).toBe(true);
    useUiStore.getState().closeModal();
    expect(useUiStore.getState().modalState.open).toBe(false);
  });
});

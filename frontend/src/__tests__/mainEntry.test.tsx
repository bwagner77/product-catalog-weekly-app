import { describe, it, expect } from 'vitest';
import { act } from 'react-dom/test-utils';

// Ensure a root div exists before importing main.tsx (side-effect render)
describe('main.tsx entrypoint', () => {
  it('initializes React root without throwing', async () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    let mod: any;
    await act(async () => {
      mod = await import('../main');
    });
    expect(mod).toBeTruthy();
    // Assert a child node (React attaches comment + div or similar)
    expect(root.childNodes.length).toBeGreaterThan(0);
  });
});

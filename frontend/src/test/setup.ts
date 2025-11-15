// Vitest + RTL setup: use official jest-dom integration for Vitest and cleanup between tests
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

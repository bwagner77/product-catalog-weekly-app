// Vitest + RTL setup: use official jest-dom integration for Vitest and cleanup between tests
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// Global fetch mock: provide stable product/category responses to eliminate network errors in tests
// Only mock if not already mocked to allow per-test overrides.
if (!(globalThis as any).__shoplyFetchMockInstalled) {
	(globalThis as any).__shoplyFetchMockInstalled = true;
	const sampleProducts = Array.from({ length: 5 }).map((_, i) => ({
		id: `prod-${i + 1}`,
		name: `Product ${i + 1}`,
		description: `Sample product ${i + 1} description`,
		price: 10 + i,
		imageUrl: `/images/product${i + 1}.jpg`,
		stock: i === 0 ? 3 : 10,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		categoryId: `cat-1`
	}));
	const sampleCategories = [
		{ id: 'cat-1', name: 'Category One', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
		{ id: 'cat-2', name: 'Category Two', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
	];
	global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		const url = typeof input === 'string' ? input : input.toString();
		// Basic routing based on path suffix
		if (url.includes('/api/products')) {
			return new Response(JSON.stringify(sampleProducts), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}
		if (url.includes('/api/categories')) {
			return new Response(JSON.stringify(sampleCategories), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}
		if (url.includes('/api/orders') && init?.method === 'POST') {
			// Simulate order snapshot echo
			return new Response(JSON.stringify({ id: 'order-1', items: sampleProducts.slice(0, 2).map(p => ({ productId: p.id, name: p.name, price: p.price, quantity: 1 })), total: sampleProducts[0].price + sampleProducts[1].price, status: 'submitted', createdAt: new Date().toISOString() }), { status: 201, headers: { 'Content-Type': 'application/json' } });
		}
		// Default fallback 404 JSON
		return new Response(JSON.stringify({ error: 'not_found', message: 'Mock route not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
	};
}

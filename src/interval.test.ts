import { describe, expect, beforeEach, afterEach, vi, it } from 'vitest';
import { interval } from '.';

describe('setTimeout', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should run every second', () => {
		let elapsed = 0;
		// Can't test for imprecise timing
		const mock = vi.fn(({ elapsed: e }) => (elapsed = e));
		interval(mock, 1000, { useTimeout: true });
		vi.advanceTimersByTime(500);
		expect(mock).toHaveBeenCalledTimes(0);
		vi.advanceTimersByTime(2500);
		expect(mock).toHaveBeenCalledTimes(3);
		expect(elapsed).toBe(3000);
	});
	it('should be able to cancel', () => {
		const mock = vi.fn(({ cancel }) => cancel());
		interval(mock, 1000, { useTimeout: true });
		vi.advanceTimersToNextTimer();
		expect(mock).toHaveBeenCalledTimes(1);
		vi.advanceTimersToNextTimer();
		expect(mock).toHaveBeenCalledTimes(1);
	});
});

describe('requestAnimationFrame', () => {
	beforeEach(() => {
		let lastTime = 0;
		window.performance = {
			...window.performance,
			now: vi.fn(() => (lastTime += 16.67)), // 60fps
		};
		window.requestAnimationFrame = vi.fn((cb) => {
			setTimeout(() => cb(performance.now()), 0);
			return Math.random(); // mock a random id
		});
		window.cancelAnimationFrame = vi.fn(clearTimeout);
		vi.useFakeTimers({
			toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'Date'],
		});
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should run using raf', () => {
		let elapsed = 0;
		// Can't test for imprecise timing
		const mock = vi.fn(({ elapsed: e }) => (elapsed = e));
		interval(mock, 1000);
		vi.advanceTimersByTime(1000 / 16.67); // ~ 999ms
		expect(mock).toHaveBeenCalledTimes(0);
		vi.advanceTimersByTime(16.67);
		expect(mock).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(1001 / 16.67);
		expect(mock).toHaveBeenCalledTimes(2);
		expect(elapsed).toBe(2000);
	});
	it('should be able to cancel using raf', () => {
		const mock = vi.fn(({ cancel }) => cancel());
		interval(mock, 1000);
		vi.advanceTimersByTime(1001 / 16.67); // ~ 1016ms
		expect(mock).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(1001 / 16.67);
		expect(mock).toHaveBeenCalledTimes(1);
	});
});

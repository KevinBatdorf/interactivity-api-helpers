import { withScope } from '@wordpress/interactivity';

/**
 * Similar to setInterval, but with more control over timing and performance.
 * The interval can operate using either requestAnimationFrame or setTimeout based on settings,
 * and can correct for differences between expected and actual times between interval invocations.
 *
 * @param callback The function to be called at each interval.
 * @param interval The time in milliseconds between each interval.
 * @param settings Additional settings for the interval.
 * @param settings.useTimeout If true, use setTimeout instead of requestAnimationFrame.
 * @param settings.precise If true, will attempt to run the interval at the exact interval time.
 *
 * @example
 * interval(({ cancel, elapsed }) => {
 *   console.log(`Elapsed time: ${elapsed}`);
 *   if (elapsed >= 5000) {  // After 5 seconds
 *     cancel();  // Stop the interval
 *   }
 * }, 1000, { useTimeout: true, precise: true });
 */
export const interval = (
	callback: (args: CallbackArgs) => void,
	interval: number,
	settings: Settings,
) => {
	const settingsWithDefaults = Object.assign(
		{ useTimeout: false, precise: true },
		settings,
	);
	if (settingsWithDefaults.useTimeout) {
		intervalTimeout({ callback, interval, settings: settingsWithDefaults });
		return;
	}
	intervalRaf({ callback, interval, settings: settingsWithDefaults });
};

const intervalRaf = ({ callback, interval, settings }: IntervalArgs) => {
	let start: number = 0;
	let cancelled = false;
	let id = 0;
	let totalElapsedTime = 0;

	const update = withScope((timestamp: DOMHighResTimeStamp) => {
		if (!start) start = timestamp;
		const elapsedTime = timestamp - start;

		if (elapsedTime > interval) {
			totalElapsedTime +=
				elapsedTime -
				// precise will normalize to match the interval
				(settings?.precise ? elapsedTime - interval : 0);
			start = timestamp;

			callback({
				elapsed: totalElapsedTime,
				cancel: () => {
					cancelled = true;
					window.cancelAnimationFrame(id);
				},
			});
		}
		id = cancelled ? 0 : window.requestAnimationFrame(update);
	});

	id = window.requestAnimationFrame(update);
};

const intervalTimeout = ({ callback, interval, settings }: IntervalArgs) => {
	let start = Date.now();
	let id: number = 0;
	let cancelled = false;
	let totalElapsedTime = 0;

	const handle = withScope(() => {
		const now = Date.now();
		const elapsedTime = now - start;
		const maybeOverflow = settings?.precise ? elapsedTime - interval : 0;
		totalElapsedTime += elapsedTime - maybeOverflow;
		start = now;

		callback({
			cancel: () => {
				cancelled = true;
				window.clearTimeout(id);
			},
			elapsed: totalElapsedTime,
		});

		if (!cancelled) id = window.setTimeout(handle, interval - maybeOverflow);
	});

	id = window.setTimeout(handle, interval);
};

type CallbackArgs = {
	cancel: () => void;
	elapsed: number;
};
type Settings = {
	useTimeout?: boolean;
	precise?: boolean;
};

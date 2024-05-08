import { store, getContext } from '@wordpress/interactivity';
import { interval } from './interval';

export const html = `<!-- wp:iapih/iapih -->
<div data-wp-interactive="interval"
		data-wp-context="{
			&quot;defaults&quot;: { &quot;count&quot;: 0},
			&quot;imprecise&quot;: { &quot;count&quot;: 0},
			&quot;timerDefaults&quot;: { &quot;count&quot;: 0},
			&quot;timerImprecise&quot;: { &quot;count&quot;: 0}
		}"
		data-wp-init="init">
		<h2>Interval</h2>
		The defaults use <code>requestAnimationFrame</code> which pauses when the tab is inactive. <code>useTimer</code> uses <code>setTimeout</code> which does not pause. Set precise to <code>false</code> to allow for imprecise timing (<code>requestAnimationFrame</code> runs at 60fps normally, and <code>setTimeout</code> is not guaranteed to run at the exact time). Invoke <code>cancel()</code> to stop the interval.
		<pre><code data-wp-text="state.details"></code></pre>
	</div>
<!-- /wp:iapih/iapih -->`;

export default store('interval', {
	state: {
		get details() {
			return JSON.stringify(getContext(), null, 2);
		},
	},
	init() {
		interval(({ cancel, elapsed, iteration }) => {
			const context = getContext<{
				defaults: {
					randomNumber: number;
					count: number;
					elapsed: number;
					cancelled: boolean;
				};
			}>();
			context.defaults = {
				randomNumber: Math.random(),
				count: iteration,
				elapsed,
				cancelled: false,
			};
			if (iteration >= 5) {
				context.defaults.cancelled = true;
				cancel();
			}
		}, 1000);

		interval(
			({ cancel, elapsed, iteration }) => {
				const context = getContext<{
					imprecise: ContextType;
				}>();
				context.imprecise = {
					randomNumber: Math.random(),
					count: iteration,
					elapsed,
					cancelled: false,
				};
				if (iteration >= 5) {
					context.imprecise.cancelled = true;
					cancel();
				}
			},
			1000,
			{ precise: false },
		);

		const clear = interval(
			({ elapsed, iteration }) => {
				const context = getContext<{
					timerDefaults: ContextType;
				}>();
				context.timerDefaults = {
					randomNumber: Math.random(),
					count: iteration,
					elapsed,
					cancelled: false,
				};
			},
			1000,
			{ useTimeout: true },
		);
		setTimeout(clear, 5001);

		const clear2 = interval(
			({ elapsed, iteration }) => {
				const context = getContext<{
					timerImprecise: ContextType;
				}>();
				context.timerImprecise = {
					randomNumber: Math.random(),
					count: iteration,
					elapsed,
					cancelled: false,
				};
			},
			1000,
			{ useTimeout: true, precise: false },
		);
		setTimeout(clear2, 5001);
	},
});

type ContextType = {
	randomNumber: number;
	count: number;
	elapsed: number;
	cancelled: boolean;
};

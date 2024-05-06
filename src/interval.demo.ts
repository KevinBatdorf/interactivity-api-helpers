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
		interval(({ cancel, elapsed }) => {
			const context = getContext<{
				defaults: { count: number; elapsed: number; cancelled: boolean };
			}>();
			const cur = context.defaults?.count ?? 0;
			context.defaults = { count: Number(cur) + 1, elapsed, cancelled: false };
			if (context.defaults.count === 5) {
				context.defaults.cancelled = true;
				cancel();
			}
		}, 1000);

		interval(
			({ cancel, elapsed }) => {
				const context = getContext<{
					imprecise: { count: number; elapsed: number; cancelled: boolean };
				}>();
				const cur = context.imprecise?.count ?? 0;
				context.imprecise = {
					count: Number(cur) + 1,
					elapsed,
					cancelled: false,
				};
				if (context.imprecise.count === 5) {
					context.imprecise.cancelled = true;
					cancel();
				}
			},
			1000,
			{ precise: false },
		);
		interval(
			({ cancel, elapsed }) => {
				const context = getContext<{
					timerDefaults: { count: number; elapsed: number; cancelled: boolean };
				}>();
				const cur = context.timerDefaults?.count ?? 0;
				context.timerDefaults = {
					count: Number(cur) + 1,
					elapsed,
					cancelled: false,
				};
				if (context.timerDefaults.count === 5) {
					context.timerDefaults.cancelled = true;
					cancel();
				}
			},
			1000,
			{ useTimeout: true },
		);

		interval(
			({ cancel, elapsed }) => {
				const context = getContext<{
					timerImprecise: {
						count: number;
						elapsed: number;
						cancelled: boolean;
					};
				}>();
				const cur = context.timerImprecise?.count ?? 0;
				context.timerImprecise = {
					count: Number(cur) + 1,
					elapsed,
					cancelled: false,
				};
				if (context.timerImprecise.count === 5) {
					context.timerImprecise.cancelled = true;
					cancel();
				}
			},
			1000,
			{ useTimeout: true, precise: false },
		);
	},
});

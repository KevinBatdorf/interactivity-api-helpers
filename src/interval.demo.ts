import { store, getContext } from '@wordpress/interactivity';
import { interval } from './interval';

export const html = `<!-- wp:iapih/iapih -->
<div data-wp-interactive="interval"
		data-wp-context="{ &quot;count&quot;: 0 }"
		data-wp-init="init">
		<p data-wp-text="context.count"></p>
	</div>
<!-- /wp:iapih/iapih -->`;

export default store('interval', {
	init() {
		interval(({ cancel }) => {
			const context = getContext<{ count: number }>();
			context.count = Number(context.count) + 1;
			if (context.count === 3) cancel();
		}, 1000);
	},
});

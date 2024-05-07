# Interactivity API Helpers

A collection of helper features for building with the [WordPress Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity/).

_WIP. Open an issue if you want to see a specific helper added._

## Installation

```bash
npm install interactivity-api-helpers
```

## Usage

### `interval(fn, timer, settings)`

Much like the `setInterval` function in JavaScript, this helper will call the provided function at a regular interval. This helper, however, will provide context to the store, and uses `requestAnimationFrame` for better performance.

Takes the following parameters:

- `fn`: The function to call at each interval.
- `timer`: The number of milliseconds to wait between each call.
- `settings`:
  - `useTimeout`: If `true`, the interval will use `setTimeout` instead of `requestAnimationFrame`. Default is `false`.
  - `precise`: While `true`, the interval will try to be as precise as possible by accounting for the time it last ran _`Δt`_. Default is `true`.

The function provided to `interval` will receive an object with the following properties:

- `cancel`: A function that can be called to cancel the interval.
- `elapsed`: The number of milliseconds that have elapsed since the interval was started.

Returns a function that can be called to cancel the interval.

#### Example
```html
<div
  data-wp-interactive="interval"
  data-wp-context='{ "count": 0 }'
  data-wp-init="init">
  <p data-wp-text="context.count"></p>
</div>
```

```js
store('interval', {
  init() {
    const clearFn = interval(({ cancel, elapsed }) => {
      const context = getContext();
      const cur = context.count ?? 0;
      context.count = Number(cur) + 1;

      if (elapsed >= 5000) cancel();
    }, 1000);
  },
});
```

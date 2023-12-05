# Spawn

A library that offers an alternative to the usual declarative approach to mount components imperatively.

[Solid demo](https://adrianaferrari.github.io/spawn/solid/)

[React demo](https://adrianaferrari.github.io/spawn/react/)

## Install from npm

### Solid

```
npm install @web-spawn/solid
```

### React

```
npm install @web-spawn/react
```

## Quick setup

Just add `<SpawnMountPoint />` to your `App.tsx` (or somewhere else in your project, as long as it's always mounted when using this library).

```tsx
export function App() {
	return (
		<>
			<SpawnMountPoint />
			<div>Your code goes here</div>
		</>
	);
}
```

## How to use

`spawn` will immediately append your element to the DOM (by default as a child of the body, but you can specify a different destination as a second parameter). The element will stay there until either `resolve` or `reject` is called: it will then be unmounted and the promise in `result` will be fulfilled.

```tsx
const {result} = spawn((resolve, reject) => (
	<div>
		Hello!
		<button onClick={() => resolve('button was clicked')}>Close me</button>
		<button onClick={() => reject(new Error('user said no :('))}>Reject</button>
	</div>
));
try {
	console.log(await result);
} catch (err) {
	console.log('rejected');
}
```

`spawnAnimate` can be used to spawn component that require an animation: `show` will initially be `false` and automatically be set to `true`, thus triggering the opening transition.

When calling either `resolve` or `reject`, `show` will be set to `false` once again, so that your component can perform its closing animation. Once it's done (e.g. in an `onHidden` callback), call `unmount` to remove the element from the DOM without ruining the animation.

Warning: `result` will only be fulfilled after unmount is called.

```tsx
const {result} = spawnAnimate((resolve, reject, unmount, show) => (
	<div>
		{show ? (
			<div>
				I am open
				<button onClick={() => resolve('button was clicked')}>Close me</button>
				<button onClick={() => reject(new Error('user said no :('))}>Reject</button>
			</div>
		) : (
			<div>
				Waiting to unmount...
				<button onClick={() => unmount()}>Unmount</button>
			</div>
		)}
	</div>
));
try {
	console.log(await result);
} catch (err) {
	console.log('rejected');
}
```

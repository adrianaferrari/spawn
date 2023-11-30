import {closeSpawnedElement, registerResolver, setSpawned} from './internals';
import {AnimationWrapper} from './AnimationWrapper';
import {AnimatedRenderer, AnimatedSpawnResult, Renderer, ResolveFn, SpawnResult} from './types';

let lastId = 0;

/**
 * Spawns the element returned by `renderFn`, appending it to `destination`.
 * The element will be unmounted the moment `reject` or `resolve` is called.
 * @param renderFn Render function for the component you want to spawn
 * @param destination Container of the spawned element (defaults to `document.body`)
 */
export function spawn<T>(renderFn: Renderer<T>, destination?: HTMLElement | null): SpawnResult<T> {
	const id = ++lastId;
	const result = new Promise<T>((resolve, reject) => {
		registerResolver(id, resolve as ResolveFn<unknown>, reject);
	});
	const resolve = (data: T) => {
		closeSpawnedElement(id, 'resolve', data);
	};
	const reject = (data?: unknown) => {
		closeSpawnedElement(id, 'reject', data);
	};
	setSpawned((prev) => [...prev, {renderFn, destination: destination ?? document.body, id, resolve: resolve as ResolveFn<unknown>, reject}]);
	return {
		resolve,
		reject,
		result,
		update: (newRenderFn) => {
			setSpawned((prev) => prev.map((v) => (v.id === id ? {...v, renderFn: newRenderFn} : v)));
		},
	};
}

/**
 * Spawns the element returned by `renderFn`, appending it to `destination`.
 * Unlike `spawn`, it expects to render a component that will close with an animation.
 * @param renderFn Render function that takes four parameters:
 * `resolve` to close the spawned element and return a value, `reject` to close the spawned element and throw an error, `unmount` to remove the component from the DOM and `show`, a boolean that indicates that the spawned element is visible.
 * You can use `resolve`/`reject` to change the value of `show` and then call `unmount` once you receive a `hidden` (or equivalent) event from your component.
 * @param destination Container of the spawned element (defaults to `document.body`)
 */
export function spawnAnimate<T>(renderFn: AnimatedRenderer<T>, destination?: HTMLElement | null): AnimatedSpawnResult<T> {
	const {update: updateSpawn, ...spawnResult} = spawn<T>(
		(resolve, reject) => (
			<AnimationWrapper resolve={resolve} reject={reject}>
				{renderFn}
			</AnimationWrapper>
		),
		destination,
	);
	return {
		...spawnResult,
		update: (newRenderFn) => {
			updateSpawn((resolve, reject) => (
				<AnimationWrapper resolve={resolve} reject={reject}>
					{newRenderFn}
				</AnimationWrapper>
			));
		},
	};
}

import {Accessor, JSXElement} from 'solid-js';

/**
 * Function that resolves a spawned element, returning `data`
 */
export type ResolveFn<T> = (data: T) => void;
/**
 * Function that rejects a spawned element
 */
export type RejectFn = (err?: unknown) => void;
/**
 * Function that unmounts a spawned element
 */
export type UnmountFn = () => void;
/**
 * Function that renders a `JSXElement` and takes four parameters, `resolve`, `reject`, `unmount` and `show`.
 *
 * `resolve` and `reject` can be called to close the rendered element, either by returning a value or throwing an error.
 *
 * `unmount` should be called once it's safe to remove the element from the DOM, so for example after all animations are finished.
 *
 * `show` accessor that indicates whether the rendered component is currently open:
 * react to the changes in its value to animate the opening and closing of the component.
 */
export type AnimatedRenderer<T> = (resolve: ResolveFn<T>, reject: RejectFn, unmount: UnmountFn, show: Accessor<boolean>) => JSXElement;
/**
 * Function that renders a `JSXElement` and takes two functions, `resolve` and `reject` as parameters.
 *
 * Just like in a `Promise`, the two functions will close the rendered element,
 * either by resolving and returning a value or by rejecting and throwing an error
 */
export type Renderer<T> = (resolve: ResolveFn<T>, reject: RejectFn) => JSXElement;
export type SpawnResult<T> = {
	/**
	 * Resolve function to close the spawned element from the outside and (optionally) return a value
	 */
	resolve: ResolveFn<T>;
	/**
	 * Reject function to close the spawned element from the outside and throw an error
	 */
	reject: RejectFn;
	/**
	 * Promise that resolves (or rejects) when the spawned element is closed
	 */
	result: Promise<T>;
};

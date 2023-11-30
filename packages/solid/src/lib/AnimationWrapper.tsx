import {createSignal, onMount} from 'solid-js';
import {AnimatedRenderer, RejectFn, ResolveFn} from './types';

export type AnimationWrapperProps<T> = {
	resolve: ResolveFn<T>;
	reject: RejectFn;
	children: AnimatedRenderer<T>;
};

/**
 * Internal wrapper for spawnAnimate that allows a delay before unmounting the component
 */
export function AnimationWrapper<T>(props: AnimationWrapperProps<T>) {
	const [show, setShow] = createSignal(false);
	let canUnmount = false;
	const unmountPromiseData = (() => {
		const data = {
			resolve: () => undefined as void,
			promise: null as Promise<void> | null,
		};
		data.promise = new Promise<void>((r) => (data.resolve = r));
		return data;
	})();
	async function internalResolve(result: T) {
		canUnmount = true;
		setShow(false);
		await unmountPromiseData.promise;
		props.resolve(result);
	}
	async function internalReject(err?: unknown) {
		canUnmount = true;
		setShow(false);
		await unmountPromiseData.promise;
		props.reject(err);
	}
	function unmount() {
		if (canUnmount) {
			unmountPromiseData.resolve();
		}
	}
	onMount(() => {
		requestAnimationFrame(() => {
			setShow(true);
		});
	});
	return <>{props.children(internalResolve, internalReject, unmount, show)}</>;
}

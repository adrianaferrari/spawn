import {useCallback, useEffect, useRef, useState} from 'react';
import {AnimatedRenderer, RejectFn, ResolveFn} from './types';

export type AnimationWrapperProps<T> = {
	resolve: ResolveFn<T>;
	reject: RejectFn;
	children: AnimatedRenderer<T>;
};
export function AnimationWrapper<T>({resolve, reject, children}: AnimationWrapperProps<T>) {
	const [show, setShow] = useState(false);
	const [unmountPromiseData] = useState(() => {
		const data = {
			resolve: () => undefined as void,
			promise: null as Promise<void> | null,
		};
		data.promise = new Promise<void>((r) => (data.resolve = r));
		return data;
	});
	const internalResolve = useCallback(
		async (result: T) => {
			canUnmountRef.current = true;
			setShow(false);
			await unmountPromiseData.promise;
			resolve(result);
		},
		[resolve, unmountPromiseData.promise],
	);
	const internalReject = useCallback(
		async (err?: unknown) => {
			canUnmountRef.current = true;
			setShow(false);
			await unmountPromiseData.promise;
			reject(err);
		},
		[reject, unmountPromiseData.promise],
	);
	const unmount = useCallback(() => {
		if (canUnmountRef.current) {
			unmountPromiseData.resolve();
		}
	}, [unmountPromiseData]);
	const canUnmountRef = useRef(false);
	useEffect(() => {
		requestAnimationFrame(() => {
			setShow(true);
		});
	}, []);
	return <>{children(internalResolve, internalReject, unmount, show)}</>;
}

import {Dispatch, SetStateAction} from 'react';
import {SpawnedElementProps} from './SpawnedElement';
import {RejectFn, ResolveFn} from './types';

const activePromiseResolver = new Map<number, {resolve: ResolveFn<unknown>; reject: RejectFn}>();

export const setSpawnedRef: {current: Dispatch<SetStateAction<Array<SpawnedElementProps<unknown>>>>} = {
	current: () => {
		console.error('SpawnMountPoint not found');
	},
};

export function closeSpawnedElement(id: number, mode: 'resolve' | 'reject', data: unknown = undefined) {
	const resolver = activePromiseResolver.get(id);
	if (!resolver) {
		console.warn(`Element with id ${id} not found.`);
	} else if (mode === 'resolve') {
		resolver.resolve(data);
	} else if (mode === 'reject') {
		resolver.reject(data);
	}
	activePromiseResolver.delete(id);
	setSpawnedRef.current((prev) => prev.filter((e) => e.id !== id));
}

export function registerResolver(id: number, resolve: ResolveFn<unknown>, reject: RejectFn) {
	activePromiseResolver.set(id, {resolve, reject});
	console.log('registering resolver for id ' + id);
}

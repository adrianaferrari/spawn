import {SpawnedElementProps} from './SpawnedElement';
import {RejectFn, ResolveFn} from './types';
import {createSignal} from 'solid-js';

const activePromiseResolver = new Map<number, {resolve: ResolveFn<unknown>; reject: RejectFn}>();

export const [spawned, setSpawned] = createSignal<Array<SpawnedElementProps<unknown>>>([]);
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
	setSpawned((prev) => prev.filter((e) => e.id !== id));
}

export function registerResolver(id: number, resolve: ResolveFn<unknown>, reject: RejectFn) {
	activePromiseResolver.set(id, {resolve, reject});
	console.log('registering resolver for id ' + id);
}

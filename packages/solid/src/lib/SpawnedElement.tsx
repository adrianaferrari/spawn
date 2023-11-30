import {Portal} from 'solid-js/web';
import {RejectFn, Renderer, ResolveFn} from './types';
import {JSXElement} from 'solid-js';

export type SpawnedElementProps<T> = {
	/**
	 * Renders the component
	 */
	renderFn: Renderer<T>;
	/**
	 * Where to append the rendered component
	 */
	destination: HTMLElement;
	/**
	 * Spawned element id
	 */
	id: number;
	/**
	 * Function to close with the spawned element and return a value
	 */
	resolve: ResolveFn<T>;
	/**
	 * Function to close the spawned element and throw an error to its parent
	 */
	reject: RejectFn;
};

/**
 * Internal wrapper for spawned elements
 */
export function SpawnedElement<T>(props: SpawnedElementProps<T>): JSXElement {
	return <Portal mount={props.destination}>{props.renderFn(props.resolve, props.reject)}</Portal>;
}

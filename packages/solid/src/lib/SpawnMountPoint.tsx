import {SpawnedElement} from './SpawnedElement';
import {For, JSXElement} from 'solid-js';
import {spawned} from './internals';

/**
 * Root for all the spawned elements of the application.
 */
export function SpawnMountPoint(): JSXElement {
	return <For each={spawned()}>{(props) => <SpawnedElement {...props} />}</For>;
}

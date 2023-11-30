import {useEffect, useState} from 'react';
import {SpawnedElement, SpawnedElementProps} from './SpawnedElement';
import {setSpawnedRef} from './internals';

/**
 * Root for all the spawned elements of the application.
 */
export function SpawnMountPoint(): JSX.Element {
	const [spawned, setSpawned] = useState<Array<SpawnedElementProps<unknown>>>([]);
	useEffect(() => {
		setSpawnedRef.current = setSpawned;
	}, []);
	return (
		<>
			{spawned.map((props) => (
				<SpawnedElement key={props.id} {...props} />
			))}
		</>
	);
}

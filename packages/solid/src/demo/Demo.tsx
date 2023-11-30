import {JSXElement, createEffect, createSignal, onCleanup, onMount} from 'solid-js';
import {SpawnMountPoint, spawn, spawnAnimate} from '../lib';

function delay(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

function ContextMenu(props: {resolve: () => void; top: number; left: number; show: boolean; unmount: () => void}) {
	const options = ['First option', 'Second option', 'Third option'];
	const [adaptedLeft, setAdaptedLeft] = createSignal(`${props.left}px`);
	const [adaptedTop, setAdaptedTop] = createSignal(`${props.top}px`);
	const transform = () => (props.show ? 'scale(1)' : 'scale(0.9)');
	const opacity = () => (props.show ? 1 : 0);
	async function close() {
		props.resolve();
		await delay(150);
		props.unmount();
	}
	createEffect(() => {
		if (props.left + 200 > window.innerWidth) {
			setAdaptedLeft(`${window.innerWidth - 200}px`);
		}
		if (props.top + 136 > window.innerHeight) {
			setAdaptedTop(`${window.innerHeight - 136}px`);
		}
	});
	onMount(() => {
		window.addEventListener('resize', close);
	});
	onCleanup(() => {
		window.removeEventListener('resize', close);
	});
	return (
		<div class="fixed inset-0" onClick={() => close()}>
			<ul
				style={{top: adaptedTop(), left: adaptedLeft(), transform: transform(), opacity: opacity()}}
				class="transition-all absolute py-2 shadow w-[200px] bg-white rounded-md origin-top-left"
				onClick={(e) => e.stopPropagation()}
			>
				{options.map((o) => (
					<li class="hover:bg-gray-300/20 px-4 py-2 transition-colors">
						<button class="w-full text-start" onClick={() => close()}>
							{o}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

function Modal(props: {resolve: (data: boolean) => void}) {
	const [transform, setTransform] = createSignal<string>('scale(0.9) translateY(30px)');
	const [opacity, setOpacity] = createSignal<number>(0);
	const close = async (value: boolean) => {
		setTransform('scale(0.9) translateY(30px)');
		setOpacity(0);
		await delay(150);
		props.resolve(value);
	};
	onMount(() => {
		requestAnimationFrame(() => {
			setTransform('scale(1) translateY(0)');
			setOpacity(1);
		});
	});
	return (
		<div class="absolute inset-0 bg-black/20 p-2 transition-all" style={{opacity: opacity()}} onClick={() => close(false)}>
			<div
				style={{transform: transform(), opacity: opacity()}}
				class="transition-all bg-white rounded-md shadow p-4 mt-[50px] max-w-[100%] w-[400px] mx-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 class="inline-block font-bold text-xl mb-4">Confirm your choice</h3>
				<p class="mb-4">Are you sure you want to proceed?</p>
				<div class="flex justify-end gap-4">
					<Button
						onClick={(e) => {
							e.stopPropagation();
							close(true);
						}}
					>
						Yes
					</Button>
					<Button
						onClick={(e) => {
							e.stopPropagation();
							close(false);
						}}
						palette="secondary"
					>
						No
					</Button>
				</div>
			</div>
		</div>
	);
}

function Button(props: {onClick: (e: MouseEvent) => void; className?: string; children: JSXElement; palette?: 'primary' | 'secondary'}) {
	return (
		<button
			class={`${
				!props.palette || props.palette === 'primary' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-pink-500 hover:bg-pink-600'
			} hover:shadow transition-all text-white px-6 font-medium py-3 rounded-md ${props.className ?? ''}`}
			onClick={props.onClick}
		>
			{props.children}
		</button>
	);
}

function Notification(props: {palette: 'primary' | 'secondary'; children: JSXElement; resolve: () => void; show: boolean; unmount: () => void}) {
	const transform = () => (props.show ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-20px)');
	const opacity = () => (props.show ? 1 : 0);
	onMount(() => {
		delay(3000).then(async () => {
			props.resolve();
			await delay(150);
			props.unmount();
		});
	});
	return (
		<div
			style={{opacity: opacity(), transform: transform()}}
			class={`transition-all relative mx-auto w-[200px] my-5 p-5 text-black border rounded-md shadow ${
				props.palette === 'primary' ? 'bg-sky-200 border-sky-500' : 'bg-pink-200 border-pink-500'
			}`}
		>
			{props.children}
		</div>
	);
}

export function Demo() {
	let notificationPanelRef: HTMLDivElement | undefined;
	return (
		<>
			<SpawnMountPoint />
			<div class="h-screen flex flex-col justify-center relative p-4">
				<h1 class="w-full font-display text-5xl text-center mb-3">Spawn demo Solid</h1>
				<div class="flex items-center justify-center gap-x-8 gap-y-4 flex-wrap">
					<Button
						className="w-full sm:w-auto"
						onClick={(e) => spawnAnimate<void>((resolve, _, unmount, show) => <ContextMenu unmount={unmount} show={show()} resolve={resolve} top={e.clientY} left={e.clientX} />)}
					>
						Context menu
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={async () => {
							const {result} = spawn<boolean>((resolve) => <Modal resolve={resolve} />);
							const confirmed = await result;
							spawnAnimate<void>(
								(resolve, _reject, unmount, show) => (
									<Notification palette={confirmed ? 'primary' : 'secondary'} resolve={resolve} unmount={unmount} show={show()}>
										User {confirmed ? 'confirmed' : 'did not confirm'}
									</Notification>
								),
								notificationPanelRef,
							);
						}}
					>
						Open confirmation
					</Button>
				</div>
				<div class="z-0 absolute top-3 pointer-events-none inset-0" ref={notificationPanelRef} />
			</div>
		</>
	);
}

import {MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SpawnMountPoint, spawn, spawnAnimate} from '../lib';

function delay(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}
function ContextMenu({resolve, top, left}: {resolve: () => void; top: number; left: number}) {
	const options = ['First option', 'Second option', 'Third option'];
	const [adaptedLeft, setAdaptedLeft] = useState(left);
	const [adaptedTop, setAdaptedTop] = useState(top);
	const [transform, setTransform] = useState<string>('scale(0.9)');
	const [opacity, setOpacity] = useState<number>(0);
	const menuRef = useRef<HTMLUListElement | null>(null);
	const close = useCallback(async () => {
		setTransform('scale(0.9)');
		setOpacity(0);
		await delay(150);
		resolve();
	}, [resolve]);
	useEffect(() => {
		if (left + 200 > window.innerWidth) {
			setAdaptedLeft(window.innerWidth - 200);
		}
		if (top + 136 > window.innerHeight) {
			setAdaptedTop(window.innerHeight - 136);
		}
		window.addEventListener('resize', close);
		return () => window.removeEventListener('resize', close);
	}, [left, top, close]);
	useEffect(() => {
		requestAnimationFrame(() => {
			setTransform('scale(1)');
			setOpacity(1);
		});
	}, []);
	return (
		<div className="fixed inset-0" onClick={() => close()}>
			<ul
				style={{top: adaptedTop, left: adaptedLeft, transform, opacity}}
				ref={menuRef}
				className="transition-all absolute py-2 shadow w-[200px] bg-white rounded-md origin-top-left"
				onClick={(e) => e.stopPropagation()}
			>
				{options.map((o) => (
					<li className="hover:bg-gray-300/20 px-4 py-2 transition-colors" key={o}>
						<button className="w-full text-start" onClick={() => close()}>
							{o}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

function Modal({resolve}: {resolve: (data: boolean) => void}) {
	const [transform, setTransform] = useState<string>('scale(0.9) translateY(30px)');
	const [opacity, setOpacity] = useState<number>(0);
	const close = useCallback(
		async (value: boolean) => {
			setTransform('scale(0.9) translateY(30px)');
			setOpacity(0);
			await delay(150);
			resolve(value);
		},
		[resolve],
	);
	useEffect(() => {
		requestAnimationFrame(() => {
			setTransform('scale(1) translateY(0)');
			setOpacity(1);
		});
	}, []);
	return (
		<div className="absolute inset-0 bg-black/20 p-2 transition-all" style={{opacity}} onClick={() => close(false)}>
			<div style={{transform, opacity}} className="transition-all bg-white rounded-md shadow p-4 mt-[50px] max-w-[100%] w-[400px] mx-auto" onClick={(e) => e.stopPropagation()}>
				<h3 className="inline-block font-bold text-xl mb-4">Confirm your choice</h3>
				<p className="mb-4">Are you sure you want to proceed?</p>
				<div className="flex justify-end gap-4">
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

function Button({
	onClick,
	children,
	palette = 'primary',
	className,
}: {
	onClick: MouseEventHandler<HTMLButtonElement>;
	className?: string;
	children: ReactNode;
	palette?: 'primary' | 'secondary';
}) {
	return (
		<button
			className={`${
				palette === 'primary' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-pink-500 hover:bg-pink-600'
			} hover:shadow transition-all text-white px-6 font-medium py-3 rounded-md ${className ?? ''}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

function Notification({
	palette,
	children,
	resolve,
	show,
	unmount,
}: {
	palette: 'primary' | 'secondary';
	children: ReactNode;
	resolve: () => void;
	show: boolean;
	unmount: () => void;
}) {
	const transform = useMemo<string>(() => (show ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-20px)'), [show]);
	const opacity = useMemo<number>(() => (show ? 1 : 0), [show]);
	useEffect(() => {
		delay(3000).then(async () => {
			resolve();
			await delay(200);
			unmount();
		});
	}, [resolve, unmount]);
	return (
		<div
			style={{opacity, transform}}
			className={`transition-all relative mx-auto w-[200px] my-5 p-5 text-black border rounded-md shadow ${
				palette === 'primary' ? 'bg-sky-200 border-sky-500' : 'bg-pink-200 border-pink-500'
			}`}
		>
			{children}
		</div>
	);
}

export function Demo() {
	const notificationPanelRef = useRef<HTMLDivElement | null>(null);
	return (
		<>
			<SpawnMountPoint />
			<div className="h-screen flex flex-col justify-center relative p-4">
				<h1 className="w-full font-display text-5xl text-center mb-3">Spawn demo React</h1>
				<div className="flex items-center justify-center gap-x-8 gap-y-4 flex-wrap">
					<Button className="w-full sm:w-auto" onClick={(e) => spawn<void>((resolve) => <ContextMenu resolve={resolve} top={e.clientY} left={e.clientX} />)}>
						Context menu
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={async () => {
							const {result} = spawn<boolean>((resolve) => <Modal resolve={resolve} />);
							const confirmed = await result;
							spawnAnimate<void>(
								(resolve, _reject, unmount, show) => (
									<Notification palette={confirmed ? 'primary' : 'secondary'} resolve={resolve} unmount={unmount} show={show}>
										User {confirmed ? 'confirmed' : 'did not confirm'}
									</Notification>
								),
								notificationPanelRef.current,
							);
						}}
					>
						Open confirmation
					</Button>
				</div>
				<div className="z-0 absolute top-3 pointer-events-none inset-0" ref={notificationPanelRef} />
			</div>
		</>
	);
}

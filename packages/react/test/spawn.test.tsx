import {describe, it, expect, afterEach} from 'vitest';
import {cleanup, render, waitFor, fireEvent, act} from '@testing-library/react';
import {SpawnMountPoint, spawn, spawnAnimate} from '../src/lib';

const testId = 'rendered-element';
describe('spawn', () => {
	it('should spawn element and reject', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnResult = await act(() => spawn(() => <div data-testid={testId} />, screen.baseElement.querySelector('#root') as HTMLElement));
		spawnResult.result.catch(() => undefined);
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		act(() => spawnResult.reject(new Error('reject')));
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnResult.result).rejects.toThrow();
	});
	it('should spawn element and resolve', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnResult = await act(() => spawn(() => <div data-testid={testId} />, screen.baseElement.querySelector('#root') as HTMLElement));
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		act(() => spawnResult.resolve('ok'));
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnResult.result).resolves.toBe('ok');
	});
	it('should let user resolve spawned element', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnResult = await act(() =>
			spawn(
				(resolve) => (
					<div data-testid={testId}>
						<button onClick={() => resolve('clicked')}></button>
					</div>
				),
				screen.baseElement.querySelector('#root') as HTMLElement,
			),
		);
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		const button = await screen.findByRole('button');
		fireEvent.click(button);
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnResult.result).resolves.toBe('clicked');
	});
	it('should let user reject spawned element', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnResult = await act(() =>
			spawn(
				(_resolve, reject) => (
					<div data-testid={testId}>
						<button onClick={() => reject(new Error('reject'))}></button>
					</div>
				),
				screen.baseElement.querySelector('#root') as HTMLElement,
			),
		);
		spawnResult.result.catch(() => undefined);
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		const button = await screen.findByRole('button');
		fireEvent.click(button);
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnResult.result).rejects.toThrow();
	});
	it('should update content', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnResult = await act(() =>
			spawn(
				() => (
					<div data-testid={testId}>
						<div>old</div>
					</div>
				),
				screen.baseElement.querySelector('#root') as HTMLElement,
			),
		);
		await expect(screen.findByText('old')).resolves.toBeInTheDocument();
		act(() =>
			spawnResult.update(() => (
				<div data-testid={testId}>
					<div>new</div>
				</div>
			)),
		);
		await expect(screen.findByText('new')).resolves.toBeInTheDocument();
		expect(screen.queryByText('old')).not.toBeInTheDocument();
		act(() => spawnResult.resolve('ok'));
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnResult.result).resolves.toBe('ok');
	});
	it('should resolve from updated content', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const oldFn = vi.fn((cb) => cb('old'));
		const newFn = vi.fn((cb) => cb('new'));
		const spawnResult = await act(() =>
			spawn(
				(resolve) => (
					<div data-testid={testId}>
						<button onClick={() => oldFn(resolve)}>close</button>
					</div>
				),
				screen.baseElement.querySelector('#root') as HTMLElement,
			),
		);
		await expect(screen.findByText('close')).resolves.toBeInTheDocument();
		act(() =>
			spawnResult.update((resolve) => (
				<div data-testid={testId}>
					<button onClick={() => newFn(resolve)}>close</button>
				</div>
			)),
		);
		const button = await screen.findByText('close');
		expect(button).toBeInTheDocument();
		fireEvent.click(button);
		expect(oldFn).not.toHaveBeenCalled();
		expect(newFn).toHaveBeenCalledOnce();
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnResult.result).resolves.toBe('new');
	});
	afterEach(() => {
		cleanup();
	});
});

describe('spawnAnimate', () => {
	it('should wait for unmount to be called before unmounting element after resolving', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnAnimateResult = await act(() =>
			spawnAnimate(
				(resolve, _reject, unmount, show) => (
					<div data-testid={testId}>
						{show && <div>show</div>}
						<button onClick={() => resolve('ok')}>resolve</button>
						<button onClick={() => unmount()}>unmount</button>
					</div>
				),
				screen.baseElement.querySelector('#root') as HTMLElement,
			),
		);
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		expect(screen.queryByText('show')).not.toBeInTheDocument();
		await expect(screen.findByText('show')).resolves.toBeInTheDocument();
		const resolveButton = await screen.findByRole('button', {name: 'resolve'});
		fireEvent.click(resolveButton);
		await waitFor(() => expect(screen.queryByText('show')).not.toBeInTheDocument());
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		const unmountButton = await screen.findByRole('button', {name: 'unmount'});
		fireEvent.click(unmountButton);
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnAnimateResult.result).resolves.toBe('ok');
	});
	it('should wait for unmount to be called before unmounting element after rejecting', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnAnimateResult = await act(() =>
			spawnAnimate(
				(_resolve, reject, unmount, show) => (
					<div data-testid={testId}>
						{show && <div>show</div>}
						<button onClick={() => reject(new Error('reject'))}>reject</button>
						<button onClick={() => unmount()}>unmount</button>
					</div>
				),
				screen.baseElement.querySelector('#root') as HTMLElement,
			),
		);
		spawnAnimateResult.result.catch(() => undefined);
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		expect(screen.queryByText('show')).not.toBeInTheDocument();
		await expect(screen.findByText('show')).resolves.toBeInTheDocument();
		const rejectButton = await screen.findByRole('button', {name: 'reject'});
		fireEvent.click(rejectButton);
		await waitFor(() => expect(screen.queryByText('show')).not.toBeInTheDocument());
		await expect(screen.findByTestId(testId)).resolves.toBeInTheDocument();
		const unmountButton = await screen.findByRole('button', {name: 'unmount'});
		fireEvent.click(unmountButton);
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnAnimateResult.result).rejects.toThrow('reject');
	});
	it('should update content', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const spawnAnimateResult = await act(() => spawnAnimate(() => <div data-testid={testId}>old</div>, screen.baseElement.querySelector('#root') as HTMLElement));
		await expect(screen.findByText('old')).resolves.toBeInTheDocument();
		act(() =>
			spawnAnimateResult.update(() => (
				<div data-testid={testId}>
					<div>new</div>
				</div>
			)),
		);
		await expect(screen.findByText('new')).resolves.toBeInTheDocument();
		expect(screen.queryByText('old')).not.toBeInTheDocument();
		act(() => spawnAnimateResult.resolve('ok'));
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnAnimateResult.result).resolves.toBe('ok');
	});
	it('should resolve and unmount from updated content', async () => {
		const screen = render(
			<div id="root">
				<SpawnMountPoint />
			</div>,
		);
		const oldResolveFn = vi.fn((cb) => cb('old'));
		const newResolveFn = vi.fn((cb) => cb('new'));
		const oldUnmountFn = vi.fn((cb) => cb());
		const newUnmountFn = vi.fn((cb) => cb());
		const spawnAnimateResult = await act(() =>
			spawnAnimate(
				(resolve, _reject, unmount) => (
					<div data-testid={testId}>
						<button onClick={() => oldResolveFn(resolve)}>close</button>
						<button onClick={() => oldUnmountFn(unmount)}>unmount</button>
					</div>
				),
				screen.baseElement.querySelector('#root') as HTMLElement,
			),
		);
		await expect(screen.findByText('close')).resolves.toBeInTheDocument();
		act(() =>
			spawnAnimateResult.update((resolve, _reject, unmount) => (
				<div data-testid={testId}>
					<button onClick={() => newResolveFn(resolve)}>close</button>
					<button onClick={() => newUnmountFn(unmount)}>unmount</button>
				</div>
			)),
		);
		const button = await screen.findByText('close');
		expect(button).toBeInTheDocument();
		fireEvent.click(button);
		expect(oldResolveFn).not.toHaveBeenCalled();
		expect(newResolveFn).toHaveBeenCalledOnce();
		const unmountButton = await screen.findByRole('button', {name: 'unmount'});
		fireEvent.click(unmountButton);
		expect(oldUnmountFn).not.toHaveBeenCalled();
		expect(newUnmountFn).toHaveBeenCalledOnce();
		await waitFor(() => expect(screen.queryByTestId(testId)).not.toBeInTheDocument());
		await expect(spawnAnimateResult.result).resolves.toBe('new');
	});
	afterEach(() => {
		cleanup();
	});
});

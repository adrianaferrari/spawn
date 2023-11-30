import {render} from 'solid-js/web';
import {Demo} from './Demo';
import './style.css';

const rootElement = document.querySelector('#root');
if (!rootElement) {
	throw new Error('root not found');
}
render(() => <Demo />, rootElement);

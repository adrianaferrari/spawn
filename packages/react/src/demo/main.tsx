import {createRoot} from 'react-dom/client';
import {Demo} from './Demo';
import './style.css';

const rootElement = document.querySelector('#root');
if (!rootElement) {
	throw new Error('root not found');
}
const root = createRoot(rootElement);
root.render(<Demo />);

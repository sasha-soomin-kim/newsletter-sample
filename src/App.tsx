import { StorageProvider } from './state/StorageProvider';
import { Board } from './components/Board';

export default function App() {
  return (
    <StorageProvider>
      <Board />
    </StorageProvider>
  );
}

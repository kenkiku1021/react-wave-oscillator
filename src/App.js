import './App.scss';
import { Header } from './Ui';
import { WaveScopeView } from './WaveScopeView';

function App() {
  return (
    <div className="App">
      <Header/>
      <div className="container-fluid">
        <WaveScopeView />
      </div>
    </div>
  );
}

export default App;

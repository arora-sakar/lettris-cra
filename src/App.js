import { Routes, Route, Link } from "react-router-dom";
import './App.css';
import Lettris from './Lettris';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="lettris" element={<Lettris />} />
      </Routes>
    </div>
  );
}

function Home() {
    return (
      <>
          <div className="App-header">World of Web games</div>
          <div className="lettris-link">
            <Link to="/lettris">
                <img src="Lettris.png" alt="Play Lettris"/></Link>
          </div>
      </>
    );
  }

export default App;

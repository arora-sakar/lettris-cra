import React from 'react';
import { Routes, Route, Link } from "react-router-dom";
import './App.css';
import Lettris from './Lettris';

// Home component extracted as a separate functional component
const Home = () => {
  return (
    <>
      <div className="App-header">World of Web games</div>
      <div className="lettris-link">
        <Link to="/lettris">
          <img src="Lettris.png" alt="Play Lettris" />
        </Link>
      </div>
    </>
  );
};

// Main App component as a functional component
const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="lettris" element={<Lettris />} />
      </Routes>
    </div>
  );
};

export default App;
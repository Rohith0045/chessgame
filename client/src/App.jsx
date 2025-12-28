import { useState, useEffect } from 'react';
import Game from './components/Game';
import Home from './components/Home';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState('');
  const [isInGame, setIsInGame] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);

  return (
    <div className="app-container">
      {isInGame ? (
        <Game
          roomId={roomId}
          setRoomId={setRoomId}
          setIsInGame={setIsInGame}
          playerColor={playerColor}
        />
      ) : (
        <Home
          setRoomId={setRoomId}
          setIsInGame={setIsInGame}
          setPlayerColor={setPlayerColor}
        />
      )}
    </div>
  );
}

export default App;

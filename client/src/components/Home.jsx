import { useState, useEffect } from 'react';
import socket from '../socket';

function Home({ setRoomId, setIsInGame, setPlayerColor }) {
    const [roomInput, setRoomInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        socket.on('game_created', ({ roomId, color }) => {
            setRoomId(roomId);
            setPlayerColor(color);
            setIsInGame(true);
        });

        socket.on('game_joined', ({ roomId, color }) => {
            setRoomId(roomId);
            setPlayerColor(color);
            setIsInGame(true);
        });

        socket.on('error', (msg) => {
            setError(msg);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            socket.off('game_created');
            socket.off('game_joined');
            socket.off('error');
        };
    }, [setRoomId, setIsInGame, setPlayerColor]);

    const createGame = () => {
        const id = Math.random().toString(36).substring(7);
        socket.emit('create_game', id);
    };

    const joinGame = () => {
        if (!roomInput) return;
        socket.emit('join_game', roomInput);
    };

    return (
        <div className="home-container">
            <div className="glass-card">
                <h1 className="title">Chess Online</h1>
                <div className="actions">
                    <button className="btn primary" onClick={createGame}>Create Game</button>

                    <div className="divider"><span>OR</span></div>

                    <div className="join-section">
                        <input
                            type="text"
                            placeholder="Enter Room ID"
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            className="input-field"
                        />
                        <button className="btn secondary" onClick={joinGame}>Join Game</button>
                    </div>
                </div>
                {error && <div className="error-msg">{error}</div>}
            </div>
        </div>
    );
}

export default Home;

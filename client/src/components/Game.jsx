import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import socket from '../socket';

function Game({ roomId, setRoomId, setIsInGame, playerColor }) {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [playerCount, setPlayerCount] = useState(1);
    const [status, setStatus] = useState('Waiting for opponent...');

    useEffect(() => {
        socket.on('player_joined', ({ playerCount: count }) => {
            setPlayerCount(count);
            if (count === 2) setStatus('Game Started');
        });

        socket.on('game_start', ({ fen }) => {
            setStatus('Game Started');
            // If we want to sync starts
        });

        socket.on('move', ({ move, fen }) => {
            setGame(new Chess(fen));
            setFen(fen);
            setStatus(playerColor === 'w' ? "Your Turn" : "Opponent's Turn"); // Logic depends on who moved, simplified here
            // Better status logic below
        });

        return () => {
            socket.off('player_joined');
            socket.off('game_start');
            socket.off('move');
        };
    }, []);

    // Recalculate status whenever game state changes
    useEffect(() => {
        if (game.isCheckmate()) {
            setStatus("Checkmate!");
        } else if (game.isDraw()) {
            setStatus("Draw!");
        } else {
            if (playerCount < 2) {
                setStatus("Waiting for opponent...");
            } else {
                // If it's my turn
                if (game.turn() === playerColor) {
                    setStatus("Your Turn");
                } else {
                    setStatus("Opponent's Turn");
                }
            }
        }
    }, [game, playerCount, playerColor]);

    function onDrop(sourceSquare, targetSquare) {
        if (game.turn() !== playerColor) return false; // Not my turn
        if (playerCount < 2) return false;

        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move === null) return false;

            setFen(game.fen());
            socket.emit('move', { roomId, move, fen: game.fen() });
            return true;
        } catch (e) {
            return false;
        }
    }

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        alert('Room ID copied!');
    }

    return (
        <div className="game-container">
            <div className="glass-card game-card">
                <div className="header">
                    <h2>Room: <span onClick={copyRoomId} className="room-id" title="Click to copy">{roomId}</span></h2>
                    <div className="status-badge">{status}</div>
                </div>
                <div className="board-wrapper">
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                        customDarkSquareStyle={{ backgroundColor: '#779556' }}
                        customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
                    />
                </div>
                {/* Debug info or chat could go here */}
            </div>
        </div>
    );
}

export default Game;

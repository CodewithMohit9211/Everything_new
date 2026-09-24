import React, { useState, useEffect, useRef } from 'react';

const WIDTH = 500;
const HEIGHT = 500;
const PLAYER_SIZE = 50;
const ENEMY_SIZE = 50;
const PLAYER_SPEED = 7;
const ENEMY_SPEED = 5;

export default function DodgeGame() {
  const canvasRef = useRef(null);
  
  const gameState = useRef({
    playerX: WIDTH / 2 - PLAYER_SIZE / 2,
    playerY: HEIGHT - PLAYER_SIZE - 10,
    enemies: [],
    score: 0,
    gameOver: false,
    keys: {}
  });

  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameState.current.keys[e.key] = true;
      if (["ArrowLeft", "ArrowRight", " ", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      gameState.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;

    const gameLoop = () => {
      const state = gameState.current;
      const canvas = canvasRef.current;
      
      if (!canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext('2d');

      if (!state.gameOver) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        if ((state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) && state.playerX > 0) {
          state.playerX -= PLAYER_SPEED;
        }
        if ((state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) && state.playerX < WIDTH - PLAYER_SIZE) {
          state.playerX += PLAYER_SPEED;
        }

        if (Math.random() < 1 / 20) {
          const xPos = Math.random() * (WIDTH - ENEMY_SIZE);
          state.enemies.push({ x: xPos, y: 0 });
        }

        ctx.fillStyle = '#C80000';
        const updatedEnemies = [];

        for (let enemy of state.enemies) {
          enemy.y += ENEMY_SPEED;
          ctx.fillRect(enemy.x, enemy.y, ENEMY_SIZE, ENEMY_SIZE);

          const hit = (
            state.playerX < enemy.x + ENEMY_SIZE &&
            state.playerX + PLAYER_SIZE > enemy.x &&
            state.playerY < enemy.y + ENEMY_SIZE &&
            state.playerY + PLAYER_SIZE > enemy.y
          );

          if (hit) {
            state.gameOver = true;
            setIsGameOver(true);
          }

          if (enemy.y < HEIGHT) {
            updatedEnemies.push(enemy);
          }
        }
        state.enemies = updatedEnemies;

        ctx.fillStyle = '#0000C8';
        ctx.fillRect(state.playerX, state.playerY, PLAYER_SIZE, PLAYER_SIZE);

        state.score += 1;
        setScoreDisplay(state.score);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const restartGame = () => {
    gameState.current = {
      playerX: WIDTH / 5 - PLAYER_SIZE / 2,
      playerY: HEIGHT - PLAYER_SIZE - 10,
      enemies: [],
      score: 0,
      gameOver: false,
      keys: {}
    };
    setIsGameOver(false);
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', marginTop: '20px' }}>
      <h2>Dodge the Blocks - Score: {scoreDisplay}</h2>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          tabIndex={0}
          onClick={(e) => e.target.focus()}
          style={{ border: '3px solid #333', backgroundColor: '#fff', display: 'block', outline: 'none' }}
        />
        {isGameOver && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', color: '#fff'
          }}>
            <h1>Game Over</h1>
            <p>Final Score: {scoreDisplay}</p>
            <button 
              onClick={restartGame}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#0000C8', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <p style={{ color: '#666', fontSize: '14px' }}>Click on the game box, then use Left / Right Arrow keys to move</p>
    </div>
  );
}
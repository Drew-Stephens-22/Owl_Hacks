import { useEffect, useState, useRef } from "react";
import "./App.css";
import astronautGif from "./assets/swimming_astronaut.gif"
export default function App() {
  const [stars, setStars] = useState([]);
  const [sleep, setSleep] = useState(false);
  const [astronaut, setAstronaut] = useState({
    hunger: 100,
    energy: 100,
    oxygen: 100,
    health: 50,
    sleep: false,
  });
  const [distance, setDistance] = useState(5000);
  const [isFed, setIsFed] = useState(false);
  const [isBreathed, setIsBreathed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wonGame, setWonGame] = useState(false);

// create initial stars
useEffect(() => {
  const starCount = 100; // number of stars
  const initialStars = [];
  for (let i = 0; i < starCount; i++) {
    initialStars.push({
      id: i,
      top: Math.random() * 100 + "vh",
      left: Math.random() * 100 + "vw",
      size: Math.random() * 3 + 1 + "px",
    });
  }
  setStars(initialStars);
}, []);

// move stars
useEffect(() => {
  const interval = setInterval(() => {
    setStars(prevStars =>
      prevStars.map(star => {
        let newLeft = sleep ? parseFloat(star.left) : parseFloat(star.left) - 1;
        if (newLeft < -5) {
          newLeft = 100 + Math.random() * 10;
          return {
            ...star,
            left: newLeft + "vw",
            top: Math.random() * 100 + "vh",
            size: Math.random() * 3 + 1 + "px", 
          };
        }
        return { ...star, left: newLeft + "vw" };
      })
    );
  }, 35); // speed of drift (lower = faster)

  return () => clearInterval(interval);
}, [sleep]);

// decreases astronauts stats
useEffect(() => {
  let timer;
  const decreaseStats = () => {
    setAstronaut(prev => ({
      ...prev,
      hunger: (gameOver || wonGame) ?  prev.hunger : Math.max(prev.hunger - 1, 0),
      energy: sleep ? Math.min(prev.energy + 1, 100) : Math.max(prev.energy - 1, 0),
      oxygen: (gameOver || wonGame) ? prev.oxygen : Math.max(prev.oxygen - 1, 0),
    }));

    timer = setTimeout(decreaseStats, Math.random() * 1000);
  };
  decreaseStats(); 
  return () => clearTimeout(timer); 
}, [sleep, isBreathed, isFed]);

// decreases health if hunger or oxygen are 0
useEffect(() => {
  const timer = setInterval(() => {
    setAstronaut(prev => {
      let newHealth = prev.health;

      if (prev.hunger <= 0 || prev.oxygen <= 0) {
        newHealth = Math.floor(Math.max(prev.health - 5, 0));
      }

      if (newHealth <= 0) {
        setGameOver(true);
      }

      return {
        ...prev,
        health: newHealth, 
      };
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);

const restartGame = () => {
  setAstronaut({ hunger: 100, energy: 100, oxygen: 100, health: 50, sleep: false });
  setDistance(5000);
  setGameOver(false);
};

// check if distance has reached 0 (win condition)
useEffect(() => {
  if (distance <= 0 && !gameOver) {
    setWonGame(true);
  }
}, [distance, gameOver]);

const gameWon = () => {
  restartGame();
  setWonGame(false);
}

  //feeds the astronaut, sets a timeout for spamming
  const feedAstronaut = () => {
    if(isFed) return;
    setIsFed(true);
    setAstronaut(prev => {
      const num = Math.floor(Math.random() * 20) + 1; 
      return {
        ...prev,
        hunger: Math.floor(Math.min(prev.hunger + num, 100)), 
      };
    });
    setTimeout(() => setIsFed(false), 2000);
  };

  //gives the astronaut oxygen, sets a timeout for spamming
  const giveOxygen = () => {
    if(isBreathed) return;
    setIsBreathed(true);
    setAstronaut(prev => {
      const num = Math.floor(Math.random() * 20) + 1;
      return {
        ...prev,
        oxygen: Math.floor(Math.min(prev.oxygen + num, 100)), 
      };
    });
    setTimeout(() => setIsBreathed(false), 2000);
  };

  //sets the astrounaut to sleep
  const toggleSleep = () => {
  setSleep(prev => !prev); 
  setDistance(prev => prev);
};

//slowly decreases the distance
useEffect(() => {
  let timer;
  const decreaseDistance = () => {
    setDistance(prev => sleep ? prev : Math.max(prev - Math.floor(Math.random() * 100), 0));
    timer = setTimeout(decreaseDistance, Math.random() * 1000 + 500); 
  };
  decreaseDistance(); 
  return () => clearTimeout(timer); 
}, [sleep]);

  return (
    <div className="">
      {gameOver && (
        <div className="game-over-overlay">
          <h1>GAME OVER</h1>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
      {wonGame && (
        <div className="game-over-overlay">
          <h1>YOU WON! 🎉</h1>
          <p>The astronaut safely reached the destination!</p>
          <button onClick={gameWon}>Play Again</button>
        </div>
      )}
      <div className="starry-bg">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      <div>
        <h1 className="title">Care Through the Cosmos</h1>
        <div className="needs-bar">
          <p>Distance Remaining: {distance}</p>
          <p>Health: {astronaut.health}</p>
          <p>Hunger: {astronaut.hunger}</p>
          <p>Energy: {astronaut.energy}</p>
          <p>Oxygen: {astronaut.oxygen}</p>
        </div>
        <img className="astronaut" src={astronautGif} alt="Astronaut" />
        <div className="button-bar">
          <button onClick={feedAstronaut} disabled={isFed}>{'Feed'}</button>
          <button onClick={giveOxygen} disabled={isBreathed}>{'Send Oxygen'}</button>
          <button onClick={toggleSleep}>
            {sleep ? "Wake Up" : "Sleep"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import "./App.css";
import astronautGif from "./assets/swimming_astronaut.gif";

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
  const [distance, setDistance] = useState(4000);
  const [isFed, setIsFed] = useState(false);
  const [isBreathed, setIsBreathed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wonGame, setWonGame] = useState(false);
  const [asteroids, setAsteroids] = useState([]);
  const astronautRef = useRef(null);
  const [score, setScore] = useState(0);

  // create initial stars
  useEffect(() => {
    const starCount = 100;
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
    }, 35);

    return () => clearInterval(interval);
  }, [sleep]);

  // decreases astronaut stats
  useEffect(() => {
    let timer;
    const decreaseStats = () => {
      setAstronaut(prev => ({
        ...prev,
        hunger:
          gameOver || wonGame
            ? prev.hunger
            : Math.max(prev.hunger - (sleep ? 0.5 : 1), 0),
        energy: sleep || wonGame || gameOver
          ? Math.min(prev.energy + 1, 100)
          : Math.max(prev.energy - 1, 0),
        oxygen:
          gameOver || wonGame
            ? prev.oxygen
            : Math.max(prev.oxygen - (sleep ? 0.5 : 1), 0),
      }));
      setScore(prev =>
      gameOver || wonGame || sleep ? Math.max(0, prev - 1) : Math.max(0, prev + 0.5)
      );
      timer = setTimeout(decreaseStats, Math.random() * 1000);
    };
    decreaseStats();
    return () => clearTimeout(timer);
  }, [sleep, isBreathed, isFed, gameOver, wonGame]);

  // decreases health if hunger or oxygen are 0
  useEffect(() => {
    const timer = setInterval(() => {
      setAstronaut(prev => {
        let newHealth = prev.health;
        if (prev.hunger <= 0 || prev.oxygen <= 0 || prev.energy <= 0) {
          newHealth = Math.floor(Math.max(prev.health - 5, 0));
        }
        if (newHealth <= 0) {
          setGameOver(true);
        }
        return { ...prev, health: newHealth };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const restartGame = () => {
    setAstronaut({
      hunger: 100,
      energy: 100,
      oxygen: 100,
      health: 50,
      sleep: false,
    });
    setDistance(4000);
    setGameOver(false);
    setWonGame(false);
    setAsteroids([]);
    setScore(0);
    setSleep(false);
  };

  // win condition
  useEffect(() => {
    if (distance <= 0 && !gameOver) {
      const points = (10 * (astronaut.energy + astronaut.hunger + astronaut.oxygen)) + (20 * astronaut.health);
      setScore(prev => prev + points);
      setWonGame(true);
    }
  }, [distance, gameOver]);

  const gameWon = () => {
    restartGame();
  };


  // feed astronaut
  const feedAstronaut = () => {
    if (isFed) return;
    setIsFed(true);
    setAstronaut(prev => {
      const num = Math.floor(Math.random() * 20) + 1;
      return { ...prev, hunger: Math.floor(Math.min(prev.hunger + num, 100)) };
    });
    setTimeout(() => setIsFed(false), 2000);
  };

  // give oxygen
  const giveOxygen = () => {
    if (isBreathed) return;
    setIsBreathed(true);
    setAstronaut(prev => {
      const num = Math.floor(Math.random() * 20) + 1;
      return { ...prev, oxygen: Math.floor(Math.min(prev.oxygen + num, 100)) };
    });
    setTimeout(() => setIsBreathed(false), 2000);
  };

  // toggle sleep
  const toggleSleep = () => {
    setSleep(prev => !prev);
  };

  // decrease distance
  useEffect(() => {
    let timer;
    const decreaseDistance = () => {
      setDistance(prev =>
        sleep || gameOver || wonGame
          ? prev
          : Math.max(prev - Math.floor(Math.random() * 100), 0)
      );
      timer = setTimeout(decreaseDistance, Math.random() * 1000 + 500);
    };
    decreaseDistance();
    return () => clearTimeout(timer);
  }, [sleep, gameOver, wonGame]);

  // spawn asteroids
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOver || wonGame) return;
      setAsteroids(prev => [
        ...prev,
        {
          id: Date.now(),
          x: window.innerWidth,
          y: Math.random() * (window.innerHeight - 50),
          size: Math.random() * 50 + 20,
          speed: Math.random() * 4 + 2,
        },
      ]);
    }, 3500);
    return () => clearInterval(interval);
  }, [gameOver, wonGame]);

  // move asteroids
  useEffect(() => {
    const interval = setInterval(() => {
      setAsteroids(prev =>
        prev
          .map(a => ({ ...a, x: a.x - a.speed }))
          .filter(a => a.x + a.size > 0)
      );
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // collision detection
  const checkCollision = (r1, r2) => {
    return !(
      r1.right < r2.left ||
      r1.left > r2.right ||
      r1.bottom < r2.top ||
      r1.top > r2.bottom
    );
  };

  // collision handler
  useEffect(() => {
    const interval = setInterval(() => {
      if (!astronautRef.current) return;
      const astroRect = astronautRef.current.getBoundingClientRect();

      setAsteroids(prev =>
        prev.filter(a => {
          const astRect = document
            .getElementById(`asteroid-${a.id}`)
            ?.getBoundingClientRect();
          if (!astRect) return true;
          if (checkCollision(astroRect, astRect)) {
            setAstronaut(prev => ({
              ...prev,
              health: Math.max(prev.health - 10, 0),
            }));
            return false;
          }
          return true;
        })
      );
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // destroy asteroid manually
const destroyAsteroid = (ast) => {
  setAsteroids(prev => prev.filter(a => a.id !== ast.id));
  setScore(prev => Math.floor(prev + ast.size));
};

  return (
    <div>
      <p className="">Login</p>
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
          <p>Final Score: {score} </p>
          <button onClick={gameWon}>Play Again</button>
        </div>
      )}
      <div className="starry-bg">
        {stars.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
            }}
          />
        ))}
      </div>
      {asteroids.map(a => (
        <div
          key={a.id}
          className="asteroid"
          id={`asteroid-${a.id}`}
          onClick={() => destroyAsteroid(a)}
          style={{
            position: "absolute",
            left: a.x + "px",
            top: a.y + "px",
            width: a.size + "px",
            height: a.size + "px",
            background: "gray",
            borderRadius: "50%",
          }}
        />
      ))}
      <div>
        <h1 className="title">Care Through the Cosmos</h1>
        <div className="needs-bar">
          <p>Distance Remaining: {distance}</p>
          <p>Health: {astronaut.health}</p>
          <p>Hunger: {astronaut.hunger}</p>
          <p>Energy: {astronaut.energy}</p>
          <p>Oxygen: {astronaut.oxygen}</p>
          <p>Score: {score}</p>
        </div>
        <img
          ref={astronautRef}
          className="astronaut"
          src={astronautGif}
          alt="Astronaut"
        />
        <div className="button-bar">
          <button onClick={feedAstronaut} disabled={isFed}>
            Feed
          </button>
          <button onClick={giveOxygen} disabled={isBreathed}>
            Send Oxygen
          </button>
          <button onClick={toggleSleep}>
            {sleep ? "Wake Up" : "Sleep"}
          </button>
        </div>
      </div>
    </div>
  );
}

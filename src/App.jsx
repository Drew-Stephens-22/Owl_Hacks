import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const starCount = 100; // number of stars
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        top: Math.random() * 100 + "vh",
        left: Math.random() * 100 + "vw",
        size: Math.random() * 3 + 1 + "px",
        delay: Math.random() * 5 + "s"
      });
    }
    setStars(newStars);
  }, []);

  return (
    <div className="starry-bg flex items-center justify-center">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay
          }}
        />
      ))}
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [stars, setStars] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    const starCount = 100;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        top: Math.random() * 100 + "vh",
        left: Math.random() * 100 + "vw",
        size: Math.random() * 3 + 1 + "px",
        delay: Math.random() * 5 + "s",
      });
    }
    setStars(newStars);
  }, []);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset height
      textarea.style.height = textarea.scrollHeight + "px"; // grow to fit content
    }
  }, [inputValue]);

  const clickButton = () => {
    alert(inputValue);
  }
  
  return (
    <div className="">
      {/* Starry background */}
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

      {/* Centered title and input */}
      <div className="center-content">
        <h1>Care Through the Cosmos</h1>
        <textarea
          ref={textAreaRef}
          className="textArea"
          placeholder="What would you like help with?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ height: `${Math.max(100, inputValue.length)}px` }}
        />
        <button onClick={clickButton}>{'>'}</button>
      </div>
    </div>
  );
}

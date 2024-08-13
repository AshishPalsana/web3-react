import { useEffect, useState } from "react";

const Blinker = () => {
  const [blinker, setBlinker] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      startBlinker();
    }, 800);
  }, [blinker]);

  const startBlinker = () => {
    setBlinker(!blinker);
  };

  return <span className={`${blinker ? "blink" : ""}`}>{" : "}</span>;
};

export default Blinker;

import { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const timerSair = setTimeout(() => setSaindo(true), 2200);
    const timerDone = setTimeout(() => onDone(), 2800);
    return () => {
      clearTimeout(timerSair);
      clearTimeout(timerDone);
    };
  }, [onDone]);

  return (
    <div className={`splash ${saindo ? "splash-out" : ""}`}>
      <div className="splash-inner">
        <img src="/logo.png" alt="MH Facilities & Segurança" className="splash-logo" />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

export const ScrollProgressBar: React.FC = () => {
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (documentHeight > windowHeight) {
        const percent = (scrollTop / (documentHeight - windowHeight)) * 100;
        setScrollPercent(Math.min(100, Math.max(0, percent)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] bg-transparent pointer-events-none">
      <div
        style={{ width: `${scrollPercent}%` }}
        className="h-full bg-gradient-to-r from-primary via-blue-500 to-emerald-400 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(59,130,246,0.6)]"
      />
    </div>
  );
};

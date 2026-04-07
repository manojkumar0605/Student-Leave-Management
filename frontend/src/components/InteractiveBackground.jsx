import React, { useEffect, useState } from 'react';

export default function InteractiveBackground() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Use requestAnimationFrame for smoother following
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" 
         style={{ background: 'var(--bg-color)', transition: 'background-color 0.5s ease' }}>
      
      {/* Base static blurred mesh */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 20s infinite alternate'
        }}
      />
      <div 
        className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 mix-blend-screen default-gradient"
        style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float 25s infinite alternate-reverse'
        }}
      />
      
      {/* Interactive cursor-following orb */}
      <div
        className="absolute rounded-full opacity-40 transition-opacity duration-300"
        style={{
          width: '600px',
          height: '600px',
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          filter: 'blur(120px)',
          transition: 'left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      />
    </div>
  );
}

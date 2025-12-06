import { useEffect, useRef, useState } from "react";
import * as motion from "motion/react-client";

export default function InteractiveBackground() {
  const [arrows, setArrows] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Generar elementos decorativos en posiciones aleatorias
  useEffect(() => {
    const generateArrows = () => {
      // Cantidad responsive de elementos según el ancho de pantalla
      const isMobile = window.innerWidth < 768;
      const arrowCount = isMobile ? 20 : 40; // Menos burbujas en móvil
      const newArrows = [];

      for (let i = 0; i < arrowCount; i++) {
        // Generar posiciones solo en los bordes, evitando el centro
        let x, y;
        const edge = Math.floor(Math.random() * 4); // 0: arriba, 1: derecha, 2: abajo, 3: izquierda
        
        switch(edge) {
          case 0: // Arriba
            x = Math.random() * 100;
            y = Math.random() * 25; // 0-25% desde arriba
            break;
          case 1: // Derecha
            x = 75 + Math.random() * 25; // 75-100% desde izquierda
            y = Math.random() * 100;
            break;
          case 2: // Abajo
            x = Math.random() * 100;
            y = 75 + Math.random() * 25; // 75-100% desde arriba
            break;
          case 3: // Izquierda
            x = Math.random() * 25; // 0-25% desde izquierda
            y = Math.random() * 100;
            break;
        }
        
        newArrows.push({
          id: i,
          x: x,
          y: y,
          size: 30 + Math.random() * 50, // Tamaño variable entre 30-80px
          opacity: 0.4 + Math.random() * 0.3, // Opacidad variable 0.4-0.7
        });
      }

      setArrows(newArrows);
    };

    generateArrows();
  }, []);

  // Rastrear posición del mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calcular la posición repelida de cada flecha
  const getRepelledPosition = (arrow) => {
    const dx = arrow.x - mousePosition.x;
    const dy = arrow.y - mousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Radio de repulsión (en porcentaje)
    const repelRadius = 15;

    if (distance < repelRadius && distance > 0) {
      // Calcular la fuerza de repulsión (más fuerte cuando está más cerca)
      const force = (repelRadius - distance) / repelRadius;
      const repelX = (dx / distance) * force * 8;
      const repelY = (dy / distance) * force * 8;

      return {
        x: arrow.x + repelX,
        y: arrow.y + repelY,
      };
    }

    return { x: arrow.x, y: arrow.y };
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {arrows.map((arrow) => {
        const position = getRepelledPosition(arrow);

        return (
          <motion.div
            key={arrow.id}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${arrow.size}px`,
              height: `${arrow.size}px`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 15,
              mass: 0.5,
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, 
                  rgba(251, 146, 60, ${arrow.opacity}), 
                  rgba(249, 115, 22, ${arrow.opacity * 0.7}))`,
                backdropFilter: "blur(3px)",
                boxShadow: `0 0 ${arrow.size * 1.5}px rgba(251, 146, 60, ${arrow.opacity * 0.8}), 
                            0 0 ${arrow.size * 0.5}px rgba(255, 255, 255, ${arrow.opacity * 0.5})`,
                border: `2px solid rgba(255, 255, 255, ${arrow.opacity * 0.6})`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

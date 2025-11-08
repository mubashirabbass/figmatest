import React from 'react';
import { motion } from 'motion/react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function AnimatedLogo({ size = 'md', animate = true }: AnimatedLogoProps) {
  const sizeMap = {
    sm: 60,
    md: 100,
    lg: 160
  };

  const pizzaSize = sizeMap[size];

  return (
    <div style={{ width: pizzaSize, height: pizzaSize, perspective: 1000 }}>
      <motion.div
        style={{
          width: pizzaSize,
          height: pizzaSize,
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
        animate={animate ? {
          rotateY: [0, 360],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Pizza Base */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f4a460 0%, #d2691e 50%, #c85a17 100%)',
            boxShadow: `
              inset 0 0 20px rgba(0, 0, 0, 0.2),
              0 8px 20px rgba(0, 0, 0, 0.3),
              0 0 0 ${pizzaSize * 0.08}px #d2691e,
              0 0 0 ${pizzaSize * 0.1}px #8B4513
            `,
            transform: 'translateZ(0)',
          }}
        />

        {/* Cheese Layer */}
        <div
          style={{
            position: 'absolute',
            width: '85%',
            height: '85%',
            top: '7.5%',
            left: '7.5%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #ffe4b5 0%, #ffd700 40%, #ffa500 100%)',
            boxShadow: 'inset 0 -4px 10px rgba(0, 0, 0, 0.2)',
            opacity: 0.9,
            transform: 'translateZ(5px)',
          }}
        />

        {/* Pepperoni 1 */}
        <motion.div
          style={{
            position: 'absolute',
            width: '20%',
            height: '20%',
            top: '25%',
            left: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ff6347 0%, #dc143c 60%, #8b0000 100%)',
            boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
            transform: 'translateZ(10px)',
          }}
          animate={animate ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0,
          }}
        />

        {/* Pepperoni 2 */}
        <motion.div
          style={{
            position: 'absolute',
            width: '18%',
            height: '18%',
            top: '50%',
            left: '55%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ff6347 0%, #dc143c 60%, #8b0000 100%)',
            boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
            transform: 'translateZ(10px)',
          }}
          animate={animate ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.3,
          }}
        />

        {/* Pepperoni 3 */}
        <motion.div
          style={{
            position: 'absolute',
            width: '22%',
            height: '22%',
            top: '55%',
            left: '20%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ff6347 0%, #dc143c 60%, #8b0000 100%)',
            boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
            transform: 'translateZ(10px)',
          }}
          animate={animate ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.6,
          }}
        />

        {/* Pepperoni 4 */}
        <motion.div
          style={{
            position: 'absolute',
            width: '19%',
            height: '19%',
            top: '20%',
            left: '60%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ff6347 0%, #dc143c 60%, #8b0000 100%)',
            boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
            transform: 'translateZ(10px)',
          }}
          animate={animate ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.9,
          }}
        />

        {/* Basil Leaves */}
        <div
          style={{
            position: 'absolute',
            width: '15%',
            height: '8%',
            top: '40%',
            left: '45%',
            borderRadius: '50% 50% 50% 0',
            background: 'linear-gradient(135deg, #90ee90 0%, #228b22 100%)',
            transform: 'translateZ(12px) rotate(45deg)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: '12%',
            height: '7%',
            top: '35%',
            left: '25%',
            borderRadius: '50% 50% 50% 0',
            background: 'linear-gradient(135deg, #90ee90 0%, #228b22 100%)',
            transform: 'translateZ(12px) rotate(-30deg)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Mushroom slices */}
        <div
          style={{
            position: 'absolute',
            width: '14%',
            height: '14%',
            top: '45%',
            left: '35%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #f5f5dc 0%, #daa520 100%)',
            boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)',
            transform: 'translateZ(8px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '40%',
              height: '40%',
              top: '30%',
              left: '30%',
              borderRadius: '50%',
              background: '#cd853f',
              opacity: 0.6,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

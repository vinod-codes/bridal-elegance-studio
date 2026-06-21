import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlyAnimationContextType {
  triggerFlyAnimation: (imageUrl: string, sourceRect: DOMRect) => void;
}

const FlyAnimationContext = createContext<FlyAnimationContextType | undefined>(undefined);

export const FlyAnimationProvider = ({ children }: { children: ReactNode }) => {
  const [animations, setAnimations] = useState<{ id: number; src: string; rect: DOMRect }[]>([]);

  const triggerFlyAnimation = useCallback((imageUrl: string, sourceRect: DOMRect) => {
    const id = Date.now() + Math.random();
    setAnimations((prev) => [...prev, { id, src: imageUrl, rect: sourceRect }]);

    // Remove the animation after it completes (e.g., 800ms)
    setTimeout(() => {
      setAnimations((prev) => prev.filter((a) => a.id !== id));
    }, 800);
  }, []);

  return (
    <FlyAnimationContext.Provider value={{ triggerFlyAnimation }}>
      {children}
      {/* Render the flying images */}
      <AnimatePresence>
        {animations.map((anim) => {
          // Get the target rect (the cart icon)
          const targetEl = document.getElementById("cart-icon");
          const targetRect = targetEl?.getBoundingClientRect() || { top: 20, left: window.innerWidth - 60, width: 24, height: 24 };

          return (
            <motion.img
              key={anim.id}
              src={anim.src}
              initial={{
                position: "fixed",
                top: anim.rect.top,
                left: anim.rect.left,
                width: anim.rect.width,
                height: anim.rect.height,
                opacity: 1,
                zIndex: 9999,
                borderRadius: "8px",
                objectFit: "cover",
              }}
              animate={{
                top: targetRect.top + targetRect.height / 2 - anim.rect.height / 4,
                left: targetRect.left + targetRect.width / 2 - anim.rect.width / 4,
                width: anim.rect.width / 2,
                height: anim.rect.height / 2,
                opacity: 0,
                scale: 0.1,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1], // cubic bezier for smooth "fly" curve
              }}
              style={{ pointerEvents: "none", transformOrigin: "center" }}
            />
          );
        })}
      </AnimatePresence>
    </FlyAnimationContext.Provider>
  );
};

export const useFlyAnimation = () => {
  const context = useContext(FlyAnimationContext);
  if (context === undefined) {
    throw new Error("useFlyAnimation must be used within a FlyAnimationProvider");
  }
  return context;
};

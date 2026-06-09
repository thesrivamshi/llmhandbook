import React from "react";
import Sidebar from "./Sidebar";

// `immersive` turns the desktop sidebar into an auto-hiding overlay: it slides
// off-screen and reappears when the pointer reaches the left edge (a thin hot
// zone) — for distraction-free reading. Mobile is unaffected.
export const Layout: React.FC<{ children: React.ReactNode; immersive?: boolean }> = ({ children, immersive = false }) => {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <div className="lg:flex min-h-screen">
      {immersive && (
        <div
          className="hidden lg:block fixed left-0 top-0 h-screen w-4 z-30"
          onMouseEnter={() => setRevealed(true)}
          aria-hidden
        />
      )}
      <Sidebar immersive={immersive} revealed={revealed} onHide={() => setRevealed(false)} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};

export default Layout;

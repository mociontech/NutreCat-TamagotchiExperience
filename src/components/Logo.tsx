import { useState } from "react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [imgError, setImgError] = useState(false);
  const heights = { sm: "1.6rem", md: "2.2rem", lg: "3rem" };

  return (
    <div className="logo-area">
      {!imgError ? (
        <img
          src="/assets/nutre-cat-logo.png"
          alt="Nutre Cat"
          className="logo-img"
          style={{ height: heights[size] }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="logo-placeholder">
          <div className="logo-paw">🐾</div>
          <span className="logo-text" style={{ fontSize: size === "lg" ? "2.2rem" : size === "sm" ? "1.2rem" : "1.6rem" }}>
            NUTRE CAT
          </span>
        </div>
      )}
    </div>
  );
}

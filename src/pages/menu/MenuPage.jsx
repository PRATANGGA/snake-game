import React, { useState, useEffect } from "react";
import { Play, Gear } from "react-bootstrap-icons";
import { useApp } from "../../contexts/AppContext";
import { useIsLarge } from "../../hooks/useIsLarge";
import SettingsMenu from "./components/SettingsMenu";

const MenuPage = () => {
  const { handlePageIndex } = useApp();
  const isLarge = useIsLarge();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const setFullHeight = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    window.addEventListener("resize", setFullHeight);
    window.addEventListener("load", setFullHeight);
    setFullHeight(); // Panggilan awal

    return () => {
      window.removeEventListener("resize", setFullHeight);
      window.removeEventListener("load", setFullHeight);
    };
  }, []);

  const goToGame = () => handlePageIndex(1);
  const swapSettingsOpen = () => setSettingsOpen((settings) => !settings);

  const ResponsiveButton = ({ icon: Icon, text, onClick, color }) => (
    <button
      className={`btn ${color} mb-3 d-flex align-items-center justify-content-center shadow-lg border-0 rounded-pill`}
      style={{
        fontSize: "1.5rem",
        width: isLarge ? "350px" : "250px",
        padding: "15px 25px",
        transition: "all 0.3s ease",
      }}
      onClick={onClick}
    >
      <Icon style={{ width: "35px", height: "35px" }} />
      <span className="flex-grow-1 text-center ms-3">{text}</span>
    </button>
  );

  return (
    <>
      <SettingsMenu
        settingsOpen={settingsOpen}
        closeSettings={swapSettingsOpen}
      />
      <div
        className="d-flex flex-column align-items-center justify-content-center w-100"
        style={{
          height: "100vh",
          background: "linear-gradient(to bottom right, #00c6ff, #0072ff)",
          color: "white",
          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
        }}
      >
        <span
          className="mb-5 text-center"
          style={{
            fontSize: isLarge ? "5rem" : "3.5rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "3px",
          }}
        >
          Snake Game
        </span>

        <ResponsiveButton
          text="Main"
          onClick={goToGame}
          icon={Play}
          color="btn-primary"
        />
        <ResponsiveButton
          text="Pengaturan"
          onClick={swapSettingsOpen}
          icon={Gear}
          color="btn-secondary"
        />
      </div>

      <div
        className={`position-fixed bottom-0 ${
          isLarge ? "end-0" : "start-50 translate-middle-x"
        } p-2`}
        style={{ zIndex: 10 }}
      >
        <a
          target="_blank"
          href="https://github.com/tk744/super-snake"
          style={{
            textDecoration: "none",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            opacity: 0.8,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            transition: "opacity 0.3s, transform 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = 1;
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = 0.8;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <div className="d-flex flex-column align-items-center">
            <span>Proyek</span>
            <div className="d-flex justify-content-center align-items-center">
              <span style={{ color: "white", margin: 0 }}>Snake Game</span>
            </div>
          </div>
        </a>
      </div>
    </>
  );
};

export default MenuPage;

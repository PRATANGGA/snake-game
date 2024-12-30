import React, { useState } from "react";

import {
  Palette,
  Gear,
  HeartFill,
  Apple,
  Clock,
  Back,
} from "react-bootstrap-icons";

import {
  useSettings,
  backgronudThumbnails,
} from "../../../contexts/SettingsContext";
import { useImages } from "../../../contexts/ImagesContext";
import { useApp } from "../../../contexts/AppContext";

import randomFoodSrc from "/src/assets/images/food/randomFood.png";

import SelectFoodMenu from "./SelectFoodMenu";
import SelectBackgroundMenu from "./SelectBackgroundMenu";
import SettingDisplay from "./SettingDisplay";

const SettingsMenu = ({ settingsOpen, closeSettings }) => {
  const {
    foodIndex,
    foodAmount,
    setFoodAmount,
    backgroundStyleIndex,
    tickTime,
    setTickTime,
    snakeColor,
    setSnakeColor,
    inmortalMode,
    setInmortalMode,
    AIMode,
    setAIMode,
  } = useSettings();
  const { WIDTH_CELLS, HEIGHT_CELLS } = useApp();
  const { foodImages } = useImages();

  const [selectFoodOpen, setSelectFoodOpen] = useState(false);
  const swapSelectFood = () => setSelectFoodOpen((value) => !value);
  const [selectBackgroundOpen, setSelectBackgroundOpen] = useState(false);
  const swapSelectBackground = () => setSelectBackgroundOpen((value) => !value);

  const handleFoodAmountInputChange = (e) => {
    const value = e.target.value;

    if (value.length <= 4) setFoodAmount(value);
  };

  const handleFoodAmountInputBlur = () => {
    let actualValue = parseInt(foodAmount, 10);

    if (isNaN(actualValue) || actualValue < 1) {
      actualValue = 1;
    } else if (actualValue > WIDTH_CELLS * HEIGHT_CELLS) {
      actualValue = WIDTH_CELLS * HEIGHT_CELLS;
    }

    setFoodAmount(actualValue);
  };

  const handleTickTimeInputChange = (e) => {
    const value = e.target.value;

    if (value.length <= 4) setTickTime(value);
  };

  const handleTickTimeInputBlur = () => {
    let actualValue = parseInt(tickTime, 10);

    if (isNaN(actualValue) || actualValue < 1) {
      actualValue = 1;
    } else if (actualValue > 1000) {
      actualValue = 1000;
    }

    setTickTime(actualValue);
  };

  const foodSrc =
    foodIndex === "random" ? randomFoodSrc : foodImages[foodIndex].src;

  const settingsMenuRender = (
    <>
      <SelectFoodMenu
        selectFoodOpen={selectFoodOpen}
        closeMenu={swapSelectFood}
      />
      <SelectBackgroundMenu
        selectBackgroundOpen={selectBackgroundOpen}
        closeMenu={swapSelectBackground}
      />

      <div
        className="d-flex align-items-center justify-content-center position-fixed w-100 h-100 scroll"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 100 }}
      >
        <div
          className="card p-4"
          style={{
            width: "80%",
            maxWidth: "600px",
            maxHeight: "90%",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <h2 className="text-center mb-4" style={{ fontSize: "2.5rem" }}>
            Pengaturan
          </h2>

          {/* Opsi untuk memilih makanan */}
          <SettingDisplay
            setting={
              <div className="d-flex align-items-center">
                <Gear size={30} className="me-3 flex-shrink-0" />
                <h5 className="mb-0 me-3">Pilih makanan</h5>
              </div>
            }
            input={
              foodImages && (
                <img
                  src={foodSrc}
                  style={{
                    width: "40px",
                    height: "40px",
                    imageRendering: "pixelated",
                    cursor: "pointer",
                  }}
                  onClick={swapSelectFood}
                />
              )
            }
          />

          {/* Opsi untuk memilih latar belakang */}
          <SettingDisplay
            setting={
              <div className="d-flex align-items-center">
                <Back size={30} className="me-3 flex-shrink-0" />
                <h5 className="mb-0 me-3">Pilih latar belakang</h5>
              </div>
            }
            input={
              <img
                src={backgronudThumbnails[backgroundStyleIndex]}
                style={{
                  width: "40px",
                  height: "40px",
                  imageRendering: "pixelated",
                  cursor: "pointer",
                }}
                onClick={swapSelectBackground}
              />
            }
          />

          {/* Pilihan warna untuk ular */}
          <SettingDisplay
            setting={
              <div className="d-flex align-items-center">
                <Palette size={30} className="me-3 flex-shrink-0" />
                <h5 className="mb-0 me-3">Warna ular</h5>
              </div>
            }
            input={
              <div className="d-flex align-items-center justify-content-between">
                <input
                  type="color"
                  id="snakeColor"
                  className="form-control form-control-color"
                  value={snakeColor}
                  onChange={(event) => setSnakeColor(event.target.value)}
                />
              </div>
            }
          />

          {/* Opsi untuk menetapkan jumlah makanan */}
          <SettingDisplay
            setting={
              <div className="d-flex align-items-center">
                <Apple size={30} className="me-3 flex-shrink-0" />
                <h5 className="mb-0 me-3">Jumlah makanan</h5>
              </div>
            }
            input={
              <div className="form-check form-switch ps-0">
                <input
                  className="form-control"
                  type="number"
                  value={foodAmount}
                  onChange={handleFoodAmountInputChange}
                  onBlur={handleFoodAmountInputBlur}
                  min="1"
                  max={WIDTH_CELLS * HEIGHT_CELLS}
                  style={{ width: "80px" }}
                />
              </div>
            }
          />

          {/* Opsi untuk menetapkan waktu per tick */}
          <SettingDisplay
            setting={
              <div className="d-flex align-items-center">
                <Clock size={30} className="me-3 flex-shrink-0" />
                <h5 className="mb-0">Waktu per tick (ms)</h5>
              </div>
            }
            input={
              <div className="form-check form-switch ps-0">
                <input
                  className="form-control"
                  type="number"
                  value={tickTime}
                  onChange={handleTickTimeInputChange}
                  onBlur={handleTickTimeInputBlur}
                  min="1"
                  max="1000"
                  style={{ width: "80px" }}
                />
              </div>
            }
          />

          {/* Opsi untuk mengaktifkan/menonaktifkan mode kecerdasan buatan */}
          <SettingDisplay
            setting={
              <div className="d-flex align-items-center">
                <Gear size={30} className="me-3 flex-shrink-0" />
                <h5 className="mb-0 me-3">Mode Otomatis</h5>
              </div>
            }
            input={
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={AIMode}
                  onChange={() => setAIMode((AIMode) => !AIMode)}
                  style={{ width: "40px", height: "25px" }}
                />
              </div>
            }
          />

          {/* Opsi untuk mengaktifkan/menonaktifkan mode abadi */}
          <SettingDisplay
            setting={
              <div className="d-flex align-items-center">
                <HeartFill size={30} className="me-3 flex-shrink-0" />
                <h5 className="mb-0 me-3">Mode abadi</h5>
              </div>
            }
            input={
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={inmortalMode}
                  onChange={() =>
                    setInmortalMode((inmortalMode) => !inmortalMode)
                  }
                  style={{ width: "40px", height: "25px" }}
                />
              </div>
            }
          />

          {/* Tombol untuk menutup menu pengaturan */}
          <div className="text-end">
            <button className="btn btn-secondary" onClick={closeSettings}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return settingsOpen ? settingsMenuRender : null;
};

export default SettingsMenu;

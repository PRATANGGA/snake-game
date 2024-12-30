import React, { useCallback, useEffect, useState } from "react";

import GameArea from "./components/GameArea.jsx";
import ControlPad from "./components/ControlPad.jsx";
import GameOver from "./components/GameOver.jsx";
import GameWin from "./components/GameWin.jsx";
import InfoDisplayItem from "./components/InfoDisplayItem.jsx";
import ArrowsTutorial from "./components/ArrowsTutorial.jsx";

import soundOnSrc from "/src/assets/images/soundOn.png";
import soundOffSrc from "/src/assets/images/soundOff.png";
import timeImageSrc from "/src/assets/images/time.png";
import randomFoodSrc from "/src/assets/images/food/randomFood.png";
import ChangeOrientationScreen from "../game/components/ChangeOrientationScreen";

import { useApp } from "../../contexts/AppContext.jsx";
import { useSettings } from "../../contexts/SettingsContext.jsx";
import { useImages } from "../../contexts/ImagesContext.jsx";
import { useSnakeAI } from "./components/SnakeAI.jsx";
import { useScreenOrientation } from "../../hooks/useScreenOrientation.jsx";

import { isMobile } from "react-device-detect";
import { backgroundStyles } from "../../contexts/SettingsContext.jsx";
import { useAudio } from "../../hooks/useAudio.jsx";

/**
 * Komponen GamePage adalah halaman utama untuk permainan Snake.
 * Komponen ini mengelola logika permainan, termasuk pergerakan ular,
 * deteksi tabrakan, dan pengelolaan makanan.
 *
 * @returns {JSX.Element} Elemen JSX yang mewakili halaman permainan.
 *
 * Hook yang digunakan:
 * - useApp: Mengambil konfigurasi permainan seperti ukuran sel, arah awal, posisi awal ular, dll.
 * - useSettings: Mengambil pengaturan permainan seperti jumlah makanan, mode imortal, mode AI, dll.
 * - useImages: Mengambil gambar makanan.
 * - useAudio: Mengambil fungsi untuk memainkan efek suara.
 * - useSnakeAI: Mengambil logika AI untuk menggerakkan ular.
 * - useScreenOrientation: Mengambil orientasi layar saat ini.
 *
 * State yang dikelola:
 * - timer: Menghitung waktu permainan.
 * - startTime: Waktu mulai permainan.
 * - finishTime: Waktu selesai permainan.
 * - firstRender: Menandai apakah ini render pertama.
 * - snake: Posisi ular saat ini.
 * - foodList: Daftar posisi makanan saat ini.
 * - score: Skor permainan saat ini.
 * - nextDir: Daftar arah berikutnya yang akan diambil ular.
 * - dir: Arah saat ini yang diambil ular.
 * - gameStatus: Status permainan (0: Belum Dimulai, 1: Dimulai, 2: GameOver, 3: Menang).
 *
 * Fungsi utama:
 * - getRandomInt: Menghasilkan bilangan bulat acak.
 * - generateFood: Menghasilkan posisi makanan baru.
 * - foodCollision: Memeriksa apakah ular bertabrakan dengan makanan.
 * - bodyCollision: Memeriksa apakah ular bertabrakan dengan tubuhnya sendiri.
 * - wallCollision: Memeriksa apakah ular bertabrakan dengan dinding.
 * - checkCollision: Memeriksa apakah ada tabrakan.
 * - checkWin: Memeriksa apakah pemain menang.
 * - handleDir: Mengelola arah pergerakan ular berdasarkan input pengguna.
 * - onStart: Memulai permainan.
 * - playAgain: Mengulang permainan.
 * - getTimeString: Menghasilkan string waktu yang telah berlalu sejak permainan dimulai.
 *
 * Komponen tambahan:
 * - SoundButton: Tombol untuk mengaktifkan/mematikan suara.
 *
 * Efek samping:
 * - useEffect untuk menangani input keyboard dan interval permainan.
 * - useEffect untuk menangani logika permainan setiap tick.
 * - useEffect untuk menangani perubahan ukuran layar.
 */
const GamePage = () => {
  const {
    WIDTH_CELLS,
    HEIGHT_CELLS,
    CELL_SIZE,
    DIR_START,
    SNAKE_START,
    DIRECTIONS,
    FOOD_START,
    handlePageIndex,
  } = useApp();
  const { foodIndex, foodAmount, inmortalMode, AIMode } = useSettings();
  const { foodImages } = useImages();
  const { tickTime, backgroundStyleIndex, sound, setSound } = useSettings();
  const { playAppleCrunch, playSnakeHit, playSnakeMove } = useAudio();
  const snakeAI = useSnakeAI();
  const screenOrientation = useScreenOrientation();

  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(undefined);
  const [finishTime, setFinishTime] = useState(undefined);
  const [firstRender, setFirstRender] = useState(true);

  const [snake, setSnake] = useState(SNAKE_START);
  const [foodList, setFoodList] = useState([FOOD_START]);
  const [score, setScore] = useState(0);

  const [nextDir, setNextDir] = useState([]);
  const [dir, setDir] = useState(DIR_START);

  const [gameStatus, setGameStatus] = useState(0); // 0 Not Started, 1 Started, 2 GameOver, 3 Win

  const getRandomInt = (max) => Math.floor(Math.random() * max);
  const generateFood = (snake, foodList) => {
    let newFoodList = [...foodList];

    while (
      newFoodList.length < foodAmount &&
      WIDTH_CELLS * HEIGHT_CELLS - snake.length > newFoodList.length
    ) {
      const generatedFood = {
        x: getRandomInt(WIDTH_CELLS),
        y: getRandomInt(HEIGHT_CELLS),
      };
      const isOnSnake = snake.some(
        (segment) =>
          segment.x === generatedFood.x && segment.y === generatedFood.y
      );
      const isOnFood = newFoodList.some(
        (food) => food.x === generatedFood.x && food.y === generatedFood.y
      );

      if (!isOnSnake && !isOnFood) newFoodList.push(generatedFood);
    }

    setFoodList(newFoodList);
  };

  const foodCollision = (snake) =>
    foodList.filter(
      (food) => snake[0].x === food.x && snake[0].y === food.y
    )[0];
  const bodyCollision = (snake) =>
    snake
      .slice(1)
      .some((segment) => segment.x === snake[0].x && segment.y === snake[0].y);
  const wallCollision = (snake) =>
    snake[0].x < 0 ||
    snake[0].y < 0 ||
    snake[0].x >= WIDTH_CELLS ||
    snake[0].y >= HEIGHT_CELLS;
  const checkCollision = (snake) =>
    bodyCollision(snake) || wallCollision(snake);
  const checkWin = (snake) => snake.length === WIDTH_CELLS * HEIGHT_CELLS;
  const handleDir = useCallback(
    (keyCode) => {
      const newDir = DIRECTIONS[keyCode];

      if (newDir) {
        setNextDir((actualNextDir) => {
          const updatedNextDir = [...actualNextDir];

          // Si la cola esta llena, reemplazamos el ultimo, si no añadimos al final
          if (updatedNextDir.length < 2) {
            //updatedNextDir[1] = newDir;
            if (!updatedNextDir.some((dir) => dir === newDir))
              updatedNextDir.push(newDir);
          }
          return updatedNextDir;
        });

        if (gameStatus !== 1) {
          // Si el juego no esta iniciado
          const [dx, dy] = newDir; // Si es un primer movimiento valido
          if (
            snake[0].x + dx !== snake[1].x ||
            snake[0].y + dy !== snake[1].y
          ) {
            setStartTime(Date.now()); // Guardamos tiempo inicio
            setGameStatus(1); // Iniciamos el juego
          }
        }
      }
    },
    [gameStatus]
  );

  useEffect(() => {
    const handleKeyDown = (event) => handleDir(event.keyCode);
    if (!AIMode && gameStatus <= 1)
      // Si no es modo auto y esta en juego o esperando, procesamos los movimientos
      document.addEventListener("keydown", handleKeyDown);

    let interval; // Timer para disparar el metodo logica cada tickTime
    if (gameStatus === 1)
      // Solo si el juego esta en marcha
      interval = setInterval(() => setTimer((timer) => timer + 1), tickTime);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [gameStatus]);

  useEffect(() => {
    // THIS METHOD EXECUTES EACH TICK
    if (gameStatus === 1) {
      // Si el juego está en marcha
      let actualDir;

      let i = 0;
      while (i < nextDir.length && actualDir === undefined) {
        const [dx, dy] = nextDir[i];
        if (snake[0].x + dx !== snake[1].x || snake[0].y + dy !== snake[1].y)
          actualDir = nextDir[i];

        i++;
      }

      if (actualDir && actualDir !== dir) {
        // sonido
        if (sound) playSnakeMove();
      }

      if (actualDir === undefined) actualDir = dir;
      else {
        setDir(actualDir);
        setNextDir((actualNextDir) => actualNextDir.slice(i));
      }

      const newSnake = [...snake];
      const head = {
        x: newSnake[0].x + actualDir[0],
        y: newSnake[0].y + actualDir[1],
      };
      newSnake.unshift(head); // Desplazamos la cabeza

      const foodEaten = foodCollision(newSnake);
      if (!foodEaten) {
        newSnake.pop(); // Si no comemos manzana, quitamos la cola

        const isCollision = checkCollision(newSnake);
        if (isCollision && !inmortalMode) {
          // Perdemos si hay colisión
          if (sound) playSnakeHit(); // sonido

          setFinishTime(Date.now());
          setGameStatus(2);
        }

        if (!isCollision) setSnake(newSnake);
      } else {
        // Si comemos manzana, generamos otra y sumamos puntos y no quitamos la cola este tick
        if (sound) playAppleCrunch(); // sonido

        const newFoodList = foodList.filter((food) => food !== foodEaten);
        setFoodList(newFoodList);

        if (!checkWin(newSnake)) generateFood(newSnake, newFoodList);
        // Si no ganamos generamos otra manzana
        else {
          // Ganamos si esta el tablero lleno
          setFinishTime(Date.now());
          setGameStatus(3);
        }

        setScore((prevScore) => prevScore + 1);
        setSnake(newSnake);
      }

      if (AIMode) {
        const nextMove = snakeAI.calculateNextMove(newSnake);
        handleDir(nextMove);
      }
    }
  }, [timer]);

  const onStart = () => {
    generateFood(SNAKE_START, [FOOD_START]);

    if (AIMode) {
      // Calc first move
      const nextMove = snakeAI.calculateNextMove(snake);
      handleDir(nextMove);
    }
  };

  useEffect(() => {
    if (!firstRender)
      playAgain(); // Si cambia la pantalla de tamaño, empezamos de nuevo
    else {
      // En el primer render solo generamos la comida, no empezamos de nuevo
      setFirstRender(false);

      onStart();
    }
  }, [WIDTH_CELLS, HEIGHT_CELLS]);

  const playAgain = () => {
    setTimer(0);
    setStartTime(undefined);
    setFinishTime(undefined);

    setSnake(SNAKE_START);
    setFoodList([FOOD_START]);
    setScore(0);
    setNextDir([]);
    setDir(DIR_START);
    if (!AIMode) setGameStatus(0);
    else setStartTime(Date.now());

    onStart();
  };

  const backgroundStyle = backgroundStyles[backgroundStyleIndex];
  const foodIconSrc =
    foodIndex === "random" ? randomFoodSrc : foodImages[foodIndex].src;
  const getTimeString = () => {
    const time =
      ((finishTime ?? Date.now()) - (startTime ?? Date.now())) / 1000;
    const seconds = Math.floor(time) % 60;
    const minutes = Math.floor((time / 60) % 60);

    return (minutes > 0 ? minutes + "m " : "") + seconds + "s";
  };

  const SoundButton = () => (
    <div
      style={{ cursor: "pointer", marginRight: CELL_SIZE }}
      onClick={() => setSound((sound) => !sound)}
    >
      <img
        src={sound ? soundOnSrc : soundOffSrc}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );

  if (isMobile && screenOrientation.includes("landscape"))
    return <ChangeOrientationScreen />;

  return (
    <>
      <GameOver
        gameStatus={gameStatus}
        playAgain={playAgain}
        score={score}
        time={getTimeString()}
      />
      <GameWin
        gameStatus={gameStatus}
        playAgain={playAgain}
        score={score}
        time={getTimeString()}
      />

      <div className="d-flex flex-column justify-content-center align-items-center position-fixed w-100 h-100 bg-black">
        <div className="d-flex flex-column">
          <div
            className="d-flex justify-content-between align-items-center"
            style={{
              width: (WIDTH_CELLS + 2) * CELL_SIZE,
              height: 2 * CELL_SIZE,
              backgroundColor: backgroundStyle[3],
            }}
          >
            <div className="d-flex" style={{ marginLeft: CELL_SIZE }}>
              <div style={{ marginRight: CELL_SIZE }}>
                <InfoDisplayItem imageSrc={foodIconSrc} text={score} />
              </div>
              <div>
                <InfoDisplayItem
                  imageSrc={timeImageSrc}
                  text={getTimeString()}
                />
              </div>
            </div>
            <div
              className="d-flex align-items-center"
              style={{ marginRight: CELL_SIZE }}
            >
              <SoundButton />
              <button
                className="btn btn-danger p-0"
                style={{
                  width: CELL_SIZE * 2 * 1.25,
                  height: CELL_SIZE * 1.25,
                }}
                onClick={() => handlePageIndex(0)}
              >
                <span style={{ fontSize: CELL_SIZE / 1.5 }}>Keluar</span>
              </button>
            </div>
          </div>

          <div
            className="position-relative d-flex justify-content-center align-items-center"
            style={{
              width: (WIDTH_CELLS + 2) * CELL_SIZE,
              height: (HEIGHT_CELLS + 2) * CELL_SIZE,
              backgroundColor: backgroundStyle[2],
            }}
          >
            <ArrowsTutorial condition={gameStatus === 0} />
            <GameArea
              snake={snake}
              foodList={foodList}
              gameStatus={gameStatus}
            />
          </div>
        </div>

        <ControlPad onKeyDown={handleDir} />
      </div>
    </>
  );
};

export default GamePage;

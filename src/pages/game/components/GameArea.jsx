import { useEffect, useRef, useState } from "react";
import { useApp } from "../../../contexts/AppContext.jsx";
import { useSettings } from "../../../contexts/SettingsContext.jsx";
import { useImages } from "../../../contexts/ImagesContext.jsx";
import { cantorize, decantorize, isTwist, calcOrientation } from "../../../utils/MathUtils.jsx";
import { useCanvasUtils } from "../../../utils/CanvasUtils.jsx";
import { backgroundStyles } from "../../../contexts/SettingsContext.jsx";

const GameArea = ({ snake, foodList, gameStatus }) => {
    const { WIDTH_CELLS, HEIGHT_CELLS, CELL_SIZE } = useApp();
    const { foodIndex, backgroundStyleIndex } = useSettings();
    const { snakeImages, foodImages } = useImages();

    const [foodListType, setFoodListType] = useState({});

    const canvasRef = useRef(null);
    const canvasUtils = useCanvasUtils(canvasRef, CELL_SIZE);

    useEffect(() => {
        const newFoodListType = { ...foodListType };
        const foodTypes = Object.keys(foodImages);

        foodList.forEach(food => {
            const id = cantorize(food.x, food.y);
            if (!foodListType[id]) {
                let foodKey = foodIndex;
                if (foodKey === "random") {
                    foodKey = foodTypes[Math.floor(Math.random() * foodTypes.length)];
                }
                newFoodListType[id] = foodKey;
            }
        });

        const foodListIds = new Set(foodList.map(food => cantorize(food.x, food.y).toString()));
        Object.keys(newFoodListType).forEach(foodId => {
            if (!foodListIds.has(foodId)) {
                delete newFoodListType[foodId];
            }
        });

        setFoodListType(newFoodListType);
    }, [foodList]);

    useEffect(() => {
        const { clearRect, drawImage, translate, drawRotatedImage, fillRect } = canvasUtils;
        if (!canvasRef.current) return;

        // Limpia el canvas
        clearRect(0, 0, WIDTH_CELLS, HEIGHT_CELLS);

        // Fondo
        const drawBackground = () => {
            const backgroundStyle = backgroundStyles[backgroundStyleIndex];
            const oddColor = backgroundStyle[0];
            const evenColor = backgroundStyle[1];

            for (let i = 0; i < WIDTH_CELLS; i++) {
                for (let j = 0; j < HEIGHT_CELLS; j++) {
                    const cellColor = ((i + j) % 2 === 0) ? oddColor : evenColor;
                    fillRect(cellColor, i, j, 1, 1);
                }
            }
        };
        drawBackground();

        // Comida
        const drawFood = () => {
            Object.keys(foodListType).forEach(foodId => {
                const { x, y } = decantorize(foodId);
                const foodKey = foodListType[foodId];
                const foodImage = foodImages[foodKey];

                drawImage(foodImage, x, y, 1, 1);
            });
        };
        drawFood();

        // Cabeza
        const drawSnakeHead = () => {
            const headAngle = calcOrientation(snake, 0, 1);
            const headX = snake[0].x;
            const headY = snake[0].y;

            let snakeHead;
            if (gameStatus === 2) snakeHead = snakeImages.headDead; // Si muerto cabeza muerto
            else { // Si no normal o boca abierta
                const foodDistances = foodList.map(food => Math.sqrt(Math.pow((headX - food.x), 2) + Math.pow((headY - food.y), 2)));
                const closeFood = foodDistances.some(distance => distance <= 2.5);

                snakeHead = closeFood ? snakeImages.headOpenMouth : snakeImages.head;
            }

            drawRotatedImage(snakeHead, headX, headY, 1, 1, headAngle);
        };
        drawSnakeHead();

        // Cuerpo
        const drawSnakeBody = () => {
            snake.forEach((segment, index) => {
                if (index > 0 && index < snake.length - 1) {
                    const bodyAngle = calcOrientation(snake, index, index + 1);
                    const twist = isTwist(snake, index);

                    const bodyImage = snakeImages.body;
                    const bodyTwistImage = snakeImages.bodyTwist;
                    const bodyX = segment.x;
                    const bodyY = segment.y;

                    const finalBodyImage = twist === 0 ? bodyImage : bodyTwistImage;
                    const finalBodyAngle = bodyAngle + (twist === 2 ? Math.PI / 2 : 0);

                    drawRotatedImage(finalBodyImage, bodyX, bodyY, 1, 1, finalBodyAngle);
                }
            });
        };
        drawSnakeBody();

        // Cola
        const drawSnakeTail = () => {
            const tailAngle = calcOrientation(snake, snake.length - 2, snake.length - 1);
            const tailImage = snakeImages.tail;
            const tailX = snake[snake.length - 1].x;
            const tailY = snake[snake.length - 1].y;

            drawRotatedImage(tailImage, tailX, tailY, 1, 1, tailAngle);
        };
        drawSnakeTail();
    }, [snake, foodListType, canvasUtils]);

    return (
        <div
            className="position-relative d-flex justify-content-center align-items-center"
            style={{
                width: WIDTH_CELLS * CELL_SIZE,
                height: HEIGHT_CELLS * CELL_SIZE,
                position: "relative"
            }}
        >
            <canvas ref={canvasRef} style={{
                width: '100%',
                height: '100%',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
            }} />
        </div>
    );
};

export default GameArea;

import { Engine, Render, Runner, Bodies, World, Body, Events} from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  },
});

const world = engine.world;

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" },
  label: "topLine",
});

World.add(world, [ground, leftWall, rightWall, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let interval = null;
let disableAction = false;

function addCurrentFruit() {
  const randomFruit = getRandomFruit();

  const body = Bodies.circle(300, 50, randomFruit.radius, {
    label: randomFruit.label,
    isSleeping: true,
    render: {
      sprite: { texture: `${randomFruit.label}.png` },
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = randomFruit;

  World.add(world, body);
}

function getRandomFruit() {
  const randomIndex = Math.floor(Math.random() * 5);
  const fruit = FRUITS[randomIndex];

  if (currentFruit && currentFruit.label === fruit.label)
    return getRandomFruit();

  return fruit;
}

window.onkeydown = (event) => {
  event.preventDefault();

  if (disableAction)
    return;

  switch (event.code) {
    case "KeyA": // ArrowLeft
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "KeyD": // ArrowRight
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "KeyS": // Space
      disableAction = true;

      currentBody.isSleeping = false;

      setTimeout(() => {
        addCurrentFruit();
        disableAction = false;
      }, 1000);

  }
};

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA": // ArrowLeft
    case "KeyD": // ArrowRight
      clearInterval(interval);
      interval = null;
  }
};

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.label === collision.bodyB.label) {
      World.remove(world, [collision.bodyA, collision.bodyB]);

      const index = FRUITS.findIndex((fruit) => 
        fruit.label === collision.bodyA.label
      );

      if (index === FRUITS.length - 1)
        return;

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.label}.png` },
          },
          label: newFruit.label,
        }
      );

      World.add(world, newBody);
    }

    if (
      (collision.bodyA.label === "topLine" || collision.bodyB.label === "topLine")
      && !disableAction
    ) {
      alert("Game over");
    }
  });
});

addCurrentFruit();

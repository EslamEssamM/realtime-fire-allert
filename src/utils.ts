// utils.js
export const makeRandomScreen = () => {
  return {
    name: `Screen ${Math.floor(Math.random() * 100)}`,
    direction: ["left", "right", "front", "back"][
      Math.floor(Math.random() * 4)
    ],
    message: "Fire detected!",
  };
};

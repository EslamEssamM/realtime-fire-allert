import { createContext } from "react";
// @ts-ignore
import React from "react";
import { Screen } from "../types/collections/screen";

// Define the shape of the context
interface ScreensContextProps {
  screens: Screen[];
  setScreens: React.Dispatch<React.SetStateAction<Screen[]>>;
}

// Create the context
const ScreensContext = createContext<ScreensContextProps | undefined>(
  undefined
);

export const useScreensContext = (): ScreensContextProps => {
  const context = React.useContext(ScreensContext);

  if (!context) {
    throw new Error("useScreensContext must be used within a ScreensProvider");
  }
  return context;
};

export default ScreensContext;

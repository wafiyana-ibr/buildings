// src/hooks/useTheme.js
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeProvider";

export const useTheme = () => {
    return useContext(ThemeContext);
};
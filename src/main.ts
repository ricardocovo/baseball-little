import "./styles/main.css";
import { App } from "./ui/App.ts";
import { bootstrapTheme } from "./ui/theme.ts";

bootstrapTheme();

const root = document.getElementById("app");
if (root) {
  new App(root);
}


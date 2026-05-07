import "./styles/main.css";
import { App } from "./ui/App.ts";

const root = document.getElementById("app");
if (root) {
  new App(root);
}


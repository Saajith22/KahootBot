import { registerFont, createCanvas } from "canvas";
import path from "path";

export function loadFont() {
  registerFont(path.join(__dirname, "..", "..", "fonts", "kahoot.ttf"), {
    family: "Montserrat",
  });
}

export async function createBoard() {
  loadFont();

  const canvas = createCanvas(700, 550);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#864cbf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = `40px "Montserrat"`;
  ctx.fillText("Kahoot!", 50, 50);

  return canvas.toBuffer();
}

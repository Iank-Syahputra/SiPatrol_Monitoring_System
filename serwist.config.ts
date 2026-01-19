import { defineConfig } from "serwist";

export default defineConfig({
  globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2}"],
  swSrc: "./src/lib/sw.ts",
  swDest: "./public/sw.js",
  injectionPoint: "self.__SW_MANIFEST",
});
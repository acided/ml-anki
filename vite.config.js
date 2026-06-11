import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: '/' — для кастомного домена (CNAME).
// Если будешь хостить на username.github.io/REPO без домена — поменяй на '/REPO/'.
export default defineConfig({
  base: "/",
  plugins: [react()],
});

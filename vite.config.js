import { defineConfig } from 'vite'
import gltf from 'vite-plugin-glsl'

export default defineConfig({
  assetsInclude: ["**/*.glb"],
  plugins: [
    gltf()
  ]
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/fast_food_delivery_Ecommerce_CI_CD_Three_Tier_System/',
})

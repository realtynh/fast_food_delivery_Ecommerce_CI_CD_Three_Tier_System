import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import 'dotenv/config' 
import orderRouter from "./routes/orderRoute.js"
import healthRoute from "./routes/healthRoute.js"



// app config
const app = express()
const port = process.env.PORT || 4000;

//------------------------------------
//  CORS cấu hình cụ thể cho GitHub Pages
// const allowedOrigins = [
//   "https://realtynh.github.io",
//   "https://fast-food-delivery-ecommerce-ci-cd.vercel.app"
// ];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//   }
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");

//   // ✅ Đáp lại preflight request (OPTIONS)
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });
// -----------------------------------

//middleware
app.use(express.json())
app.use(cors())

// db connection
connectDB();

// api endpoints
app.use("/api/food",foodRouter)
app.use('/images', express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("health",healthRoute)


app.get("/",(req,res)=> {
    res.send("API Working")
})
app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

//mongodb+srv://ThanhTinh:57819234@cluster0.qp2vzrq.mongodb.net/?

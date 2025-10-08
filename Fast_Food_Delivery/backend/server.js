import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import 'dotenv/config' 
import orderRouter from "./routes/orderRoute.js"



// app config
const app = express()
const port = 4000

//middleware
app.use(express.json())
app.use(cors())
//------------------------------------
//  Cấu hình CORS cho frontend github pages
const allowedOrigins = [
  "https://realtynh.github.io", // frontend trên GitHub Pages
  "https://fast-food-delivery-ecommerce-ci-cd.vercel.app", // backend domain chính trên Vercel (optional)
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép nếu không có origin (Postman) hoặc nằm trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
// -----------------------------------
// db connection
connectDB();

// api endpoints
app.use("/api/food",foodRouter)
app.use('/images', express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)


app.get("/",(req,res)=> {
    res.send("API Working")
})
app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

//mongodb+srv://ThanhTinh:57819234@cluster0.qp2vzrq.mongodb.net/?

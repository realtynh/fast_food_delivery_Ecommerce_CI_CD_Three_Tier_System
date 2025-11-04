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
app.use("/health",healthRoute)


app.get("/",(req,res)=> {
    res.send("API Working")
})

// export default app;

// app.listen(port,()=>{
//     console.log(`Server Started on http://localhost:${port}`)
// })

if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`Server Started`);
    });
}

export default app;


//mongodb+srv://ThanhTinh:57819234@cluster0.qp2vzrq.mongodb.net/?

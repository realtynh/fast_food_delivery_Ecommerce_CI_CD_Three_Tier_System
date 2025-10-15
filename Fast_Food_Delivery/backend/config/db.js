import mongoose from "mongoose";


export const connectDB = async () => {
    // the string which insert in connect function . we can get it in mongodb atlas cloud in 'network access' field.
    // delete '?' and insert name of project behind the '/'
    await mongoose.connect('mongodb+srv://ThanhTinh:57819234@cluster0.qp2vzrq.mongodb.net/fast-food-delivery').then(()=>{console.log("DB connect")})
    //await mongoose.connect(process.env.MONGODB_URL).then(()=>{console.log("DB connect")})
}

import mongoose from "mongoose";
import 'dotenv/config'; 


export const connectDB = async () => {
    // theo dõi logs. bật debug in tất cả ra console.
    mongoose.set('debug', true);
    // the string which insert in connect function . we can get it in mongodb atlas cloud in 'network access' field.
    // delete '?' and insert name of project behind the '/'
    const string_connect = process.env.STRING_CONNECT_MONGO
    await mongoose.connect('mongodb+srv://ThanhTinh:57819234@cluster0.qp2vzrq.mongodb.net/fast-food-delivery').then(()=>{console.log("DB connect")})
    

}

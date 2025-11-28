// import * as Sentry from "@sentry/node";
import userModel from "../models/userModel.js"

// add item to user's cart

const addToCart = async (req,res) =>{
    try {

        // --- TẠO LỖI CỐ Ý TẠI ĐÂY ---
        // Dòng này sẽ gây ra TypeError
         const testCrash = undefined;
         testCrash.forceError = 1; 
        // --- HẾT LỖI CỐ Ý ---

        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1
        }
        else{
            cartData[req.body.itemId] += 1
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Added to Cart"});
    } catch (error) {
        console.log(error);
        // BƯỚC 2: Báo cáo thủ công cho Sentry biết
        Sentry.captureException(error);
        // nêu muốn tự động thì thay vì dùng res json thì next()
        // next(error)
        res.json({success:false,message:"Error"});
        // res.status(500).json({ success: false, message: error.message });
        
    }
}

// remove item from user cart

const removeFromCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;

        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Removed from Cart"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
              
    }
}

// fetch user cart data 
const getCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        res.json({success:true,cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {addToCart,removeFromCart,getCart}

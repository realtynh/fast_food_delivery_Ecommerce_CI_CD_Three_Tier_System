/*import express from "express"
import { addFood , listFood, removeFood} from "../controllers/foodController.js"
import multer from "multer"

const foodRouter = express.Router();
*/

// image Storage Engine

/* const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})

foodRouter.post("/add",upload.single("image"),addFood)
foodRouter.get("/list",listFood)
foodRouter.post("/remove",removeFood)



export default foodRouter;
*/
import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

// ==========================
//  Use memory storage (Vercel-compatible)
// ==========================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==========================
//  Routes
// ==========================
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;

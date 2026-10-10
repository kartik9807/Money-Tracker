import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import path from "path"
import cookieParser from "cookie-parser"
const app = express();

//? middlewares
app.use(cors({
    origin:"http://localhost:5173" ,
    credentials:true
}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.json({limit:"16kb"})); // data limitation
app.use(express.urlencoded({extended:true,limit:"16kb"}));
// console.log(import.meta); 
// console.log(import.meta.filename);

app.use(express.static(path.join(import.meta.dirname,'public')))

app.get('/',(_,res)=>{
    res.send("working!!!")
})

// importing routes
import userRouter from "../src/routes/user.route.js"
import notifcationRouter from "../src/routes/notification.route.js"

//? custom error middleware 
import { errorHandler } from "./middlewares/error.middleware.js"

// declaring routes
app.use('/api/v1/users',userRouter);
app.use('/api/v1/notifications',notifcationRouter)

app.use(errorHandler)
export default app
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import path from "path"
import cookieParser from "cookie-parser"
const app = express();

//? middlewares
app.use(cors({
    origin:process.env.FRONTEND_URL ,
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
import notificationRouter from "../src/routes/notification.route.js"
import accountRouter from "../src/routes/account.route.js"
import transactionRouter from "../src/routes/transaction.route.js"

//? custom error middleware 
import { errorHandler } from "./middlewares/error.middleware.js"

// declaring routes
app.use('/api/v1/users',userRouter);
app.use('/api/v1/notifications',notificationRouter)
app.use('/api/v1/account',accountRouter)
app.use('/api/v1/transactions',transactionRouter)

app.use(errorHandler)
export default app
import "dotenv/config";
import app from './src/app.js'
import connectDB from "./src/db/db.js"

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is running on ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.error(`MongoDB connection failed ${err}`);
    throw err;
})
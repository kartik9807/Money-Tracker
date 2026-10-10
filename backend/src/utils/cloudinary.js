import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
// console.log("Cloudinary Config:",process.env.CLOUDINARY_API_SECRET,process.env.CLOUDINARY_API_KEY,process.env.CLOUDINARY_CLOUD_NAME);
    
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        const upload = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log(`file is been uploaded successfully ${upload}`);
        fs.unlinkSync(localFilePath);
        fs.Dirent(localFilePath).removeSync();
        return upload;

    } catch (err) {
        console.error(`fail to upload on cloudinary server ${err}`);
        fs.unlinkSync(localFilePath);
        fs.Dirent(localFilePath).removeSync();
        throw err;
    }
}

export default uploadOnCloudinary
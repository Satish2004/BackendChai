// this is the page where we can store the file in clodinary
//   it take the File path in local Server as temporary and store in cloudinary
// once it stores the file in cloudinary then unlink from the local server

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// Configuration ki env me kya kya hoga
cloudinary.config({
  cloud_name: process.env.CLODUDINARY_NAME,
  api_key: process.env.CLODUDINARY_API_KEY,
  api_secret: process.env.CLODUDINARY_SECRET_KEY,
});

const uploadFileOnCloudinary = async (localFilePath) => {
  try {
    // if loacalPath exist hi ni krta hai to return null user ko
    if (!localFilePath) return null;

    // else take the url from localPAth then upload on cloudinary
    const responseFromCloudinary = await cloudinary.uploader.upload(
      localFilePath,
      {
        resouce_type: "auto", // sab k liye allow pdf , img , video
      }
    );
    // console.log("file has been uploaded", responseFromCloudinary.url);
    // upload hone ke baad local file ko remove kro
    fs.unlinkSync(localFilePath); // hona hi chaiye synchronous form me
    return responseFromCloudinary;
  } catch (error) {
    fs.unlinkSync(localFilePath); // hona hi chaiye synchronous form me
    // its remove the locally saved file when uploader method failed because if we are not remove this file , some malicious file inject the file
    return null;
  }
};
export { uploadFileOnCloudinary };

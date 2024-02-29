import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// const uploadCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;
//     // upload the file on cloudinayr
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     // file has been uploaded successfull

//     console.log("file is uploaded on cloudinary", response.url);
//     return response;
//   } catch (err) {
//     fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
//   }
// };



const uploadCloudinary = async (localFilePath) => {
  try {


    console.log(`local file pathe >> ${localFilePath}`);
    const result = await cloudinary.uploader.upload(localFilePath, { folder: 'temp' });
    console.log('Cloudinary upload result:', result);
    fs.unlinkSync(localFilePath)
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};



export { uploadCloudinary };

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // used for file handling

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file to the cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded
    fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation performed
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation failed
    console.error(`Error, file: ${localFilePath} deleted`, error);
    return null;
  }
};

const deleteOnCloudinary = async (imageUrl) => {
  try {
    // get the derived_resource(display name in cloudinary)
    const cloudinaryPublicId = imageUrl.match(/\/v\d+\/([^/.]+)\./)[1];

    // delete in cloudinary
    const response = await cloudinary.api.delete_resources([
      `${cloudinaryPublicId}`,
    ]);

    //return the response
    return response;
  } catch (error) {
    console.error("Error deleting the image in cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };

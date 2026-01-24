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

const deleteOnCloudinary = async (fileUrl) => {
  try {
    // get the derived_resource(display name in cloudinary)
    const cloudinaryPublicId = fileUrl.match(/\/v\d+\/([^/.]+)\./)[1];

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

const uploadVideoOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  /*
  Note: cloudinary.uploader.upload_large() returns a Chunkable stream if no callback is provided,
  instead of a Promise. The Chunkable emits events (finish, error) when upload completes.
  To use async/await and get the final uploaded file info (URL, public_id, etc.),
  we wrap upload_large in a Promise that resolves in the callback. 
  This ensures 'await' waits for the upload to finish and gives the actual response.
*/

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      localFilePath,
      { resource_type: "auto", chunk_size: 6000000 },
      (error, result) => {
        fs.unlinkSync(localFilePath); // always delete temp file
        if (error) return reject(error); // send error to caller
        resolve(result); // send final response to caller
      },
    );
  });
};

export { uploadOnCloudinary, deleteOnCloudinary, uploadVideoOnCloudinary };

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cd(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /\.(mp4|avi|mkv)$/i;
  const extname = fileTypes.test(
    Path2D.extname(file.originalname).toLowerCase(),
  );

  if (extname) {
    return cb(null, true);
  } else {
    cb("Error: Videos Only");
  }
};

export const uploadVideo = multer({ storage, fileFilter });

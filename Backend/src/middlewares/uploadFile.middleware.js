import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed"), false);
  } else {
    cb(null, true);
  }
};

export const uploadFile = multer({ storage, fileFilter });

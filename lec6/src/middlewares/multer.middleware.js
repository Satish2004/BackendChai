// for file uploading take the local file path and help to uplaod into the cloudinary  --> blueprint hai smjho
import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
// ab ise routes ke andar inject krna hai register hone se phle
// isme ek methd hoti hai upload.fields uske andar apne sare photo jo cloudinary se lena chahte ho use inject kr do

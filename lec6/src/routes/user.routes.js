//step 1 -> import
import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refereshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImg,
  getUserChannel,
  getWatchHistory,
} from "../controllers/user.controller.js";

// step 2 --> use
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

//POST ROUTE JAB DATA SEND HOTI HAI TO  ROUTE BHI POST HOTI HAI
// login ke liye
router.route("/login").post(loginUser);
// logout
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refereshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
// ab update acc me patch rhega sabhi ko update nhi krnge agr isme post lagate tab yah sabhi ko update kr deta
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
// sabse pahle ek hi file update hogi then 2nd middleware me upload single in cloudinary , then third middleware updateAvatart from controller
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("uploadingOnCloudinary"), updateAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("uploadingCoverImg"), updateCoverImg);
// yaha params se get kr rhe hai isliye /c/:username --> username pahle se bol diye hai
router.route("/c/:username").get(verifyJWT, getUserChannel);
// get hoga kyunki user bhej to kuch nhi rha isliye get
router.route("/history").get(verifyJWT, getWatchHistory);
export default router;

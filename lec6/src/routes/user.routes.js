//step 1 -> import
import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refereshAccessToken,
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
// login ke liye
router.route("/login").post(loginUser);
// logout
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refereshAccessToken);

export default router;

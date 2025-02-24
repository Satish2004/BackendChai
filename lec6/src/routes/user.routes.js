//step 1 -> import
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
// import { loginUser } from "../controllers/user.controller.js";
// step 2 --> use
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
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
// jaise login ke liye
// router.route("/login").post(loginUser);
// step3--> export
export default router;

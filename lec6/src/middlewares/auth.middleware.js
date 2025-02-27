// ye middleware simply kya krega ki verify krega ki wo user exist krta hai ya nhi aur ye kai jagah use hoga ki user jo hai authenticate hi ki ni
//  jaise suibscribe krte time , comment aur like krte time

import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res) => {
  try {
    const token =
      req.cookie?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Error!");
    }
    // agar mil gya token to aage
    const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password",
      "-refereshToken"
    );

    if (!user) {
      //  FOR CLIENT -->
      throw new ApiError(401, "Invalid access Token!");
      // agar  mil gya
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access Token!");
  }
});

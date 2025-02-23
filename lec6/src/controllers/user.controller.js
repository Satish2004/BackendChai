import { asyncHandler } from "../utils/asyncHandler.js";
//user  jab register routes me hit krega taab ye logic chalega

//higher order function bana hai
const registerUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    message: "ok",
  });
});
// login  -->
// const loginUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });

export { registerUser };

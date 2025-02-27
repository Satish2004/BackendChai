import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Function of generaate access and refersh token

const generateAccessTokenAndRefershToken = async (userId) => {
  const user = await User.findById(userId);
  // ab yaha wala user User(model hai) usse baat kar raha hia kyunki ye variable me hai uske
  const accessToken = user.generateAccessToken();
  const refereshToken = user.generateRefereshToken();
  // then save in model
  user.refereshToken = refereshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refereshToken };
};

//user  jab register routes me hit krega taab ye logic chalega
// REGSITER -->

//higher order function bana hai
const registerUser = asyncHandler(async (req, res) => {
  // what will do lets break into the parts
  // get info from the user -> like username , email , etc whos belongs to the user model
  // check validation from frontend and backend both --> it should not be set to not empty
  // then all images and avatar upload into the cloudinary properly
  // username , email should be unique you have to search somewhere on the basis of this
  // then create user object ki kya kya rhenge .create se then db me sabko entry dedo
  // then jb mongodb me password aur accesstoken save karaye to encryption pass ho or anything you have to remove from this
  // check if you user created -> then return response -> else return error

  const { email, username, password, fullname } = req.body;
  // console.log("email:", email); // ab ise postman se post req bhejo jo json form me jaayengi
  if (fullname === "" || email === "" || username === "" || password === "") {
    throw new ApiError(400, "All fields are required");
  }
  //check user and email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  // already exist user or email
  if (existedUser) {
    throw new ApiError(400, "username or email already exist!");
  }
  // check for images(file, avatar and cover image dono ke liye) locally hai ki ni hai upload hui h ki nai
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //?.--> means optional chaining ki mil bhi skta hiaa aur nahi kya bharosaa
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // yaha check kr rhe hai ki req file ho req.files.coverImage jo array hai wo exist ho aur sath hi sath uska
  // length bhi 0 se bada ho to uska path nikalo nahi to ye part nahi chalega
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // ab avatart to required hai to usko check kro nahi hua to throw an error

  if (!avatarLocalPath) {
    //avatar main hi to use check kr lo nahi hua to throw new err
    throw new ApiError(400, "avatar image is required");
  }

  //cloudinary me upload kr do --> hume pata the ki sare image ko cloudinary se lana hai to pahle se usko bana ke rakhe the basic code ko utils me actually utills ka means yahi hota hia
  const avatarOnCloudinary = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImageOnCloudinary = await uploadFileOnCloudinary(
    coverImageLocalPath
  ); // it will takes time to upload on cloudinary but already we put asyncHandler from utils but once time we put async await
  //required field hai avatart to use fir check kro
  if (!avatarOnCloudinary) {
    throw new ApiError(400, "Avatart Is Required!");
  }

  //  ab sab kya hia pending with apne apne data ke sath --> ab unko actually me database ko dena

  // aab baat aati hai in sabko db me fir se upload kr du
  // jaise ki avatar kya tha required to uso har jagah check kiye but civerImage ko fir se entry karate time user coverImage dala hi ni to
  // to corner or base case hit hoga aur dala to URL dedo nahi to empty bhej de
  //  direct db se baat to hamara User kr rha hia model wala import kro then useee use kro

  // ab yaha db me store ye sabhi hongi
  const userNewFromRegisetr = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // user agar coverImage de raha h to dedo nahi to empty bhej do
    email,
    password, // encryption hoke jayega
    username: username.toLowerCase(),
  });

  // yaha select kro ki kya kya tumhe db me nhi chaiye sensitive data ko hataa do

  const createdUserFromRegister = await User.findById(
    userNewFromRegisetr._id
  ).select("-password -refereshToken");

  if (!createdUserFromRegister) {
    throw new ApiError(500, "something went wrong!");
  }

  // then sab thik raha to server response send kr deaga ki mera to ho gya-->
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUserFromRegister,
        `${username} Registered Successfully!`
      )
    );
});

// LOGIN -->

const loginUser = asyncHandler(async (req, res) => {
  //  todos
  //step1 -> req.body se data lao
  // step2-> username or email pe karao login if doesnt exist return error
  // step3 find the user ki is name se model me useranme aur email se koi exist krta hi ki nai
  // step4 --> check password ki jo model wala pass word hai aur jo de rha hai wo isCorrect hai ya ni (bcrypt ka method hai se)
  // step5 ->agar error diya to return error nahi to direct isko client ke pass secure cookie bhej do
  // step6->then ek separate method bana lo generateAndAccessToken ka then use again and again
  // step 7 -> send cookie
  const { email, username, password } = req.body; // yaha wala password jo user register ke baad dal rha hai
  if (!email && !username) {
    throw new ApiError(402, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }
  // yaha main user se password leke jo database wala "password" hai usko correct hai ki nai puch raha hi jo bool me hai

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Password is incorrect!");
  }

  // ab jo generate kiya hu access and referesh token use usko call karo with har user ki unique id ke sath and jo return kr rha hai  accessToken and refershToken
  // use distructure kr lo and cookie me bhej do
  const { accessToken, refereshToken } =
    await generateAccessTokenAndRefershToken(user._id);

  // cookie me bhejne se phle sensitive data ko select krke nahi bhejunga
  const loggedUser = await User.findById(user._id).select(
    "-password -refereshToken"
  );
  // then send the cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // cookie me jayega
    .cookie("refereshToken", refereshToken, options) // res send ke sath ye bhi cookie me jayega
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refereshToken },
        "User logged in successfully!"
      )
    );
});

// LOGOUT-->

const logoutUser = asyncHandler(async (req, res) => {
  // logout kru but kiske base pe
  // todo
  //  ek middlewaere chalo ki uske veriFy jwt se useke user pata lg jaye user._id se
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refereshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .send(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out!"));
});

export { registerUser, loginUser, logoutUser };
// 36-->

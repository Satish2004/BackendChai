import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

// end point jaha se user ReferesToken lekar fir se accessToken krke session start krega -> ye end point ka sirf controller hai end point routes me dena hoga
const refereshAccessToken = asyncHandler(async (req, res) => {
  // get the refresh token cookie se ya fir mobile se ho to body se
  const incomingRefereshToken =
    req.cookies.refereshToken || req.body.refereshToken;

  if (!incomingRefereshToken) {
    throw new ApiError(401, "unauthorized request!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefereshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Referesh Token!");
    }

    // jo refersh token aa raha hai aur jo user model phle se refreshToken hai db me wo match ni kiye to error else
    if (incomingRefereshToken !== user?.refereshToken) {
      throw new ApiError(401, " Refresh token is expired or used ! ");
    }

    // agar sab sahi raha to generateAccessToekn function ko call kr do with userId ke saath
    const { accessToken, newRefereshToken } =
      await generateAccessTokenAndRefershToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refereshToken", newRefereshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refereshToken: newRefereshToken },
          "Access Token Refreshed Successfully!"
        )
      );
  } catch (error) {
    throw new ApiError(error?.message || "Invalid refresh token!");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // agar wo change kr paa rha hai to obvious hai ki loggin hai
  // aur agar login hai pahle se to chup chap user ko dhund lo uske unique id se

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(403, "Invalid old Password");
  }

  // agar sab sahi raha tab mongodb ke jo password field hai usme jo naya password aaya hai usko dedo
  // user. karnge tb sab access ho jayega
  user.password = newPassword;
  //then save in db
  await user.save({ validateBeforeSave: false });
  // sab thik raha to return
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change Successfully!"));
  // Return में {} देने का कारण यह है कि इस API का मुख्य उद्देश्य सिर्फ पासवर्ड बदलना है, न कि नया डेटा रिटर्न करना।
  // बाकी APIs में अगर नया डेटा (जैसे नया यूजर, अपडेटेड प्रोफाइल, या कोई और रिसोर्स) बन रहा होता, तो उसे JSON response में भेजना ज़रूरी होता।
});
const getCurrentUser = asyncHandler(async (req, res) => {
  // we can directly access the user we have already inject the user on db  only we access this user from the db
  // and lekar use res send kr rhe hai
  const user = req.user;
  return res.status(200).json(200, user, "current user fetched successfully!");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(402, "All field are required!");
  }

  // ab us user ko dhundunga or usi me hi change karuha aue jo mi chaliye use select me daal dunga

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");

  //  then sb  thik to return

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully!"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const localFileOfAvatar = req.file?.path; // ye mera file --> files ni hoga kyunki yahah hum specific isich ke liye kr rhe hai
  // but waha kya tha ki bahut sare arr the isliye files.path[0]-> aisa kuch de rhe the
  // ab ise hum direct jo hai wo database me store kara skte hai but storage ka dikat hoga
  // isliye sabse phle ise cloudinary me save krayenge then isse url ko lekar db me update kr dunha
  if (!localFileOfAvatar) {
    throw new ApiError(403, "Avatar file is misssing!");
  }
  // nahi to cloudnary me upload
  const uploadingOnCloudinary = await uploadFileOnCloudinary(localFileOfAvatar); // yaha se img ka url aa rha h from cloudinary
  // console.log(uploadFileOnCloudinary); --> ye mere ko pura obbject return karega  but isme ka mujhe url chaiye
  if (!uploadingOnCloudinary.url) {
    throw new ApiError(402, " Error while uploading file on avatar!");
  }
  // ab update kr dete hai yaha milega cl;oudinary se pura object but hume url milega string aur  wahi use kr na hai

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      avatar: uploadFileOnCloudinary.url,
    },
    {
      new: true,
    }
  ).select("-password");

  // sab kuch thik to resturn kr to return
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully!"));
});

const updateCoverImg = asyncHandler(async (req, res) => {
  const localCoverImg = req.file?.path;

  if (!localCoverImg) {
    throw new ApiError(401, "Cover image is required!");
  }

  const uploadingCoverImg = await uploadFileOnCloudinary(localCoverImg);

  if (!uploadingCoverImg.url) {
    throw new ApiError(402, "Cover image doesn't exist!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      coverImage: uploadingCoverImg.url,
    },
    { new: true }
  ).select("-password");

  // sab thik raha tb
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image is updated!"));
});

// yaha se user rout hit karega then ye route me jayega like my chnnel frontend se then isko darsaa do

const getUserChannel = asyncHandler(async (req, res) => {
  const { username } = req.params; // koi form to ni de rhe hai jo body se nikalnge

  if (!username) {
    throw new ApiError(400, "Username is Missing!");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(), //model wala username: abhi wala username
      },
    },
    // yaha dekhunga ki mera user kis kis channel ko subscribe kiya hia using lookup->
    // lookup from -->me kaha se lega
    // local field
    // / foreign feilld aur uska name
    // har banda ka subscriber cound krna h to uske channel ko dekhe wahi uska forignfeild hoga jo kahta hai kaha pe presend hoga
    // YE WALA LOOPUP HAMARA US USER KE TOTAL SUBSCRIBER BATYEGA --> CHANNEL SE
    {
      $lookup: {
        from: "subscriptions", // kaha se
        localField: "_id", // us field ke kiisee
        foreignField: "channel", // obtain subscriber  kaha par present hoga
        as: "Subscribers", // nickname arry ke form aayega yahi name se
      },
    },
    // YE WALA HAMARA WO USER JO KITTO KO SUBSCRIBE(CHANNEL) KIYA H WO BATAYEGA --> SUBSCRIBER SE
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo", //maaine kitno ko subscribe kiya hai
      },
    },
    {
      $addFields: {
        //size of mere kitte subscriber hai
        subscribersCount: {
          $size: "$Subscribers", // dollar isliye kyunki ye field hi
        },
        //size of ki maine kitto ko subscribe kiye hai
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$Subscribers.subscriber"] }, // field ke Subscubers hai aur dot ke baaad subscription.model.js ka subscriber
            then: true,
            else: false,
          },
        },
      },
    },
    // ADD PROJECTION AGGREGATION KYUNKI YE HUME KUCH SELECTED DATA KO RETURN KRKE DETA HAI KI KYA DARSAANA HI
    {
      // ye return kr do baki frontend wala jaha chahe waha darsa sakta hai
      $project: {
        fullname: 1, // flag on kr do
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel doesn't exists!");
  }

  // ab sab thik rha to return kr do channel ko jada taar [0] hi kaam rhta hia

  res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel Fetched!"));
});

// History ke liye bhi rahega jo video model user model pr dono pr depends

export {
  registerUser,
  loginUser,
  logoutUser,
  refereshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImg,
  getUserChannel,
};

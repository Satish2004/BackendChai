import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// ab direct thodi na usme hashing kr dene just data store krne se phle hashing kr denge uske liye middleware hook pre use krenge
// pre hook isliye use krte hain taki data store hone se pehle kuch kr ske

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // optimal tarike se searchable ho jaye
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    fullname: {
      type: String,
      required: true,
      index: true,
    },
    avatar: {
      type: String, // taking from cloudinary
      required: true,
    },

    coverImage: {
      type: String,
      required: true,
    },

    password: {
      type: String, // ayaha encryption hoga then string ke rop me save hoga
      required: [true, "password is required!"],
    },

    refereshToken: {
      type: String,
      //   required: true,
    },
    watchHistory: [
      // yaha arr isliye diye taki video watch history me bahut sare aa jayenge
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

// hashing password before saving
// yaha arrow function use nhi kr skte kyuki this keyword use hota hai
// yaha pre hook hai matlab kuch bhi change krne se like avatar change krne se bhi password change ho jayega aisa mat
// kro isme condition lagao ki password change hoga tabhi hashing hoga
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // isModified is a method of mongoose jo check krta hai ki kya password change hua hai ya nhi
    // agar password change nhi hua hai toh hashing nhi karenge
    // agar password change hua hai toh hashing karenge
    // agar password change nhi hua hai toh next() call karenge
    // agar password change hua hai toh hashing karenge and next() call karenge

    return next();
  }

  this.password = await bcrypt.hash(this.password, 10); // 10 is the number of rounds (salts)

  next();
});

// this methods is compare the password mainPass and hashPass
// yaha isPasswordCorrect variable hia
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// this methods is generate the token
userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullname,
    },
    process.env.ACESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACESS_TOKEN_EXPIRY,
    }
  );
};

// this methods is generate the referesh token

//  REFERESH TOKEN AUR ACCESS TOKEN SAME TARIKE SE LIKHATA HAI BUT REFERESGH TOKEN KYA HAI BAAR BAAR REFERESH HOTI RAHTI HAI TO ISME INFO KAM HOTA HAI

userSchema.methods.generateRefereshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);

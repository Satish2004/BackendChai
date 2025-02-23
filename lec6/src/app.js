import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
// middleware sab app ke baad
// MAjor configuration --->
// 1. cors
//1 ki kisko kisko access dena hai
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, //CLIENT_URL
    credentials: true,
  })
);
// 2 ki data json me aayega to
app.use(
  express.json({
    limit: "16kb",
  })
);
// 3 agar data url me aaye tab ka middleware
app.use(urlencoded({ extended: true, limit: "16kb" })); // extended means object ke andar ke andar
// 4 static file for assests (public folder)
app.use(express.static("public"));
//5 hota hai cookie parser jo cookie ko parse karta hai means crud operation karta hai cookie pe ho user hota hai uske browser me
// pe cookie ko access karne ke liye
app.use(cookieParser());

//router

//step 1 -- import
import userRouter from "./routes/user.routes.js";

// step 2 --> declartion
// app.get() --> aisa kab likh rahe the jab sab file routes, controller ek hi me tha
//  ab sab separate separate hai tab as a middleware use krna hoga
// app.use() se isi me routes , controller sab aa jayenge
// app.use("/user", userRouter); -->  BUT INDUSTRY LEVEL ME API AUR USKA VERSION BAATANA PADHTA HAI VERSION KUCH BHI DEDO

// DEFINE ROUTES FOR USER
app.use("/api/v1/users", userRouter); //--> http://localhost:9000/api/v1/user--> send hoga userRoutes me then waha par jake decide ki register ki login then waha next me function par

//  ab pata ni ki /user me hoga ki /register me to ye url kaise banega final
// http://localhost:900/user/register
// ab login ke liye bana na hai tab
// ye same rahega --> user routes me jake /login ke liye banega aur uske liye alg function
export { app };

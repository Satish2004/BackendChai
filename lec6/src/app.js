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

export { app };

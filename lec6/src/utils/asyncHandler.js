// higher order function kya krta hia ek fuction hota hai usse as a parameter aur return dono karta hia below code is form of higher order

// ASYNC FUCNTION ME KYA KAYA RAHENGE

// //approach 1 --> hndling error with try catch
// const asyncHandler = () => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// approach 2 using promises
const asyncHandler = (request) => {
  (req, res, next) => {
    promis.resolve(request(req, res, next)).reject((err) => next(err)); // yaha reject ki jagah catch bhi ho sakta hia
  };
};
export { asyncHandler };

// depends ki kya use krna hia but production level me jo pahle se chalte aa raha hai wahi to krenge na

// INdustry level me har ke code baar baar use hota hai aur jo code baar baad same tarah se use hoga use utils me likhte hia
// same things api handlig me error handling aur jo req res handler hai unko utils me likh lo aur jaha jaha use wo waha import aur export kr do

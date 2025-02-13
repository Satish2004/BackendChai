import express from "express";
import cors from "cors";
const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is ready");
});

//create a route for jokes take inside of the array
app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "Why don't skeletons fight each other?",
      content: "Because they don't have the guts!",
    },
    {
      id: 2,
      title: "Why did the scarecrow win an award?",
      content: "Because he was outstanding in his field!",
    },
    {
      id: 3,
      title: "What do you call fake spaghetti?",
      content: "An impasta!",
    },
    {
      id: 4,
      title: "Why couldn't the bicycle stand up by itself?",
      content: "Because it was two-tired!",
    },
    {
      id: 5,
      title: "Why did the math book look sad?",
      content: "Because it had too many problems!",
    },
    {
      id: 6,
      title: "Why do cows have hooves instead of feet?",
      content: "Because they lactose!",
    },
    {
      id: 7,
      title: "Why did the golfer bring an extra pair of pants?",
      content: "In case he got a hole in one!",
    },
    {
      id: 8,
      title: "What do you call cheese that isn’t yours?",
      content: "Nacho cheese!",
    },
    {
      id: 9,
      title: "Why did the tomato turn red?",
      content: "Because it saw the salad dressing!",
    },
    {
      id: 10,
      title: "How do you organize a space party?",
      content: "You planet!",
    },
  ];

  res.send(jokes);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

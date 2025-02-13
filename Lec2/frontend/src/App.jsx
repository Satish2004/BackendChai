import React, { useEffect } from "react";
import { useState } from "react";
import "./App.css";
import axios from "axios";
const App = () => {
  const [jokes, setjokes] = useState([]);

  useEffect(() => {
    //production level me maindirect yaha port nhi de skta hu usko env krke dynamic template string me rakhna hota hi
    // aur axios me api fetch krne ke liye standard routes follow krni hoti hai
    axios.get("/api/jokes").then((response) => {
      console.log(response);
      setjokes(response.data);
    });
  });

  return (
    <div className="jokes">
      <h1>Chai jaruri hai bhaiyya</h1>
      <h5>jokes : {jokes.length}</h5>

      {jokes.map((joke) => (
        <div key={joke.id} className="joke">
          <h1>{joke.id}</h1>
          <h3>{joke.title}</h3>
          <p>{joke.content}</p>
        </div>
      ))}
    </div>
  );
};

export default App;

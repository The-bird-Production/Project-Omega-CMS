const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AuthRoute = require("./Routes/Auth/MainRoute");
app.use("/auth", AuthRoute);

app.get("/test", (req, res) => {
  res.send("Testing Server");
});

console.log("App Started");

module.exports = app;

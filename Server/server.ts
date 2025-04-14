const app = require("./app");
const config = require("./config/server");
import {Request, Response, NextFunction} from 'express'
require("dotenv").config();

//Global  Error Handling  Middleware
app.use(function (err: Error, req: Request, res: Response, next:NextFunction) {
  if (err) {
    console.error(err.stack);
    res.status(500).json({ code: 500, message: "Internal server error :" + err });

  } else {
    next();
  }
  
});

app.listen(config.app_port, () => {
  console.log("Backend Start on http://localhost:" + config.app_port);
});

import { config } from "dotenv";
import { use, listen } from "./app";
import { app_port } from "./config/server";
({ config }.config());
//Global  Error Handling  Middleware
use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ code: 500, message: "Internal server error :" + err });
});
listen(app_port, () => {
    console.log("Backend Start on http://localhost:" + app_port);
});

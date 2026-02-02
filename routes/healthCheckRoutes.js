import { Router } from "express";

import { testUrl, totalUrl } from "../controllers/healthCheck.controller.js";


const healthCheckRouter = Router();
healthCheckRouter.get("/test",testUrl);

healthCheckRouter.get("/count",totalUrl);

export default healthCheckRouter

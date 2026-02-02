import { Router } from "express";

import { readBf } from "../controllers/readBf.controller.js";
const readBfRoutes = Router();



readBfRoutes.get("/check", readBf);

export default readBfRoutes;


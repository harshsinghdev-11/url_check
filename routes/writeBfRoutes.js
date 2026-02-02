import { Router } from "express";
import { writeBf } from "../controllers/writeBf.controller.js";


const writeBfRoutes = Router();

writeBfRoutes.post("/addUrl",writeBf);

export default writeBfRoutes;
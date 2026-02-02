import { Router } from "express";
import bloomfilterProject from "../model/bloomfilterProject.js";
import { findUrlInDB } from "../controllers/dbRead.controller.js";


const dbReadRoutes = Router();

dbReadRoutes.get("/find",findUrlInDB)

export default dbReadRoutes;
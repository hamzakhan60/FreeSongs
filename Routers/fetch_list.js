const express = require("express");
const router = express.Router();
const getSongs= require("../Controllers/fetch_list");

router.use(express.json());


console.log("fetch_list route is working");

router.get("/",getSongs);

module.exports= router;
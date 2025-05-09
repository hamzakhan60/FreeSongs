const express = require("express");
const router = express.Router();
const downloadSongController= require("../Controllers/download");

router.use(express.json());


console.log("Download route is working");

router.post("/",downloadSongController);

module.exports= router;
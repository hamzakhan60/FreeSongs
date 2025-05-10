const express = require("express");
const router = express.Router();
const uploadSong= require("../Controllers/uploadSong");

router.use(express.json());


console.log("upload_song route is working");

router.post("/",uploadSong);

module.exports= router;
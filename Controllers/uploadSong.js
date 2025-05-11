const insertSong = require('../services/insertToDb');
const uploadToStorage = require('../services/uploadToStorage');

const uploadSong = async (req, res) => {
 try
  {
    const { fileName, publicUrl } = req.body;
    result = await insertSong(fileName, publicUrl);
    console.log("Result", result);
    if (!result) {
      return res.status(500).json({ error: 'Failed to insert song into database.' });
    }
    return res.status(200).json(result);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json(err.message);
  }
};

module.exports =  uploadSong ;

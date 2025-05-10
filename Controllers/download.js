const axios = require('axios');
const insertSong = require('../services/insertToDb');
const downloadMp3 = require('../services/downloadMp3');
const uploadToStorage = require('../services/uploadToStorage');
const https = require('https');



const fetchData = async (options) => {
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error('Fetch Error:', err.message);
    throw err;
  }
};
// This function fetches the file from the given URL and passes the stream to a custom upload function
const streamToStorage = async (url, uploadStreamFunc) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Instead of buffering, we stream the response to storage
      uploadStreamFunc(res)
        .then(resolve)
        .catch(reject);
    }).on('error', reject);
  });
};

const downloadSongController = async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }


    const downloadOptions = {
      method: 'GET',
      url: 'https://youtube-mp36.p.rapidapi.com/dl',
      params: { id: url },
      headers: {
        'x-rapidapi-key': '59a234f519msh4a51234a2e8d654p1f2874jsnd940a3a2d67f',
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
      }
    };

    const response = await fetchData(downloadOptions);

    console.log("Debuging");

    // const response={
    //   link: 'https://epsilon.123tokyo.xyz/get.php/0/49/OhLPsjScQCc.mp3?n=Lady%20Gaga%2C%20Bruno%20Mars%20-%20Die%20With%20A%20Smile%20%28Official%20Music%20Video%29&uT=R&uN=aGFtemFraGFuNjA%3D&h=vNUy_lpCksjf-W5ByfFdRw&s=1746915973&uT=R&uN=aGFtemFraGFuNjA%3D',
    //   title: 'Lady Gaga, Bruno Mars - Die With A Smile (Official Music Video)',
    //   filesize: 3375628,
    //   progress: 100,
    //   duration: 204.06857221242,
    //   status: 'ok',
    //   msg: 'success'
    // }




    const fileBuffer = await downloadMp3(response.link);
    const fileName = `${response.title.replace(/ /g, '_')}.mp3`;
    console.log("File name", fileName);
    console.log("File buffer", fileBuffer);
    const publicUrl = await streamToStorage(response.link, (readStream) =>
      uploadToStorage(fileName, readStream)
    );

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




module.exports = downloadSongController;
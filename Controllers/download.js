const axios = require('axios');
const insertSong = require('../services/insertToDb');
const downloadMp3 = require('../services/downloadMp3');
const uploadToStorage = require('../services/uploadToStorage');




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
  try {
    // Use a timeout and more resilient options
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer', // Use arraybuffer instead of stream
      timeout: 30000, // 30 second timeout
      maxRedirects: 5,
      maxContentLength: 50 * 1024 * 1024, // 50MB max size
      headers: {
        'Accept': 'audio/mpeg,audio/*,*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)'
      }
    });
    
    // Convert directly to buffer instead of using stream
    return await uploadStreamFunc(Buffer.from(response.data));
    
  } catch (err) {
    console.error('Axios download error:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response headers:', err.response.headers);
    }
    throw new Error(`Stream failed on Vercel: ${err.message}`);
  }
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
    console.log("Response from download", response);
    console.log("Debuging");

    // const response={
    //   link: 'https://theta.123tokyo.xyz/get.php/3/ec/YStwB1U8H9E.mp3?n=Beqadra%20_%20Nehaal%20Naseem%20_%20Official%20Music%20Video%20_%20Rythmish&uT=R&uN=aGFtemFraGFuNjA%3D&h=-blCC2Slwq2cZc73gp3mgw&s=1746919503&uT=R&uN=aGFtemFraGFuNjA%3D',
    //   title: 'Beqadra | Nehaal Naseem | Official Music Video | Rythmish',
    //   filesize: 3375628,
    //   progress: 100,
    //   duration: 204.06857221242,
    //   status: 'ok',
    //   msg: 'success'
    // }




    //const fileBuffer = await downloadMp3(response.link);
    //console.log("File buffer", fileBuffer);
    const fileName = `${response.title.replace(/ /g, '_')}.mp3`;
    console.log("File name", fileName);
    //console.log("File buffer", fileBuffer);
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
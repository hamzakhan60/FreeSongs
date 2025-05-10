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
    console.log(`Starting download from: ${url}`);

    // Use more browser-like headers to prevent server rejection
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      timeout: 60000, // Increase timeout to 60 seconds
      maxRedirects: 10, // Allow more redirects
      maxContentLength: 100 * 1024 * 1024, // 100MB max size
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://youtube.com/',  // Some servers check the referer
        'DNT': '1',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });

    console.log(`Download completed. Content length: ${response.data.length} bytes`);

    // Convert directly to buffer and upload
    return await uploadStreamFunc(Buffer.from(response.data));

  } catch (err) {
    console.error('Axios download error:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response headers:', JSON.stringify(err.response.headers));
    }
    throw new Error(`Stream failed: ${err.message}`);
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

    // const response = await fetchData(downloadOptions);
    // console.log("Response from download", response);
    // console.log("Debuging");

    const response={
      link: 'https://theta.123tokyo.xyz/get.php/3/ec/YStwB1U8H9E.mp3?n=Beqadra%20_%20Nehaal%20Naseem%20_%20Official%20Music%20Video%20_%20Rythmish&uT=R&uN=aGFtemFraGFuNjA%3D&h=-blCC2Slwq2cZc73gp3mgw&s=1746919503&uT=R&uN=aGFtemFraGFuNjA%3D',
      title: 'Beqadra | Nehaal Naseem | Official Music Video | Rythmish',
      filesize: 3375628,
      progress: 100,
      duration: 204.06857221242,
      status: 'ok',
      msg: 'success'
    }




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
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
    const response = await axios.get(url, {
      responseType: 'stream',
      maxRedirects: 5, // follow redirects
    });

    return await uploadStreamFunc(response.data);
  } catch (err) {
    console.error('Axios stream error:', err.message);
    throw new Error('Stream failed on Vercel');
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
    //   link: 'https://theta.123tokyo.xyz/get.php/4/72/XO8wew38VM8.mp3?n=MILLIONAIRE%20SONG%20%28Full%20Video%29_%20%40YoYoHoneySingh%20_%20GLORY%20_%20BHUSHAN%20KUMAR&uT=R&uN=aGFtemFraGFuNjA%3D&h=fBWS7RLJ0M1Xx-s7_z-wqQ&s=1746918572&uT=R&uN=aGFtemFraGFuNjA%3D',
    //   title: 'MILLIONAIRE_SONG_(Full_Video):_@YoYoHoneySingh__|_GLORY_|_BHUSHAN_KUMAR.mp3',
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
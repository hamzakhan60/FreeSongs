const axios = require('axios');
const insertSong = require('../services/insertToDb');
const downloadMp3 =require('../services/downloadMp3');
const uploadToStorage =require('../services/uploadToStorage');



const fetchData = async (options) => {
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error('Fetch Error:', err.message);
    throw err;
  }
};

// https://wbevjgcbdtzemtdickep.supabase.co/storage/v1/object/public/songs/12_SAAL_-_BILAL_SAEED_-_OFFICIAL_VIDEO_HD.mp3
// https://wbevjgcbdtzemtdickep.supabase.co/storage/v1/object/public/songs//12_saal_-_bilal_saeed_-_official_video_hd.mp3

const waitForMp3 = async (id) => {
  const options = {
    method: 'GET',
    url: `https://youtube-to-mp315.p.rapidapi.com/status/${id}`,
    headers: {
      'x-rapidapi-key': '59a234f519msh4a51234a2e8d654p1f2874jsnd940a3a2d67f',
      'x-rapidapi-host': 'youtube-to-mp315.p.rapidapi.com'
    }
  };

  const maxRetries = 15;
  const delay = 6000; // 3 seconds
  let attempt = 0;

  while (attempt < maxRetries) {
    const data = await fetchData(options);
    console.log('Status Check Response:', data);

    // Adjust based on actual response structure
    const downloadStatus = data?.status;

    if (downloadStatus === 'AVAILABLE') {
      return data;
    }

    attempt++;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error('Download link not ready after multiple attempts.');
};

const downloadSongController = async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Step 1: Call the convert API to get the ID
    // const downloadOptions = {
    //   method: 'POST',
    //   url: 'https://youtube-to-mp315.p.rapidapi.com/download',
    //   params: {
    //     url: url,
    //     format: 'mp3'
    //   },
    //   headers: {
    //     'x-rapidapi-key': '59a234f519msh4a51234a2e8d654p1f2874jsnd940a3a2d67f',
    //     'x-rapidapi-host': 'youtube-to-mp315.p.rapidapi.com',
    //     'Content-Type': 'application/json'
    //   },
    //   data: {}
    // };

    const downloadOptions = {
      method: 'GET',
      url: 'https://youtube-mp36.p.rapidapi.com/dl',
      params: {id: url},
      headers: {
        'x-rapidapi-key': '59a234f519msh4a51234a2e8d654p1f2874jsnd940a3a2d67f',
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
      }
    };
    
    const response = await fetchData(downloadOptions);
    // console.log('Response from conversion API:', response);
    // const id = response?.id;

    // if (!id) {
    //   return res.status(500).json({ error: 'Failed to get conversion ID.' });
    // }

    // Step 2: Wait until the MP3 is ready
  //  const downloadedData = await waitForMp3(id);
    // const downloadedData={
    //   id: '840cc005-3a1f-4720-ab69-33dc2252b54b',
    //   downloadUrl: 'http://78.141.232.210/840cc005-3a1f-4720-ab69-33dc2252b54b.mp3',
    //   status: 'AVAILABLE',
    //   format: 'MP3',
    //   title: 'Asim Azhar - Jo Tu Na Mila | Kunaal Vermaa',
    //   startAt: '08/05/2025 21:09:29',
    //   endAt: '08/05/2025 21:09:54',
    //   startTime: null,
    //   endTime: null,
    //   quality: 0,
    //   retry: 0,
    //   callbackUrl: null
    // }
    console.log("Debuging");
    // const response={
    //   link: 'https://epsilon.123tokyo.xyz/get.php/a/8c/luFGY9atHqo.mp3?n=12%20SAAL%20-%20BILAL%20SAEED%20-%20OFFICIAL%20VIDEO%20HD&uT=R&uN=aGFtemFraGFuNjA%3D&h=6dV2uU3xvyEwpCov6L9Rkw&s=1746758668&uT=R&uN=aGFtemFraGFuNjA%3D',
    //   title: '12 SAAL - BILAL SAEED - OFFICIAL VIDEO HD',
    //   filesize: 3375628,
    //   progress: 100,
    //   duration: 204.06857221242,
    //   status: 'ok',
    //   msg: 'success'
    // }
    
    
      
    const fileBuffer = await downloadMp3(response.link);
    const fileName = `${response.title.replace(/ /g, '_')}.mp3`;
    console.log("File name",fileName);
    console.log("File buffer",fileBuffer);
    const publicUrl = await uploadToStorage(fileName, fileBuffer);
    result = await insertSong(fileName, publicUrl);
    console.log("Result",result);
    if (!result) {
      return res.status(500).json({ error: 'Failed to insert song into database.' });
    }
    return res.status(200).json(result);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Failed to download song.' });
  }
};




module.exports = downloadSongController;
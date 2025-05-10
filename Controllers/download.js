const axios = require('axios');

const fetchData = async (options) => {
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error('Fetch Error:', err.message);
    throw err;
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



    return res.status(200).json(response);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json(err.message);
  }
};




module.exports = downloadSongController;
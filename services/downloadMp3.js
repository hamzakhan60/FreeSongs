const axios = require('axios');

const downloadMp3 = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    throw new Error('Failed to download MP3');
  }
};

module.exports = downloadMp3;

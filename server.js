const express = require('express');
const useDownload= require('./Routers/download');
const fetch_list= require('./Routers/fetch_list');
const uploadSong= require('./Routers/uploadSong');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/download',useDownload);
app.use('/fetch_list',fetch_list);


app.post('/caching_song', (req, res) => {
  const { songUrl } = req.body;

  if (!songUrl) {
    return res.status(400).json({ error: 'Missing songUrl in body' });
  }

  const urlObj = parse(songUrl);
  const client = urlObj.protocol === 'https:' ? https : http;

  client.get(songUrl, (fileRes) => {
    if (fileRes.statusCode !== 200) {
      return res.status(fileRes.statusCode).json({ error: 'Failed to fetch song' });
    }

    res.setHeader('Content-Type', fileRes.headers['content-type'] || 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="song.mp3"');

    fileRes.pipe(res); // Stream to frontend
  }).on('error', (err) => {
    res.status(500).json({ error: 'Download failed', details: err.message });
  });
});

app.use('/upload_song', uploadSong);

console.log('Server is starting...');
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

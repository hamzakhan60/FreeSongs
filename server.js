const express = require('express');
const useDownload= require('./Routers/download');
const fetch_list= require('./Routers/fetch_list');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/download',useDownload);
app.use('/fetch_list',fetch_list);

console.log('Server is starting...');
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

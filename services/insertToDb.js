// services/songService.js
const supabase = require('../supabase/client.js');


async function insertSong(fileName, url) {

  const dataToInsert = {
    mp3_url: url,
    music_name: fileName,
  }
  const { data, error } = await supabase
    .from('musicData')
    .upsert([dataToInsert], { onConflict: ['mp3_url'] })
    .select('*');
  if (error) throw error;
  return data[0]; 
}

module.exports = insertSong;

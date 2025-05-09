const supabase = require('../supabase/client.js');

const getSongs = async (req, res) => {
  try {
    const { data, error } = await supabase.from('musicData').select('*');

    if (error) {
      return res.status(500).json({ message: 'Error fetching songs', error });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports =  getSongs ;

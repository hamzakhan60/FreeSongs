const supabase = require('../supabase/client.js');

const sanitizeFileName = (fileName) => {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace all non-alphanumeric characters (except . and -) with underscores
      .toLowerCase();                   // Optionally convert to lowercase
  };

const uploadToStorage = async (fileName, fileBuffer) => {

    const sanitizedFileName = sanitizeFileName(fileName);


    const { response,error } = await supabase.storage
        .from('songs')
        .upload(sanitizedFileName, fileBuffer, {
            upsert: true,
            contentType: 'audio/mpeg'
        });

    if (error) {
        console.error('Upload Error:', error);  // ✅ log the actual error
        throw new Error(`Failed to upload to storage: ${error.message}`);
    }
    console.log('Upload Response:', response);  
    
    const { data, error: publicUrlError } = supabase.storage
        .from('songs')
        .getPublicUrl(sanitizedFileName);

    if (publicUrlError) {
        console.error('Public URL Error:', publicUrlError);
        throw new Error(`Failed to get public URL: ${publicUrlError.message}`);
    }

    return data.publicUrl;
};

module.exports = uploadToStorage;

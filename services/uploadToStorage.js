const supabase = require('../supabase/client.js');

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
};

const uploadToStorage = async (fileName, fileStream) => {
    console.log("i am in uploadToStorage");
  const sanitizedFileName = sanitizeFileName(fileName);


  const fileBuffer = await streamToBuffer(fileStream);
  console.log("File buffer", fileBuffer);

  const { error: uploadError } = await supabase.storage
    .from('songs')
    .upload(sanitizedFileName, fileBuffer, {
      upsert: true,
      contentType: 'audio/mpeg',
    });

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    throw new Error(`Failed to upload to storage: ${uploadError.message}`);
  }

  const { data, error: publicUrlError } = supabase.storage
    .from('songs')
    .getPublicUrl(sanitizedFileName);

  if (publicUrlError) {
    console.error('Public URL Error:', publicUrlError);
    throw new Error(`Failed to get public URL: ${publicUrlError.message}`);
  }
  console.log("finished uploadToStorage");
  return data.publicUrl;
};

module.exports = uploadToStorage;

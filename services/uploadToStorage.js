const supabase = require('../supabase/client.js');

const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
};

const uploadToStorage = async (fileName, fileDataOrStream) => {
  console.log("Starting uploadToStorage");
  const sanitizedFileName = sanitizeFileName(fileName);

  let fileBuffer;
  
  // Handle both buffer and stream inputs
  if (Buffer.isBuffer(fileDataOrStream)) {
    fileBuffer = fileDataOrStream;
    console.log("Received buffer directly");
  } else {
    // It's a stream, convert to buffer
    fileBuffer = await streamToBuffer(fileDataOrStream);
    console.log("Converted stream to buffer");
  }
  
  console.log("File buffer size:", fileBuffer.length);
  
  // Check if buffer is valid
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Empty file buffer received");
  }

  // Validate that it looks like an MP3 file (simple check)
  if (fileBuffer.length > 2 && 
     (fileBuffer[0] !== 0x49 || fileBuffer[1] !== 0x44) && // ID3v2
     (fileBuffer[0] !== 0xFF || (fileBuffer[1] & 0xE0) !== 0xE0)) { // MPEG sync
    console.warn("Warning: File doesn't appear to have MP3 header markers");
  }

  console.log("Starting upload to Supabase");
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
  
  console.log("Finished uploadToStorage successfully");
  return data.publicUrl;
};


module.exports = uploadToStorage;
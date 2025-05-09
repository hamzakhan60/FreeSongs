const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wbevjgcbdtzemtdickep.supabase.co';  // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXZqZ2NiZHR6ZW10ZGlja2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDQ1MDEsImV4cCI6MjA2MjIyMDUwMX0.3BaXWrJas-FltZ8ItG08kWiVOeRKX0hDfmQJtH5Lzf4';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
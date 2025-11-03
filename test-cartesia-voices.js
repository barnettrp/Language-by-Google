import 'dotenv/config';

async function listCartesiaVoices() {
  const apiKey = process.env.CARTESIA_API_KEY;

  if (!apiKey) {
    console.error('CARTESIA_API_KEY not found in environment');
    return;
  }

  try {
    const response = await fetch('https://api.cartesia.ai/voices', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Cartesia-Version': '2024-06-10'
      }
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const voices = await response.json();
    console.log('\n=== ALL CARTESIA VOICES ===\n');
    console.log(JSON.stringify(voices, null, 2));

    console.log('\n=== SPANISH VOICES ONLY ===\n');
    const spanishVoices = voices.filter(v =>
      v.language === 'es' ||
      v.language?.includes('spanish') ||
      v.name?.toLowerCase().includes('spanish') ||
      v.description?.toLowerCase().includes('spanish')
    );

    spanishVoices.forEach(voice => {
      console.log(`Name: ${voice.name}`);
      console.log(`ID: ${voice.id}`);
      console.log(`Language: ${voice.language}`);
      console.log(`Description: ${voice.description || 'N/A'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error fetching voices:', error);
  }
}

listCartesiaVoices();

// Quick test script for OpenAI TTS API endpoint
// Run with: node test-openai-tts.js

const testOpenAITTS = async () => {
  console.log('🧪 Testing OpenAI TTS endpoint...\n');

  const testText = '¡Hola! ¿Cómo estás?';
  const testCharacter = 'Sofia (barista)';

  try {
    // Check if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY not set in environment');
      console.log('   Set it with: export OPENAI_API_KEY=your-key-here\n');
      return;
    }

    console.log('✅ OPENAI_API_KEY is set');
    console.log(`📝 Test text: "${testText}"`);
    console.log(`👤 Test character: ${testCharacter}`);
    console.log('\n🔄 Making request to OpenAI TTS API...\n');

    // Directly test OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        voice: 'nova',
        input: testText,
        speed: 1.0
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.log('❌ OpenAI API Error:');
      console.log(JSON.stringify(error, null, 2));
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    const audioSize = audioBuffer.byteLength;

    console.log('✅ OpenAI TTS Success!');
    console.log(`📊 Audio size: ${audioSize} bytes (${(audioSize / 1024).toFixed(2)} KB)`);
    console.log('🎵 Voice: nova (female, young)');
    console.log('\n🎉 OpenAI TTS is working correctly!\n');
    console.log('Next steps:');
    console.log('1. Set OPENAI_API_KEY in Vercel environment variables');
    console.log('2. Deploy or test locally with npm run dev');
    console.log('3. Open settings in the app and select "OpenAI" as voice provider');
    console.log('4. Start a quest and listen to the natural voices!\n');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testOpenAITTS();

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function verifyApi() {
    console.log('Verifying Spotify API connectivity...');

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('❌ Missing CLIENT_ID or CLIENT_SECRET in .env file');
        process.exit(1);
    }

    try {
        // 1. Test Authentication (Client Credentials Flow)
        console.log('1. Testing Authentication (Client Credentials Flow)...');
        const authResponse = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'client_credentials'
            }), {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        );

        const accessToken = authResponse.data.access_token;
        console.log('✅ Authentication successful! Access Token received.');

        // 2. Test Search Endpoint (Simulating getArtist)
        console.log('2. Testing Search Endpoint...');
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: {
                q: 'Beatles',
                type: 'artist',
                limit: 1
            }
        });

        if (searchResponse.data.artists && searchResponse.data.artists.items.length > 0) {
            console.log(`✅ Search successful! Found artist: ${searchResponse.data.artists.items[0].name}`);
        } else {
            console.warn('⚠️ Search successful but returned no results (unexpected for query "Beatles").');
        }

        console.log('🎉 API Verification Completed Successfully!');

    } catch (error) {
        console.error('❌ API Verification Failed:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
        process.exit(1);
    }
}

verifyApi();

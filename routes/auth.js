import express from 'express';
import axios from 'axios';
import { generateRandomString } from '../utils/authUtils.js';

const router = express.Router();


// Login route
router.get('/login', (req, res) => {
  const state = generateRandomString(16);
  req.session.state = state;

  const scope = 'user-read-private user-read-email user-top-read';
  const redirect_uri = process.env.REDIRECT_URI;
  const client_id = process.env.CLIENT_ID;

  const authUrl =
    "https://accounts.spotify.com/authorize" +
    "?response_type=code" +
    "&client_id=" + client_id +
    "&scope=" + encodeURIComponent(scope) +
    "&redirect_uri=" + encodeURIComponent(redirect_uri) +
    "&state=" + state;

  console.log("Redirecting to Spotify with:", authUrl);
  res.redirect(authUrl);

});

// Callback route
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const redirect_uri = process.env.REDIRECT_URI;

  if (!state || state !== req.session.state) {
    return res.status(403).send('State mismatch');
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    req.session.access_token = response.data.access_token;
    req.session.refresh_token = response.data.refresh_token;

    res.redirect('/battle');
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    res.redirect("/");
  }
});

router.get("/refresh_token", async (req, res) => {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: req.session.refresh_token,
      }),
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
            ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    req.session.access_token = response.data.access_token;
    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error('Error refreshing access token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error refreshing access token' });
  }
});

export default router;
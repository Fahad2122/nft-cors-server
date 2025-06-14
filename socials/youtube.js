const express = require("express");
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config();

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://nft.urswap.io/reward';
const YOUR_CHANNEL_ID = 'UCXXXXXX'; // Replace with your channel ID

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

router.post('/verifyYoutube', async (req, res) => {
  const { token } = req.body;

  console.log("token: ", token);
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Get access_token from id_token
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    console.log("ticket: ", ticket);

    const payload = ticket.getPayload();
    const email = payload.email;

    console.log("email: ", email);

    // Exchange token for access_token (from Google OAuth token endpoint)
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: token,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    console.log("data: ", data);

    const access_token = data.access_token;

    console.log("access_token: ", access_token);

    // Call YouTube API to get list of subscriptions
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    console.log("response: ", response.data);

    const subs = response.data.items;
    const isSubscribed = subs.some(
      (sub) => sub.snippet.resourceId.channelId === YOUR_CHANNEL_ID
    );

    return res.json({
      email,
      subscribed: isSubscribed,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
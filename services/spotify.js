import axios from "axios";

export async function getArtist(token, q) {
  try {
    const res = await axios.get(`https://api.spotify.com/v1/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q,
        type: "artist",
        market: "US",
        limit: 1,
      },
    });
    return res.data.artists.items[0] || null;
  } catch (error) {
    console.error("Spotify API error:", error.response?.data || error.message);
    throw error;
  }
}

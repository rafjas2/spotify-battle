import express from 'express';
import { getArtist } from "../services/spotify.js";


const router = express.Router();

// GET /battle
router.get('/', (req, res) => {
    if (!req.session.access_token) {
        return res.redirect('/auth/login');
    }
    res.render('battle', { accessToken: req.session.access_token });
});

router.get('/search', async (req, res) => {
    const { q } = req.query;
    const accessToken = req.session.access_token;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }
    if (!q) {
        return res.status(400).json({ error: 'No query provided' })
    }

    try {
        const artist = await getArtist(accessToken, q);
        if (!artist) return res.json({ error: 'Artist not found' });
        res.json({ artist });
    } catch (error) {
        console.error('Artist search error:', error.message);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// POST /battle
router.post('/', async (req, res) => {
    const { artistOne, artistTwo } = req.body;
    const accessToken = req.session.access_token;
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    if (!artistOne || !artistTwo) {
        return res.status(400).json({ error: 'Both artists are required' });
    }

    if (artistOne.toLowerCase() === artistTwo.toLowerCase()) {
        return res.status(400).json({ error: 'Please choose two different artists!' });
    }

    try {
        const [artist1, artist2] = await Promise.all([
            getArtist(accessToken, artistOne),
            getArtist(accessToken, artistTwo)
        ]);

        if (!artist1 || !artist2) {
            return res.status(404).json({ error: 'One or both artists not found' });
        }

        const winner = (artist1.followers.total > artist2.followers.total) ? artist1 : artist2;
        res.json({ artist1, artist2, winner });
    } catch (error) {
        console.error('Error during battle:', error.message);
        res.status(500).json({ error: 'Failed to perform battle. Please try again.' });
    }
});

export default router;
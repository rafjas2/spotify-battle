import express from 'express';
import {getArtist} from "../services/spotify.js";


const router = express.Router();

// GET /battle
router.get('/', (req, res) => {
    if (!req.session.access_token) {
        return res.redirect('/auth/login');
    }
 res.render('battle', { accessToken: req.session.access_token });
});

router.get('/search', async(req, res) => {
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
        if (!artist) return res.json({ error: 'Artist not found'});
        res.json({ artist });
    } catch(error) {
        console.error('Artist search error:', error.message);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// POST /battle
router.post('/', async (req, res) => {
 const {artistOne, artistTwo} = req.body;
 const accessToken = req.session.access_token;
    if (!accessToken) {
        return res.status(401).json({error: 'Not authenticated with Spotify'});
    }

    try {
        const [artist1, artist2] = await Promise.all([
            getArtist(accessToken, artistOne),
            getArtist(accessToken, artistTwo)
        ]);

        if (!artist1 || !artist2) {
            return res.json({error: 'Artists not found'});
        }

        const winner = (artist1.followers.total > artist2.followers.total) ? artist1 : artist2;
        res.json({ artist1, artist2, winner });
    } catch (error) {
        console.error('Error during battle:', error.message);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

export default router;
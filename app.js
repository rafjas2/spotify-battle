import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import open from 'open';

import authRoutes from './routes/auth.js';
import battleRoutes from './routes/battle.js';

dotenv.config();

const app = express();
app.use(express.json());



// Live reload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(['public', 'views', 'routes']);
app.use(connectLivereload());

liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);      
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60, // 1 hour
  }
}));

//Routes
app.get('/', (req, res) => res.render('login'));
app.use('/auth', authRoutes);
app.use('/battle', battleRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});

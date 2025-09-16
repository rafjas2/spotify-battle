document.addEventListener('DOMContentLoaded', () => {
// Elements
const battleStage = document.getElementById('battle-stage');
const battleBtn = document.getElementById('battleBtn');
const winnerScreen = document.getElementById('winner-screen');
const winnerImg = document.getElementById('winner-img');
const winnerName = document.getElementById('winner-name');
const winnerFollowers = document.getElementById('winner-followers');
const backBtn = document.getElementById('backBtn');

//Artist slots
const artist1Img = document.getElementById('artist1-img');
const artist1Name = document.getElementById('artist1-name');
const artist2Img = document.getElementById('artist2-img');
const artist2Name = document.getElementById('artist2-name');

const artist1Input = document.getElementById('artist1-input');
const artist2Input = document.getElementById('artist2-input');
const addArtist1Btn = document.getElementById('add-artist1');
const addArtist2Btn = document.getElementById('add-artist2');

// Sanity check
if (!artist1Img || !artist2Img || !artist1Input || !artist2Input || !addArtist1Btn || !addArtist2Btn) {
  console.error('script.js: Required DOM elements are missing. Check your battle.ejs IDs.');
  console.log('Expected IDs: artist1-img, artist2-img, artist1-input, artist2-input, add-artist1, add-artist2');
  return;  
}


// Spartan placeholder
const spartan1 = '/img/spartan-facing-right.svg';
const spartan2 = '/img/spartan-facing-left.svg';

//Restore default placeholder on load
artist1Img.src = spartan1;
artist2Img.src = spartan2;

// Fetch artist by name
async function fetchArtistByName(name) {
    try {
        const res = await fetch(`/battle/search?q=${encodeURIComponent(name)}`);
        if (!res.ok) {
            let errJson;
            try { errJson = await res.json(); } catch(e) {}
            throw new Error(errJson?.error || `HTTP ${res.status}`);
        }
        return res.json();
    } catch (error) {
      console.error('fetchArtistByName error:', error);
      throw error;
    }
}


// Add Artist 1 
async function addArtist1() {
   const query = artist1Input.value.trim();
    if (!query) return alert('Enter an artist name'); 
    addArtist1Btn.disabled = true;

    try {
        const data = await fetchArtistByName(query);
        if (data?.artist) {
          artist1Img.src = data.artist.images?.[0]?.url || spartan1;
          artist1Name.textContent = data.artist.name;  
          artist1Input.style.display = 'none'; 
        } else {
            alert(data?.error || 'Artist not found');
        }
    } catch (error) {
       alert('Error fetching artist - check console.'); 
    } finally {
        addArtist1Btn.disabled = false;
    }
}

// Add Artist2
async function addArtist2() {
   const query = artist2Input.value.trim();
    if (!query) return alert('Enter an artist name'); 
    addArtist2Btn.disabled = true;

    try {
        const data = await fetchArtistByName(query);
        if (data?.artist) {
          artist2Img.src = data.artist.images?.[0]?.url || spartan1;
          artist2Name.textContent = data.artist.name; 
          artist2Input.style.display = 'none';  
        } else {
            alert(data?.error || 'Artist not found');
        }
    } catch (error) {
       alert('Error fetching artist - check console.'); 
    } finally {
        addArtist2Btn.disabled = false;
    }
}


// Button listeners
addArtist1Btn.addEventListener('click', addArtist1);
addArtist2Btn.addEventListener('click', addArtist2);

// Enter key listeners
artist1Input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addArtist1();
  }
});

artist2Input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addArtist2();
  }
});

// Final Battle
if (battleBtn) {
       battleBtn.addEventListener('click', async () => {
      const artistOne = artist1Name.textContent;
      const artistTwo = artist2Name.textContent;

      if (!artistOne || !artistTwo || artistOne === "" || artistTwo === "") {
        alert('Please add both artists first!');
        return;
    }

    try {
        const res = await fetch('/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistOne, artistTwo })
    });

    const data = await res.json();
    if (data.error) {
        alert(data.error);
        return;
    }

    // Show the winner
    battleStage.style.display = "none";
    battleBtn.style.display = "none";
    winnerScreen.style.display = "block";
    winnerImg.src = data.winner.images?.[0]?.url || spartan1;
    winnerName.textContent = data.winner.name;
    winnerFollowers.textContent = `Followers: ${data.winner.followers.total.toLocaleString()} `;
  } catch (error) {
    console.error('battle error', error);
    alert('Battle request failed — check console.');
  }
 });
}

// Back button resets
if (backBtn) {
  backBtn.addEventListener('click', () => {
    winnerScreen.style.display = "none";
    battleStage.style.display = "flex";
    battleBtn.style.display = "inline-block";

    // Reset placeholders
    artist1Img.src = spartan1;
    artist2Img.src = spartan2;
    artist1Name.textContent = "";
    artist2Name.textContent = "";
    artist1Input.style.display = "block";
    artist2Input.style.display = "block"; 
    artist1Input.value = "";
    artist2Input.value = "";
  });
}
});
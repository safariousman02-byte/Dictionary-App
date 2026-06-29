// ========== GET ELEMENTS ==========
const wordInput = document.getElementById('wordInput');
const searchBtn = document.getElementById('searchBtn');
const result = document.getElementById('result');
const status = document.getElementById('status');
const historyList = document.getElementById('historyList');

// ========== SAVE HISTORY ==========
let history = JSON.parse(localStorage.getItem('dictHistory')) || [];

// ========== DISPLAY HISTORY ==========
function displayHistory() {
    historyList.innerHTML = '';
    history.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.onclick = function() {
            wordInput.value = word;
            searchWord(word);
        };
        historyList.appendChild(li);
    });
}

// ========== ADD TO HISTORY ==========
function addToHistory(word) {
    // Remove if already exists
    history = history.filter(w => w !== word);
    // Add to front
    history.unshift(word);
    // Keep only last 5
    if (history.length > 5) history.pop();
    // Save to localStorage
    localStorage.setItem('dictHistory', JSON.stringify(history));
    displayHistory();
}

// ========== SEARCH WORD ==========
function searchWord(word) {
    const searchTerm = word || wordInput.value.trim();
    
    if (!searchTerm) {
        status.textContent = '⚠️ Please type a word!';
        status.className = 'status-error';
        result.innerHTML = '';
        return;
    }

    // Show loading
    status.textContent = '🔍 Searching for "' + searchTerm + '"...';
    status.className = 'status-loading';
    result.innerHTML = '';

    // FREE API - No key needed!
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`)
        .then(res => {
            if (!res.ok) throw new Error('Word not found');
            return res.json();
        })
        .then(data => {
            // Get first definition
            const wordData = data[0];
            const meaning = wordData.meanings[0];
            
            // Build HTML
            let html = `
                <div class="word-card">
                    <h2>${wordData.word}</h2>
                    <div class="phonetic">${wordData.phonetic || ''}</div>
                    <span class="part-of-speech">${meaning.partOfSpeech}</span>
                    <div class="meaning">${meaning.definitions[0].definition}</div>
            `;
            
            // Add example if exists
            if (meaning.definitions[0].example) {
                html += `<div class="example">"${meaning.definitions[0].example}"</div>`;
            }
            
            // Add more definitions if available
            if (meaning.definitions.length > 1) {
                html += `<div style="margin-top:10px;font-size:13px;color:#666;">More meanings:</div>`;
                for (let i = 1; i < Math.min(meaning.definitions.length, 3); i++) {
                    html += `<div style="font-size:13px;color:#555;margin-top:5px;">• ${meaning.definitions[i].definition}</div>`;
                }
            }
            
            html += `</div>`;
            result.innerHTML = html;
            status.textContent = `✅ Found definition for "${searchTerm}"`;
            status.className = '';
            
            // Add to history
            addToHistory(searchTerm);
        })
        .catch(() => {
            status.textContent = `❌ No definition found for "${searchTerm}"`;
            status.className = 'status-error';
            result.innerHTML = `<div class="word-card" style="border-left-color:#e53e3e;">
                <p style="color:#e53e3e;">Sorry, we couldn't find that word. Try another one!</p>
                <p style="color:#666;font-size:14px;">💡 Tip: Check your spelling</p>
            </div>`;
        });
}

// ========== SEARCH BUTTON ==========
searchBtn.onclick = function() {
    searchWord();
};

// ========== PRESS ENTER TO SEARCH ==========
wordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWord();
    }
});

// ========== LOAD HISTORY ==========
displayHistory();

// ========== SHOW DEFAULT MESSAGE ==========
status.textContent = '🔍 Enter a word and click search';
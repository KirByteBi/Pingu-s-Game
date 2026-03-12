document.addEventListener('DOMContentLoaded', () => {
    // Elementos existentes
    const generateBtn = document.getElementById('generateSeed');
    const seedInput = document.getElementById('seedInput');
    const copyBtn = document.getElementById('copySeed');
    const createBtn = document.getElementById('createGame');
    const joinBtn = document.getElementById('joinGame');
    const joinSeed = document.getElementById('joinSeed');
    
    // Elementos de configuración
    const humansMinus = document.getElementById('humansMinus');
    const humansPlus = document.getElementById('humansPlus');
    const cpuMinus = document.getElementById('cpuMinus');
    const cpuPlus = document.getElementById('cpuPlus');
    const humansCount = document.getElementById('humansCount');
    const cpuCount = document.getElementById('cpuCount');
    const totalPlayers = document.getElementById('totalPlayers');
    const configWarning = document.getElementById('configWarning');
    const modeLocal = document.getElementById('modeLocal');
    const modeOnline = document.getElementById('modeOnline');
    const modeDescription = document.getElementById('modeDescription');
    const playerSelectors = document.getElementById('playerSelectors');
    const createGameBtn = document.getElementById('createGame');
    
    // Estado
    let humans = 1;
    let cpus = 3;
    let gameMode = 'local';
    
    // Lista de pingüinos (DEFINITIVA)
    const penguins = [
        { id: 1, name: 'Pingu Azul', skin: 'pingu1.png', color: '#2196f3' },
        { id: 2, name: 'Pingu Rojo', skin: 'pingu2.png', color: '#f44336' },
        { id: 3, name: 'Pingu Verde', skin: 'pingu3.png', color: '#4caf50' },
        { id: 4, name: 'Pingu Amarillo', skin: 'pingu4.png', color: '#ffeb3b' },
        { id: 5, name: 'Pingu Rosa', skin: 'pinguR.png', color: '#e91e63', special: true },
        { id: 6, name: 'Pingu Original', skin: 'pinguO.png', color: '#607d8b', cpu: true }
    ];
    
    function generateSeed() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let seed = '';
        for (let i = 0; i < 8; i++) {
            seed += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return seed.match(/.{4}/g).join('-');
    }
    
    function updateCounts() {
        humansCount.textContent = humans;
        cpuCount.textContent = cpus;
        
        const total = humans + cpus;
        totalPlayers.textContent = total;
        
        if (total > 4) {
            configWarning.classList.remove('hidden');
            createGameBtn.disabled = true;
        } else {
            configWarning.classList.add('hidden');
            createGameBtn.disabled = false;
        }
        
        cpuMinus.disabled = cpus <= 0;
        cpuPlus.disabled = total >= 4;
        humansMinus.disabled = humans <= 1;
        humansPlus.disabled = total >= 4;
        
        generatePlayerSelectors();
    }
    
    function generatePlayerSelectors() {
        playerSelectors.innerHTML = '';
        
        // Humanos (con campo de nombre)
        for (let i = 0; i < humans; i++) {
            const selector = createPlayerSelector(i + 1, 'human', `Jugador ${i + 1}`);
            playerSelectors.appendChild(selector);
        }
        
        // CPUs (sin campo de nombre)
        for (let i = 0; i < cpus; i++) {
            const selector = createPlayerSelector(humans + i + 1, 'cpu', `CPU ${i + 1}`);
            playerSelectors.appendChild(selector);
        }
    }
    
    function createPlayerSelector(index, type, defaultName) {
        const div = document.createElement('div');
        div.className = `selector-card ${type}`;
        
        const header = document.createElement('div');
        header.className = 'selector-header';
        
        const playerType = type === 'human' ? 
            (window.translations ? window.translations[currentLang]?.human || '👤 HUMANO' : '👤 HUMANO') : 
            (window.translations ? window.translations[currentLang]?.cpu || '🤖 CPU' : '🤖 CPU');
        
        header.innerHTML = `
            <span class="player-type">${playerType}</span>
            <span>J${index}</span>
        `;
        
        let html = '';
        html += header.outerHTML;
        
        // Campo de nombre solo para humanos
        if (type === 'human') {
            const namePlaceholder = window.translations ? 
                window.translations[currentLang]?.placeholderName || 'Nombre' : 'Nombre';
            html += `
                <div class="player-name-field">
                    <input type="text" id="playerName${index}" class="player-name-input" 
                           value="${defaultName}" maxlength="15" placeholder="${namePlaceholder}">
                </div>
            `;
        }
        
        // Selector de skin
        html += `<select id="player${index}Skin" class="player-skin-select">`;
        
        let availablePenguins = type === 'cpu' ? 
            penguins.filter(p => p.cpu) : 
            penguins.filter(p => !p.cpu);
        
        availablePenguins.forEach(penguin => {
            const selected = (type === 'cpu' && penguin.cpu) ? 'selected' : '';
            const spanishName = penguin.name;
            let displayName = spanishName;
            
            if (window.translations && window.translations[currentLang]?.penguinNames[spanishName]) {
                displayName = window.translations[currentLang].penguinNames[spanishName];
            }
            
            html += `<option value="${penguin.skin}" data-spanish="${spanishName}" ${selected}>${displayName}</option>`;
        });
        
        html += `</select>`;
        
        div.innerHTML = html;
        
        return div;
    }
    
    // Event listeners
    generateBtn.addEventListener('click', () => {
        const newSeed = generateSeed();
        seedInput.value = newSeed;
        createBtn.disabled = false;
    });
    
    copyBtn.addEventListener('click', async () => {
        if (!seedInput.value) {
            const msg = window.translations ? 
                window.translations[currentLang]?.needSeed || '¡Primero genera una seed! 🎲' : 
                '¡Primero genera una seed! 🎲';
            alert(msg);
            return;
        }
        try {
            await navigator.clipboard.writeText(seedInput.value);
            copyBtn.textContent = '✅';
            setTimeout(() => copyBtn.textContent = '📋', 2000);
        } catch (err) {
            alert('No se pudo copiar la seed');
        }
    });
    
    humansPlus.addEventListener('click', () => {
        if (humans + cpus < 4) {
            humans++;
            updateCounts();
        }
    });
    
    humansMinus.addEventListener('click', () => {
        if (humans > 1) {
            humans--;
            updateCounts();
        }
    });
    
    cpuPlus.addEventListener('click', () => {
        if (humans + cpus < 4) {
            cpus++;
            updateCounts();
        }
    });
    
    cpuMinus.addEventListener('click', () => {
        if (cpus > 0) {
            cpus--;
            updateCounts();
        }
    });
    
    modeLocal.addEventListener('click', () => {
        gameMode = 'local';
        modeLocal.classList.add('active');
        modeOnline.classList.remove('active');
        const desc = window.translations ? 
            window.translations[currentLang]?.modeLocalDesc || 'Todos juegan en este ordenador, turnándose' : 
            'Todos juegan en este ordenador, turnándose';
        modeDescription.textContent = desc;
    });
    
    modeOnline.addEventListener('click', () => {
        gameMode = 'online';
        modeOnline.classList.add('active');
        modeLocal.classList.remove('active');
        const desc = window.translations ? 
            window.translations[currentLang]?.modeOnlineDesc || 'Cada jugador desde su PC (comparte la seed)' : 
            'Cada jugador desde su PC (comparte la seed)';
        modeDescription.textContent = desc;
    });
    
    // CREAR PARTIDA
    createGameBtn.addEventListener('click', () => {
        if (!seedInput.value) return;
        
        const players = [];
        for (let i = 0; i < humans + cpus; i++) {
            const select = document.getElementById(`player${i+1}Skin`);
            if (select) {
                const isCPU = i >= humans;
                let playerName = '';
                
                if (isCPU) {
                    playerName = `CPU ${i - humans + 1}`;
                } else {
                    const nameInput = document.getElementById(`playerName${i+1}`);
                    playerName = nameInput ? nameInput.value.trim() : `Jugador ${i + 1}`;
                    if (playerName === '') playerName = `Jugador ${i + 1}`;
                }
                
                players.push({
                    id: i + 1,
                    name: playerName,
                    skin: select.value,
                    fish: 10,
                    ice: 0,
                    position: 0,
                    isCPU: isCPU,
                    items: { slowDice: 0, turboDice: 0 }
                });
            }
        }
        
        // Guardar todo
        sessionStorage.setItem('pinguSeed', seedInput.value);
        sessionStorage.setItem('pinguHost', 'true');
        sessionStorage.setItem('pinguMode', gameMode);
        sessionStorage.setItem('pinguPlayers', JSON.stringify(players));
        
        // Ir al juego
        window.location.href = 'game.html';
    });
    
    // UNIRSE A PARTIDA
    joinBtn.addEventListener('click', () => {
        const seed = joinSeed.value.trim().toUpperCase();
        
        if (!seed) {
            const msg = window.translations ? 
                window.translations[currentLang]?.needSeed || '¡Introduce una seed! 🎲' : 
                '¡Introduce una seed! 🎲';
            alert(msg);
            return;
        }
        
        const cleanSeed = seed.replace(/-/g, '');
        if (cleanSeed.length !== 8 || !/^[A-Z0-9]{8}$/.test(cleanSeed)) {
            const msg = window.translations ? 
                window.translations[currentLang]?.invalidSeed || '❌ Seed inválida. Debe tener 8 caracteres' : 
                '❌ Seed inválida. Debe tener 8 caracteres';
            alert(msg);
            return;
        }
        
        sessionStorage.setItem('pinguSeed', seed);
        sessionStorage.setItem('pinguHost', 'false');
        sessionStorage.setItem('pinguMode', 'online');
        
        // Seleccionar pingüino
        const availablePenguins = penguins.filter(p => !p.cpu);
        let message = window.translations ? 
            window.translations[currentLang]?.selectPenguins || '¿Qué pingüino quieres ser?\n' : 
            '¿Qué pingüino quieres ser?\n';
        
        availablePenguins.forEach((p, index) => {
            let name = p.name;
            if (window.translations && window.translations[currentLang]?.penguinNames[p.name]) {
                name = window.translations[currentLang].penguinNames[p.name];
            }
            message += `${index + 1}. ${name}\n`;
        });
        
        const selectedIndex = prompt(message, '1');
        if (selectedIndex) {
            const index = parseInt(selectedIndex) - 1;
            if (index >= 0 && index < availablePenguins.length) {
                const selectedPenguin = availablePenguins[index];
                sessionStorage.setItem('pinguMySkin', selectedPenguin.skin);
                sessionStorage.setItem('pinguMyName', selectedPenguin.name);
            }
        }
        
        window.location.href = 'game.html';
    });
    
    // Seed en URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedSeed = urlParams.get('seed');
    if (sharedSeed) {
        joinSeed.value = sharedSeed;
    }
    
    updateCounts();
});

// Escuchar cambios de idioma
window.addEventListener('languageChanged', (e) => {
    const currentLang = e.detail.lang;
    
    // Actualizar placeholders de nombres
    document.querySelectorAll('.player-name-input').forEach(input => {
        input.placeholder = window.translations?.[currentLang]?.placeholderName || 'Nombre';
    });
    
    // Actualizar tipos de jugador
    document.querySelectorAll('.selector-card').forEach(card => {
        const typeSpan = card.querySelector('.player-type');
        if (card.classList.contains('human')) {
            typeSpan.textContent = window.translations?.[currentLang]?.human || '👤 HUMANO';
        } else {
            typeSpan.textContent = window.translations?.[currentLang]?.cpu || '🤖 CPU';
        }
    });
    
    // Actualizar opciones de los selects
    document.querySelectorAll('.player-skin-select').forEach(select => {
        Array.from(select.options).forEach(option => {
            const spanishName = option.getAttribute('data-spanish') || option.textContent;
            option.setAttribute('data-spanish', spanishName);
            
            if (window.translations?.[currentLang]?.penguinNames[spanishName]) {
                option.textContent = window.translations[currentLang].penguinNames[spanishName];
            }
        });
    });
    
    // Actualizar descripción del modo
    const modeDesc = document.getElementById('modeDescription');
    const modeOnline = document.getElementById('modeOnline');
    if (modeDesc && modeOnline) {
        modeDesc.textContent = modeOnline.classList.contains('active') ?
            (window.translations?.[currentLang]?.modeOnlineDesc || 'Cada jugador desde su PC (comparte la seed)') :
            (window.translations?.[currentLang]?.modeLocalDesc || 'Todos juegan en este ordenador, turnándose');
    }
});
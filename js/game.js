document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Iniciando Pingu\'s Game...');
    
    // Función para obtener textos traducidos (YA ESTÁ)
    function t(key, params = {}) {
        if (window.translateText) {
            return window.translateText(key, params);
        }
        return key;
    }
    
    // Obtener datos
    const seed = sessionStorage.getItem('pinguSeed') || 'PING-0000';
    const gameMode = sessionStorage.getItem('pinguMode') || 'local';
    const isHost = sessionStorage.getItem('pinguHost') === 'true';
    
    document.getElementById('currentSeed').textContent = seed;
    
    // Mostrar modo en el header
    const seedInfo = document.querySelector('.seed-info');
    if (seedInfo) {
        const badge = document.createElement('span');
        badge.className = `mode-badge ${gameMode}`;
        badge.textContent = gameMode === 'online' ? '🌐 ONLINE' : '🖥️ LOCAL';
        seedInfo.appendChild(badge);
    }
    
    // Generar tablero
    const seedNumber = seed.split('-').join('').split('').map(c => c.charCodeAt(0)).reduce((a,b) => a+b, 0);
    const board = new PinguBoard(seedNumber);
    board.generate();
    
    // Cargar jugadores
    let misJugadores = [];
    const saved = sessionStorage.getItem('pinguPlayers');
    
    if (saved) {
        misJugadores = JSON.parse(saved);
    } else {
        // Si no hay guardados, crear por defecto
        const mySkin = sessionStorage.getItem('pinguMySkin') || 'pingu1.png';
        const myName = sessionStorage.getItem('pinguMyName') || 'Jugador 1';
        
        misJugadores = [
            { 
                id: 1, name: myName, skin: mySkin, 
                fish: 10, ice: 0, position: 0, isCPU: false,
                items: { slowDice: 0, turboDice: 0 } 
            },
            { 
                id: 2, name: 'CPU 1', skin: 'pinguO.png', 
                fish: 10, ice: 0, position: 0, isCPU: true,
                items: { slowDice: 0, turboDice: 0 }
            },
            { 
                id: 3, name: 'CPU 2', skin: 'pinguO.png', 
                fish: 10, ice: 0, position: 0, isCPU: true,
                items: { slowDice: 0, turboDice: 0 }
            },
            { 
                id: 4, name: 'CPU 3', skin: 'pinguO.png', 
                fish: 10, ice: 0, position: 0, isCPU: true,
                items: { slowDice: 0, turboDice: 0 }
            }
        ];
    }
    
    const players = new PinguPlayers();
    players.players = misJugadores;
    
    // Estado del juego
    let gameState = {
        turno: 0,
        jugadores: misJugadores,
        gameOver: false,
        thiefActive: false
    };
    
    players.currentTurn = 0;
    let currentPlayer = players.players[0];
    let waitingForDice = true;
    let cpuTimer = null;
    
    // Variable para controlar si estamos online
    let isOnline = false;
    let partyAvailable = false;
    let myId = 0;
    
    // Intentar conectar si es modo online
    if (gameMode === 'online' && typeof partyConnect !== 'undefined') {
        try {
            console.log('🌐 Intentando conectar online...');
            await partyConnect(seed);
            isOnline = true;
            partyAvailable = true;
            myId = partyMyId() || 0;
            console.log('✅ Conectado online, mi ID:', myId);
            
            // Configurar party
            let sharedState = partyLoadShared({
                turno: 0,
                jugadores: misJugadores,
                gameOver: false
            });
            
            if (sharedState.jugadores) {
                players.players = sharedState.jugadores;
                gameState.turno = sharedState.turno;
                players.currentTurn = sharedState.turno;
                currentPlayer = players.players[sharedState.turno];
            }
            
            partyWatchShared((nuevoEstado) => {
                if (cpuTimer) {
                    clearTimeout(cpuTimer);
                    cpuTimer = null;
                }
                
                gameState = nuevoEstado;
                players.players = nuevoEstado.jugadores;
                gameState.turno = nuevoEstado.turno;
                players.currentTurn = nuevoEstado.turno;
                currentPlayer = players.players[nuevoEstado.turno];
                
                actualizarVista();
                
                const esMiTurno = (nuevoEstado.turno + 1) === myId;
                
                if (esMiTurno && !currentPlayer.isCPU) {
                    enableDice(true);
                    waitingForDice = true;
                } else {
                    enableDice(false);
                    waitingForDice = false;
                    
                    if (currentPlayer.isCPU && isHost) {
                        manejarCPU();
                    }
                }
            });
            
        } catch (error) {
            console.log('⚠️ No se pudo conectar online, usando modo local');
            isOnline = false;
        }
    }
    
    // Si es modo local
    if (!isOnline) {
        console.log('🏠 Modo local activado');
        myId = 1;
    }
    
    // Renderizar vista inicial
    function actualizarVista() {
        board.render('board', players.players);
        players.renderPlayers('playersContainer');
        updateTurnDisplay();
        updateDiceCounters();
    }
    
    actualizarVista();
    
    // Configurar turno inicial
    function configurarTurnoInicial() {
        const esMiTurno = (gameState.turno + 1) === myId;
        
        if (!isOnline) {
            if (gameState.turno === 0) {
                enableDice(true);
                waitingForDice = true;
            } else {
                enableDice(false);
                waitingForDice = false;
                if (currentPlayer.isCPU) {
                    manejarCPU();
                }
            }
        } else {
            if (esMiTurno && !currentPlayer.isCPU) {
                enableDice(true);
                waitingForDice = true;
            } else {
                enableDice(false);
                waitingForDice = false;
                if (currentPlayer.isCPU && isHost) {
                    manejarCPU();
                }
            }
        }
    }
    
    configurarTurnoInicial();
    
    // Event listeners
    document.getElementById('diceNormal').addEventListener('click', () => rollDice('normal'));
    document.getElementById('diceSlow').addEventListener('click', () => rollDice('slow'));
    document.getElementById('diceTurbo').addEventListener('click', () => rollDice('turbo'));
    
    document.getElementById('chaoticClose').addEventListener('click', () => {
        document.getElementById('chaoticPopup').classList.add('hidden');
        endTurn();
    });
    
    document.getElementById('thiefClose').addEventListener('click', () => {
        document.getElementById('thiefPopup').classList.add('hidden');
        endTurn();
    });
    
    function rollDice(type) {
        if (!waitingForDice || gameState.gameOver || currentPlayer.isCPU) {
            console.log('⛔ No es tu turno o es turno de CPU');
            showMessage(t('notYourTurn'), 'warning');
            return;
        }
        
        const esMiTurno = (gameState.turno + 1) === myId;
        if (!esMiTurno && isOnline) {
            console.log('⛔ No es tu turno según online');
            showMessage(t('notYourTurn'), 'warning');
            return;
        }
        
        const player = currentPlayer;
        console.log('🎲 Tirando dado', type, 'de', player.name);
        
        if (type !== 'normal') {
            const hasDice = type === 'slow' ? player.items.slowDice > 0 : player.items.turboDice > 0;
            if (!hasDice) {
                // ESTE MENSAJE TAMBIÉN DEBERÍA TRADUCIRSE
                showMessage(t('noDice') + ` ${type === 'slow' ? 'lentos' : 'turbo'}!`, 'warning');
                return;
            }
            players.useDice(player.id, type);
        }
        
        let steps;
        switch(type) {
            case 'slow': steps = Math.floor(Math.random() * 3) + 1; break;
            case 'turbo': steps = Math.floor(Math.random() * 6) + 5; break;
            default: steps = Math.floor(Math.random() * 6) + 1;
        }
        
        waitingForDice = false;
        enableDice(false);
        animateDice(type, steps);
    }
    
    function animateDice(type, steps) {
        const diceBtn = document.getElementById(`dice${type.charAt(0).toUpperCase() + type.slice(1)}`);
        const originalHTML = diceBtn.innerHTML;
        
        let count = 0;
        const interval = setInterval(() => {
            count++;
            let randomStep;
            switch(type) {
                case 'slow': randomStep = Math.floor(Math.random() * 3) + 1; break;
                case 'turbo': randomStep = Math.floor(Math.random() * 6) + 5; break;
                default: randomStep = Math.floor(Math.random() * 6) + 1;
            }
            
            if (diceBtn.querySelector('.dice-range')) {
                diceBtn.querySelector('.dice-range').textContent = randomStep;
            }
            
            if (count > 10) {
                clearInterval(interval);
                diceBtn.innerHTML = originalHTML;
                movePlayer(steps);
            }
        }, 100);
    }
    
    function movePlayer(steps) {
        const player = currentPlayer;
        const oldPosition = player.position;
        
        const positionsPassed = [];
        for (let i = 1; i <= steps; i++) {
            positionsPassed.push((oldPosition + i) % 50);
        }
        
        const result = players.movePlayer(player.id, steps);
        const newPosition = player.position;
        
        // ===== ICE CUBE SHOP =====
        if (result.passedIce) {
            if (!player.isCPU) {
                // Solo humanos pueden decidir comprar
                if (player.fish >= 15) {
                    if (confirm(`🧊 ${t('iceCube')} 🧊\n\n${t('iceCubeShop')}\n\n${t('fish')}: ${player.fish}`)) {
                        player.fish -= 15;
                        player.ice += 1;
                        showMessage(t('iceCube') + ' 🧊', 'item');
                    } else {
                        showMessage(t('noPurchase'), 'info');
                    }
                } else {
                    showMessage(t('notEnoughFish') + ` (${player.fish}/15)`, 'warning');
                }
            } else {
                // CPUs compran automáticamente si tienen suficientes peces
                if (player.fish >= 15) {
                    player.fish -= 15;
                    player.ice += 1;
                    showMessage(`🤖 CPU ${t('iceCube')} 🧊`, 'item');
                }
            }
            
            // Volver al inicio
            players.movePlayerTo(player.id, 0);
            showMessage(t('backToStart'), 'info');
            
            gameState.jugadores = players.players;
            if (isOnline && partyAvailable) {
                partyUpdateShared(gameState);
            }
            
            actualizarVista();
            setTimeout(() => endTurn(), 2000);
            return;
        }
        // ===== FIN ICE CUBE SHOP =====
        
        const casillaTipo = board.board[newPosition];
        
        gameState.jugadores = players.players;
        
        if (isOnline && partyAvailable) {
            partyUpdateShared(gameState);
        }
        
        actualizarVista();
        
        applyTileEffect(casillaTipo, player, steps, oldPosition, newPosition, positionsPassed);
    }
    
    function applyTileEffect(tipo, player, steps, oldPosition, newPosition, positionsPassed) {
        switch(tipo) {
            case 'fish':
                players.addFish(player.id, 3);
                showMessage(t('fishFound'), 'info');
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                setTimeout(() => endTurn(), 1500);
                break;
                
            case 'dado-lento':
                players.addSlowDice(player.id);
                showMessage(t('slowDice'), 'item');
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                updateDiceCounters();
                setTimeout(() => endTurn(), 1500);
                break;
                
            case 'dado-turbo':
                players.addTurboDice(player.id);
                showMessage(t('turboDice'), 'item');
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                updateDiceCounters();
                setTimeout(() => endTurn(), 1500);
                break;
                
            case 'trineo':
                let nextPos = newPosition + 1;
                let encontrado = false;
                while (nextPos < board.board.length) {
                    if (board.board[nextPos] === 'trineo') {
                        players.movePlayerTo(player.id, nextPos);
                        gameState.jugadores = players.players;
                        if (isOnline) partyUpdateShared(gameState);
                        showMessage(`🛷 ${t('sleigh')}`, 'info');
                        encontrado = true;
                        break;
                    }
                    nextPos++;
                }
                if (!encontrado) {
                    showMessage(`🛷 ${t('noSleigh')}`, 'info');
                }
                setTimeout(() => endTurn(), 2000);
                break;
                
            case 'agujero':
                let prevPos = newPosition - 1;
                let encontradoA = false;
                while (prevPos >= 0) {
                    if (board.board[prevPos] === 'agujero') {
                        players.movePlayerTo(player.id, prevPos);
                        gameState.jugadores = players.players;
                        if (isOnline) partyUpdateShared(gameState);
                        showMessage(`🕳️ ${t('hole')}`, 'info');
                        encontradoA = true;
                        break;
                    }
                    prevPos--;
                }
                if (!encontradoA) {
                    showMessage(`🕳️ ${t('noHole')}`, 'info');
                }
                setTimeout(() => endTurn(), 2000);
                break;
                
            case 'ladron':
                const stolen = players.stealFromPlayers(player.id, positionsPassed, 2);
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                
                if (stolen.length > 0) {
                    showMessage(`🦹 ${t('thief')} (${stolen.length})`, 'thief');
                    document.getElementById('thiefMessage').textContent = `${t('thief')} ${stolen.length}!`;
                    document.getElementById('thiefPopup').classList.remove('hidden');
                    actualizarVista();
                } else {
                    showMessage(`🦹 ${t('thiefNoOne')}`, 'info');
                    setTimeout(() => endTurn(), 1500);
                }
                break;
                
            case 'chaotic':
                const event = players.executeChaoticEvent(player.id);
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                
                // AQUÍ TAMBIÉN TRADUCIMOS EL MENSAJE DEL EVENTO CHAOTIC
                const eventMessage = t('chaotic') + ': ' + event.message;
                showMessage(eventMessage, 'chaotic');
                document.getElementById('chaoticMessage').textContent = eventMessage;
                document.getElementById('chaoticPopup').classList.remove('hidden');
                actualizarVista();
                break;
                
            default:
                setTimeout(() => endTurn(), 1000);
        }
    }
    
    function endTurn() {
        if (gameState.gameOver) return;
        
        if (cpuTimer) {
            clearTimeout(cpuTimer);
            cpuTimer = null;
        }
        
        gameState.turno = (gameState.turno + 1) % players.players.length;
        gameState.thiefActive = false;
        currentPlayer = players.players[gameState.turno];
        players.currentTurn = gameState.turno;
        
        if (isOnline) {
            partyUpdateShared(gameState);
        }
        
        actualizarVista();
        checkWinCondition();
        
        const esMiTurno = (gameState.turno + 1) === myId;
        
        if (esMiTurno && !currentPlayer.isCPU) {
            waitingForDice = true;
            enableDice(true);
        } else {
            waitingForDice = false;
            enableDice(false);
            
            if (currentPlayer.isCPU) {
                if (!isOnline || isHost) {
                    manejarCPU();
                }
            }
        }
    }
    
    function manejarCPU() {
        if (cpuTimer) {
            clearTimeout(cpuTimer);
        }
        
        cpuTimer = setTimeout(() => {
            if (gameState.gameOver) return;
            if (!currentPlayer.isCPU) return;
            
            const diceType = players.getCPUDecision(currentPlayer.id);
            showMessage(`🤖 ${currentPlayer.name} ${t('thinking')}...`, 'info');
            
            setTimeout(() => {
                if (gameState.gameOver) return;
                if (!currentPlayer.isCPU) return;
                
                console.log('🤖 CPU', currentPlayer.name, 'tira dado', diceType);
                
                if (diceType !== 'normal') {
                    const hasDice = diceType === 'slow' ? 
                        currentPlayer.items.slowDice > 0 : 
                        currentPlayer.items.turboDice > 0;
                    
                    if (!hasDice) {
                        rollDiceCPU('normal');
                        return;
                    }
                    players.useDice(currentPlayer.id, diceType);
                }
                
                let steps;
                switch(diceType) {
                    case 'slow': steps = Math.floor(Math.random() * 3) + 1; break;
                    case 'turbo': steps = Math.floor(Math.random() * 6) + 5; break;
                    default: steps = Math.floor(Math.random() * 6) + 1;
                }
                
                movePlayerCPU(steps);
                
            }, 1000);
            
        }, 1500);
    }
    
    function rollDiceCPU(type) {
        const player = currentPlayer;
        
        if (type !== 'normal') {
            const hasDice = type === 'slow' ? player.items.slowDice > 0 : player.items.turboDice > 0;
            if (!hasDice) {
                rollDiceCPU('normal');
                return;
            }
            players.useDice(player.id, type);
        }
        
        let steps;
        switch(type) {
            case 'slow': steps = Math.floor(Math.random() * 3) + 1; break;
            case 'turbo': steps = Math.floor(Math.random() * 6) + 5; break;
            default: steps = Math.floor(Math.random() * 6) + 1;
        }
        
        movePlayerCPU(steps);
    }
    
    function movePlayerCPU(steps) {
        const player = currentPlayer;
        const oldPosition = player.position;
        
        const positionsPassed = [];
        for (let i = 1; i <= steps; i++) {
            positionsPassed.push((oldPosition + i) % 50);
        }
        
        const result = players.movePlayer(player.id, steps);
        
        // ===== ICE CUBE SHOP PARA CPU =====
        if (result.passedIce) {
            if (player.fish >= 15) {
                player.fish -= 15;
                player.ice += 1;
                showMessage(`🤖 CPU ${t('iceCube')} 🧊`, 'item');
            }
            
            // Volver al inicio
            players.movePlayerTo(player.id, 0);
            
            gameState.jugadores = players.players;
            if (isOnline) partyUpdateShared(gameState);
            
            actualizarVista();
            setTimeout(() => endTurn(), 2000);
            return;
        }
        // ===== FIN ICE CUBE SHOP CPU =====
        
        const casillaTipo = board.board[player.position];
        
        gameState.jugadores = players.players;
        if (isOnline) partyUpdateShared(gameState);
        
        actualizarVista();
        
        applyTileEffectCPU(casillaTipo, player, steps, oldPosition, player.position, positionsPassed);
    }
    
    function applyTileEffectCPU(tipo, player, steps, oldPosition, newPosition, positionsPassed) {
        switch(tipo) {
            case 'fish':
                players.addFish(player.id, 3);
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                setTimeout(() => endTurn(), 1500);
                break;
                
            case 'dado-lento':
                players.addSlowDice(player.id);
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                setTimeout(() => endTurn(), 1500);
                break;
                
            case 'dado-turbo':
                players.addTurboDice(player.id);
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                setTimeout(() => endTurn(), 1500);
                break;
                
            case 'trineo':
                let nextPos = newPosition + 1;
                while (nextPos < board.board.length) {
                    if (board.board[nextPos] === 'trineo') {
                        players.movePlayerTo(player.id, nextPos);
                        gameState.jugadores = players.players;
                        if (isOnline) partyUpdateShared(gameState);
                        break;
                    }
                    nextPos++;
                }
                setTimeout(() => endTurn(), 2000);
                break;
                
            case 'agujero':
                let prevPos = newPosition - 1;
                while (prevPos >= 0) {
                    if (board.board[prevPos] === 'agujero') {
                        players.movePlayerTo(player.id, prevPos);
                        gameState.jugadores = players.players;
                        if (isOnline) partyUpdateShared(gameState);
                        break;
                    }
                    prevPos--;
                }
                setTimeout(() => endTurn(), 2000);
                break;
                
            case 'ladron':
                players.stealFromPlayers(player.id, positionsPassed, 2);
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                setTimeout(() => endTurn(), 1500);
                break;
                
            case 'chaotic':
                players.executeChaoticEvent(player.id);
                gameState.jugadores = players.players;
                if (isOnline) partyUpdateShared(gameState);
                setTimeout(() => endTurn(), 1500);
                break;
                
            default:
                setTimeout(() => endTurn(), 1000);
        }
    }
    
    function updateTurnDisplay() {
        const player = currentPlayer;
        const turnDiv = document.getElementById('currentPlayer');
        turnDiv.innerHTML = `
            <img src="images/penguins/${player.skin}" alt="${player.name}" class="player-avatar" 
                 onerror="this.src='images/penguins/pinguO.png'">
            <span class="player-name">${player.isCPU ? '🤖 ' : '👤 '}${player.name}</span>
        `;
    }
    
    function updateDiceCounters() {
        const player = currentPlayer;
        document.getElementById('slowCount').textContent = player.items.slowDice;
        document.getElementById('turboCount').textContent = player.items.turboDice;
    }
    
    function enableDice(enable) {
        const player = currentPlayer;
        console.log('🎲 Habilitar dados:', enable, 'para', player.name);
        
        document.getElementById('diceNormal').disabled = !enable;
        document.getElementById('diceSlow').disabled = !enable || player.items.slowDice === 0;
        document.getElementById('diceTurbo').disabled = !enable || player.items.turboDice === 0;
        
        updateDiceCounters();
    }
    
    function showMessage(msg, type = 'info') {
        console.log(`[${type}] ${msg}`);
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
    
    function checkWinCondition() {
        const winners = players.players.filter(p => p.ice >= 3);
        if (winners.length > 0) {
            gameState.gameOver = true;
            if (isOnline) partyUpdateShared(gameState);
            enableDice(false);
            
            if (cpuTimer) {
                clearTimeout(cpuTimer);
                cpuTimer = null;
            }
            
            const winner = winners[0];
            alert(`🏆 ¡${winner.name} ${t('winner')}! 🏆`);
            
            if (confirm(t('playAgain'))) {
                window.location.href = 'index.html';
            }
        }
    }
});

// Escuchar cambios de idioma para actualizar textos dinámicos
window.addEventListener('languageChanged', () => {
    // Actualizar textos de los popups si están visibles
    const chaoticMsg = document.getElementById('chaoticMessage');
    const thiefMsg = document.getElementById('thiefMessage');
    
    // Si los popups están visibles, actualizar sus textos
    if (!document.getElementById('chaoticPopup').classList.contains('hidden')) {
        // El mensaje ya se actualiza en el evento chaotic
    }
    if (!document.getElementById('thiefPopup').classList.contains('hidden')) {
        // El mensaje ya se actualiza en el evento ladron
    }
});
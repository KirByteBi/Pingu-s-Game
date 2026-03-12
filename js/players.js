class PinguPlayers {
    constructor() {
        this.players = [];
        this.currentTurn = 0;
    }
    
    getCurrentPlayer() {
        return this.players[this.currentTurn];
    }
    
    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
        return this.getCurrentPlayer();
    }
    
    movePlayer(playerId, steps, totalCasillas = 50) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return null;
        
        let newPosition = player.position + steps;
        let gaveBonus = false;
        let passedIce = false;
        
        // Comprobar si pasa por la casilla 50 (Ice Cube)
        for (let i = player.position + 1; i <= newPosition; i++) {
            if (i === 49) { // Casilla 50 (índice 49)
                passedIce = true;
            }
        }
        
        // Vuelta al inicio si pasa de 50
        if (newPosition >= totalCasillas) {
            newPosition = newPosition - totalCasillas;
            // Bonus por vuelta completa
            player.fish += 5;
            gaveBonus = true;
        }
        
        player.position = newPosition;
        
        // Si pasó por el Ice Cube, gana uno
        if (passedIce) {
            player.ice++;
            return { player, gaveBonus, passedIce: true };
        }
        
        return { player, gaveBonus, passedIce: false };
    }
    
    movePlayerTo(playerId, newPosition) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return null;
        
        player.position = newPosition;
        return player;
    }
    
    addFish(playerId, cantidad) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.fish += cantidad;
        }
    }
    
    addIce(playerId, cantidad) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.ice += cantidad;
        }
    }
    
    removeFish(playerId, cantidad) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.fish = Math.max(0, player.fish - cantidad);
        }
    }
    
    // Añadir dado lento
    addSlowDice(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.items.slowDice++;
        }
    }
    
    // Añadir dado turbo
    addTurboDice(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.items.turboDice++;
        }
    }
    
    // Usar dado (resta 1 si es especial)
    useDice(playerId, diceType) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return false;
        
        if (diceType === 'slow') {
            if (player.items.slowDice > 0) {
                player.items.slowDice--;
                return true;
            }
            return false;
        } else if (diceType === 'turbo') {
            if (player.items.turboDice > 0) {
                player.items.turboDice--;
                return true;
            }
            return false;
        }
        return true; // Dado normal siempre disponible
    }
    
    getPlayersAtPosition(position) {
        return this.players.filter(p => p.position === position);
    }
    
    // Robar peces a otros jugadores
    stealFromPlayers(thiefId, positionsPassed, amount = 2) {
        const thief = this.players.find(p => p.id === thiefId);
        if (!thief) return [];
        
        const stolen = [];
        const playersPassed = [];
        
        // Identificar jugadores en las posiciones por las que pasó
        positionsPassed.forEach(pos => {
            const playersHere = this.getPlayersAtPosition(pos).filter(p => p.id !== thiefId);
            playersPassed.push(...playersHere);
        });
        
        // Eliminar duplicados (mismo jugador en varias casillas)
        const uniquePlayers = [...new Map(playersPassed.map(p => [p.id, p])).values()];
        
        // Robar a cada uno
        uniquePlayers.forEach(player => {
            const stealAmount = Math.min(amount, player.fish);
            if (stealAmount > 0) {
                player.fish -= stealAmount;
                thief.fish += stealAmount;
                stolen.push({
                    playerId: player.id,
                    playerName: player.name,
                    amount: stealAmount
                });
            }
        });
        
        return stolen;
    }
    
    renderPlayers(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        this.players.forEach(player => {
            const card = document.createElement('div');
            card.className = `player-card ${player.id === this.currentTurn + 1 ? 'active' : ''} ${player.isCPU ? 'cpu-player' : ''}`;
            card.dataset.playerId = player.id;
            
            // Mostrar items
            const itemsHTML = [];
            if (player.items.slowDice > 0) {
                itemsHTML.push(`<span class="item-badge slow">🐢 ${player.items.slowDice}</span>`);
            }
            if (player.items.turboDice > 0) {
                itemsHTML.push(`<span class="item-badge turbo">⚡ ${player.items.turboDice}</span>`);
            }
            
            card.innerHTML = `
                <img src="images/penguins/${player.skin}" alt="${player.name}" 
                     onerror="this.src='images/penguins/pinguO.png'">
                <div class="player-info">
                    <div class="player-name">
                        ${player.isCPU ? '🤖 ' : '👤 '}${player.name}
                    </div>
                    <div class="player-stats">
                        <span class="fish-stat">🐟 ${player.fish}</span>
                        <span class="ice-stat">🧊 ${player.ice}</span>
                    </div>
                    <div class="player-items">
                        ${itemsHTML.join('')}
                    </div>
                </div>
                <div class="player-position">📍${player.position + 1}</div>
            `;
            
            container.appendChild(card);
        });
    }
    
    // Eventos Chaotic
    executeChaoticEvent(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return { message: 'Error', fishChange: 0 };
        
        const events = [
            {
                name: 'Ventisca',
                message: '¡Una ventisca te hace perder 5 peces! ❄️',
                execute: () => {
                    this.removeFish(playerId, 5);
                    return { fishChange: -5 };
                }
            },
            {
                name: 'Tragamonedas',
                message: '¡Juega al tragamonedas!',
                execute: () => {
                    const suerte = Math.random();
                    if (suerte < 0.3) {
                        this.addFish(playerId, 10);
                        return { fishChange: 10, special: '¡GANASTE 10 PECES! 🎰' };
                    } else if (suerte < 0.6) {
                        this.addFish(playerId, 5);
                        return { fishChange: 5, special: '¡GANASTE 5 PECES! 🎰' };
                    } else {
                        this.removeFish(playerId, 3);
                        return { fishChange: -3, special: 'Perdiste 3 peces... 🎰' };
                    }
                }
            },
            {
                name: 'Fiesta',
                message: '¡Es hora de fiesta! Todos reciben 2 peces',
                execute: () => {
                    this.players.forEach(p => {
                        p.fish += 2;
                    });
                    return { fishChange: 2, special: '¡FIESTA! 🎉' };
                }
            },
            {
                name: 'Pesca milagrosa',
                message: '¡Encuentras un banco de peces!',
                execute: () => {
                    const peces = Math.floor(Math.random() * 8) + 3; // 3-10 peces
                    this.addFish(playerId, peces);
                    return { fishChange: peces, special: `+${peces} peces 🐟` };
                }
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        const result = event.execute();
        
        return {
            name: event.name,
            message: result.special ? `${event.message} ${result.special}` : event.message,
            fishChange: result.fishChange
        };
    }
    
    // Lógica para CPUs
    getCPUDecision(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return 'normal';
        
        // Lógica mejorada para CPUs
        // Si tiene dados turbo y está en desventaja, usarlos
        if (player.items.turboDice > 0 && player.fish < 15) {
            return 'turbo';
        }
        
        // Si tiene dados lentos y muchos peces, usarlos para control
        if (player.items.slowDice > 0 && player.fish > 20) {
            return 'slow';
        }
        
        // Probabilidades normales
        const rand = Math.random();
        if (player.items.turboDice > 0 && rand < 0.3) {
            return 'turbo';
        } else if (player.items.slowDice > 0 && rand < 0.6) {
            return 'slow';
        } else {
            return 'normal';
        }
    }
}

window.PinguPlayers = PinguPlayers;
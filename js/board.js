class PinguBoard {
    constructor(seed) {
        this.seed = seed;
        this.totalCasillas = 50;
        this.board = [];
        this.tipos = [
            'normal', 'chaotic', 'fish', 'dado-lento', 
            'dado-turbo', 'trineo', 'agujero', 'ladron'
        ];
        
        // Iconos para cada tipo
        this.iconos = {
            'normal': '⬜',
            'chaotic': '🌀',
            'fish': '🐟',
            'dado-lento': '🐢',
            'dado-turbo': '⚡',
            'trineo': '🛷',
            'agujero': '🕳️',
            'ladron': '🦹',
            'icecube': '🧊'
        };
    }
    
    // Generador pseudoaleatorio basado en seed
    random() {
        let x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
    
    // Generar el tablero
    generate() {
        this.board = [];
        
        // Primero, la casilla 50 (índice 49) es el Ice Cube
        this.board[49] = 'icecube';
        
        // Aseguramos que haya AL MENOS 4 trineos y 4 agujeros
        const tiposEspeciales = [
            'chaotic', 'fish', 'dado-lento', 'dado-turbo', 'ladron'
        ];
        
        // Primero colocamos los trineos (mínimo 4)
        let trineosColocados = 0;
        while (trineosColocados < 4) {
            let pos;
            do {
                pos = Math.floor(this.random() * (this.totalCasillas - 1));
            } while (this.board[pos] !== undefined || pos === 49);
            this.board[pos] = 'trineo';
            trineosColocados++;
        }
        
        // Luego los agujeros (mínimo 4)
        let agujerosColocados = 0;
        while (agujerosColocados < 4) {
            let pos;
            do {
                pos = Math.floor(this.random() * (this.totalCasillas - 1));
            } while (this.board[pos] !== undefined || pos === 49);
            this.board[pos] = 'agujero';
            agujerosColocados++;
        }
        
        // Luego el resto de especiales
        tiposEspeciales.forEach(tipo => {
            let pos;
            do {
                pos = Math.floor(this.random() * (this.totalCasillas - 1));
            } while (this.board[pos] !== undefined || pos === 49);
            this.board[pos] = tipo;
        });
        
        // Rellenamos el resto con normales y chaotic
        for (let i = 0; i < this.totalCasillas; i++) {
            if (this.board[i] === undefined && i !== 49) {
                // 70% normal, 30% chaotic adicional
                if (this.random() < 0.7) {
                    this.board[i] = 'normal';
                } else {
                    this.board[i] = 'chaotic';
                }
            }
        }
        
        return this.board;
    }
    
    // Renderizar el tablero en el DOM
    render(containerId, players = []) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        this.board.forEach((tipo, index) => {
            const casilla = document.createElement('div');
            // La casilla 50 tiene clase especial
            if (index === 49) {
                casilla.className = 'casilla icecube';
            } else {
                casilla.className = `casilla ${tipo}`;
            }
            casilla.dataset.index = index;
            casilla.dataset.tipo = tipo;
            
            // Número de casilla
            const numero = document.createElement('span');
            numero.className = 'numero';
            numero.textContent = index + 1;
            
            // Icono
            const icono = document.createElement('span');
            icono.className = 'icono';
            icono.textContent = this.iconos[tipo] || (index === 49 ? '🧊' : '⬜');
            
            casilla.appendChild(numero);
            casilla.appendChild(icono);
            
            // Añadir jugadores si hay en esta casilla
            const jugadoresAqui = players.filter(p => p.position === index);
            if (jugadoresAqui.length > 0) {
                const jugadoresDiv = document.createElement('div');
                jugadoresDiv.className = 'jugadores-en-casilla';
                jugadoresAqui.forEach(j => {
                    const mini = document.createElement('img');
                    mini.src = `images/penguins/${j.skin}`;
                    mini.alt = j.name;
                    mini.className = 'mini-pingu-img';
                    mini.style.width = '25px';
                    mini.style.height = '25px';
                    mini.style.borderRadius = '50%';
                    mini.style.border = j.isCPU ? '2px solid #666' : '2px solid gold';
                    mini.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    mini.onerror = function() { this.src = 'images/penguins/pinguO.png'; };
                    jugadoresDiv.appendChild(mini);
                });
                casilla.appendChild(jugadoresDiv);
            }
            
            container.appendChild(casilla);
        });
    }
    
    getPlayerColor(id) {
        const colores = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#607d8b'];
        return colores[id - 1] || '#999';
    }
}

window.PinguBoard = PinguBoard;
// translator.js - Traductor Español/Inglés para Pingu's Game

const translations = {
    es: {
        // Títulos generales
        gameTitle: 'PINGU\'S GAME',
        createGame: '¡CREA TU PARTIDA!',
        joinGame: '¿TIENES UNA SEED?',
        configPlayers: '⚙️ CONFIGURACIÓN DE JUGADORES',
        selectPenguins: '🎨 SELECCIONA TUS PINGÜINOS',
        
        // Botones
        btnGenerate: '🎲 GENERAR NUEVA SEED',
        btnCreate: '❄️ CREAR PARTIDA CON ESTA SEED',
        btnJoin: '🐧 UNIRSE',
        btnCopy: '📋',
        btnLocal: '🖥️ MISMO PC',
        btnOnline: '🌐 ONLINE',
        btnContinue: 'CONTINUAR',
        btnOk: 'OK',
        
        // Placeholders
        placeholderSeed: 'Introduce la seed',
        placeholderName: 'Nombre',
        
        // Contadores
        humans: 'Jugadores humanos:',
        cpus: 'Jugadores CPU:',
        total: 'Total:',
        maxPlayers: '❌ Máximo 4 jugadores',
        
        // Modos
        modeLocalDesc: 'Todos juegan en este ordenador, turnándose',
        modeOnlineDesc: 'Cada jugador desde su PC (comparte la seed)',
        
        // Tipos de jugador
        human: '👤 HUMANO',
        cpu: '🤖 CPU',
        
        // Nombres de pingüinos
        penguinNames: {
            'Pingu Azul': 'Pingu Azul',
            'Pingu Rojo': 'Pingu Rojo',
            'Pingu Verde': 'Pingu Verde',
            'Pingu Amarillo': 'Pingu Amarillo',
            'Pingu Rosa': 'Pingu Rosa',
            'Pingu Original': 'Pingu Original'
        },
        
        // Juego
        turnOf: 'TURNO DE:',
        seed: 'SEED:',
        diceNormal: 'NORMAL',
        diceSlow: 'LENTO',
        diceTurbo: 'TURBO',
        
        // Mensajes del juego
        fishFound: '¡Has encontrado 3 peces! 🐟',
        slowDice: '¡Has ganado un DADO LENTO! 🐢',
        turboDice: '¡Has ganado un DADO TURBO! ⚡',
        iceCube: '¡ICE CUBE!',
        iceCubeShop: '¿Quieres comprar un cubito de hielo por 15 peces?',
        notEnoughFish: 'No tienes suficientes peces',
        backToStart: '¡Vuelves al inicio! 🔄',
        thief: '¡LADRÓN FURTIVO!',
        chaotic: 'EVENTO CHAOTIC',
        thinking: 'está pensando',
        winner: 'ha ganado con 3 Ice Cubes!',
        playAgain: '¿Quieres jugar otra partida?',
        fish: 'Peces',
        notYourTurn: '¡No es tu turno!',
        noPurchase: 'No has comprado',
        sleigh: '¡Trineo!',
        noSleigh: 'No hay más trineos',
        hole: '¡Agujero!',
        noHole: 'No hay agujeros antes',
        thiefNoOne: 'No habia nadie a quien robar',
        noDice: '¡No tienes dados',
        
        // Créditos
        createdBy: 'Creado por',
        rights: 'Todos los derechos pingüineros reservados',
        version: 'v2.0 - Multijugador Online ❄️'
    },
    
    en: {
        // General titles
        gameTitle: 'PINGU\'S GAME',
        createGame: 'CREATE GAME',
        joinGame: 'HAVE A SEED?',
        configPlayers: '⚙️ PLAYER CONFIGURATION',
        selectPenguins: '🎨 SELECT YOUR PENGUINS',
        
        // Buttons
        btnGenerate: '🎲 GENERATE NEW SEED',
        btnCreate: '❄️ CREATE GAME WITH THIS SEED',
        btnJoin: '🐧 JOIN',
        btnCopy: '📋',
        btnLocal: '🖥️ LOCAL',
        btnOnline: '🌐 ONLINE',
        btnContinue: 'CONTINUE',
        btnOk: 'OK',
        
        // Placeholders
        placeholderSeed: 'Enter seed',
        placeholderName: 'Name',
        
        // Counters
        humans: 'Human players:',
        cpus: 'CPU players:',
        total: 'Total:',
        maxPlayers: '❌ Maximum 4 players',
        
        // Modes
        modeLocalDesc: 'Everyone plays on this computer, taking turns',
        modeOnlineDesc: 'Each player from their own PC (share the seed)',
        
        // Player types
        human: '👤 HUMAN',
        cpu: '🤖 CPU',
        
        // Penguin names
        penguinNames: {
            'Pingu Azul': 'Blue Pingu',
            'Pingu Rojo': 'Red Pingu',
            'Pingu Verde': 'Green Pingu',
            'Pingu Amarillo': 'Yellow Pingu',
            'Pingu Rosa': 'Pink Pingu',
            'Pingu Original': 'Original Pingu'
        },
        
        // Game
        turnOf: 'TURN:',
        seed: 'SEED:',
        diceNormal: 'NORMAL',
        diceSlow: 'SLOW',
        diceTurbo: 'TURBO',
        
        // Game messages
        fishFound: 'You found 3 fish! 🐟',
        slowDice: 'You got a SLOW DICE! 🐢',
        turboDice: 'You got a TURBO DICE! ⚡',
        iceCube: 'ICE CUBE!',
        iceCubeShop: 'Do you want to buy an ice cube for 15 fish?',
        notEnoughFish: 'Not enough fish',
        backToStart: 'Back to start! 🔄',
        thief: 'THIEF!',
        chaotic: 'CHAOTIC EVENT',
        thinking: 'is thinking',
        winner: 'wins with 3 Ice Cubes!',
        playAgain: 'Play again?',
        fish: 'Fish',
        notYourTurn: 'Not your turn!',
        noPurchase: 'No purchase',
        sleigh: 'Sleigh!',
        noSleigh: 'No more sleighs',
        hole: 'Hole!',
        noHole: 'No holes before',
        thiefNoOne: 'No one to steal from',
        noDice: 'No',
        
        // Credits
        createdBy: 'Created by',
        rights: 'All penguin rights reserved',
        version: 'v2.0 - Online Multiplayer ❄️'
    }
};

let currentLang = localStorage.getItem('pinguLang') || 'es';

window.translateText = function(key, params = {}) {
    if (translations[currentLang] && translations[currentLang][key]) {
        let text = translations[currentLang][key];
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        return text;
    }
    return key;
};

window.setLanguage = function(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('pinguLang', lang);
        
        // Traducir todos los elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
        
        // Traducir los selectores de pingüinos si existen
        document.querySelectorAll('.player-skin-select option').forEach(option => {
            const spanishName = option.getAttribute('data-spanish') || option.textContent;
            option.setAttribute('data-spanish', spanishName);
            if (translations[lang].penguinNames[spanishName]) {
                option.textContent = translations[lang].penguinNames[spanishName];
            }
        });
        
        // Actualizar botones de idioma
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Disparar evento para otros scripts
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Configurar botones de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.setLanguage(btn.dataset.lang);
        });
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });
    
    // Aplicar idioma guardado
    window.setLanguage(currentLang);
});
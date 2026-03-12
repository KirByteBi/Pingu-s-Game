// party.js - Conexión multijugador para Pingu's Game
// Es como Bootstrap pero para conectar jugadores 🐧
// ==================================================================
// La libreria externa se llama Vanila Party: https://github.com/luizbills/vanilla-party
(function() {
    // Configuración
    const SERVER_URL = "wss://vanilla-party.luizbills.com/";
    const APP_NAME = "pingu-game";
    
    // Estado interno
    let connection = null;
    let sharedData = {};
    let watchCallbacks = [];
    let myId = null;
    let roomName = null;
    
    // Conectar a una sala
    window.partyConnect = function(seed) {
        roomName = seed;
        
        return new Promise((resolve, reject) => {
            try {
                connection = new WebSocket(SERVER_URL);
                
                connection.onopen = () => {
                    console.log('🎮 Conectado a la fiesta de pingüinos!');
                    
                    // Enviar mensaje de unión
                    connection.send(JSON.stringify({
                        type: 'join',
                        app: APP_NAME,
                        room: roomName
                    }));
                    
                    resolve();
                };
                
                connection.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'welcome') {
                        myId = data.id;
                        console.log(`🐧 Eres el jugador ${myId}`);
                    }
                    
                    if (data.type === 'sync') {
                        sharedData = data.data || {};
                        // Notificar a los watchers
                        watchCallbacks.forEach(cb => cb(sharedData));
                    }
                };
                
                connection.onerror = (error) => {
                    console.error('Error de conexión:', error);
                    reject(error);
                };
                
                connection.onclose = () => {
                    console.log('Desconectado de la fiesta');
                };
                
            } catch (e) {
                reject(e);
            }
        });
    };
    
    // Cargar datos compartidos
    window.partyLoadShared = function(initialData) {
        if (Object.keys(sharedData).length === 0) {
            sharedData = initialData || {};
        }
        return sharedData;
    };
    
    // Actualizar datos compartidos
    window.partyUpdateShared = function(newData) {
        sharedData = { ...sharedData, ...newData };
        
        if (connection && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify({
                type: 'update',
                app: APP_NAME,
                room: roomName,
                data: sharedData,
                sender: myId
            }));
        }
    };
    
    // Observar cambios
    window.partyWatchShared = function(callback) {
        watchCallbacks.push(callback);
        // Llamar inmediatamente con datos actuales
        if (Object.keys(sharedData).length > 0) {
            callback(sharedData);
        }
    };
    
    // Obtener mi ID
    window.partyMyId = function() {
        return myId;
    };
    
})();
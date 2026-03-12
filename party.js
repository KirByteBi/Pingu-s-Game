// party.js - Conexión multijugador para Pingu's Game
// Es como Bootstrap pero para conectar jugadores 🐧
// ==================================================================
// La libreria externa se llama Vanila Party: https://github.com/luizbills/vanilla-party

(function() {
    // Lista de servidores por orden de preferencia
    const SERVERS = [
        "wss://socketsbay.com/wss/v2/1/demo/",
        "wss://ws.postman-echo.com/raw",
        "wss://echo.websocket.org",
        "wss://ws.ifelse.io"
    ];
    
    const APP_NAME = "pingu-game";
    
    // Estado interno
    let connection = null;
    let sharedData = {};
    let watchCallbacks = [];
    let myId = null;
    let roomName = null;
    let currentServerIndex = 0;
    let reconnectTimer = null;
    
    // Función para intentar conectar con reintentos automáticos
    function tryConnect(seed, resolve, reject) {
        if (currentServerIndex >= SERVERS.length) {
            console.log('❌ Todos los servidores fallaron');
            reject(new Error('No hay servidores disponibles'));
            return;
        }
        
        const serverUrl = SERVERS[currentServerIndex];
        console.log(`🔄 Intentando conectar a servidor ${currentServerIndex + 1}: ${serverUrl}`);
        
        try {
            connection = new WebSocket(serverUrl);
            
            connection.onopen = () => {
                console.log(`✅ Conectado a servidor ${currentServerIndex + 1}`);
                // Reiniciamos el índice para futuras reconexiones
                currentServerIndex = 0;
                
                // Enviar mensaje de unión
                connection.send(JSON.stringify({
                    type: 'join',
                    app: APP_NAME,
                    room: seed
                }));
                
                resolve();
            };
            
            connection.onmessage = (event) => {
                try {
                    // Algunos servidores envían mensajes de ping o texto plano
                    let data;
                    try {
                        data = JSON.parse(event.data);
                    } catch (e) {
                        // Si no es JSON, lo ignoramos (puede ser un ping del servidor)
                        console.log('Mensaje no JSON (ignorado):', event.data);
                        return;
                    }
                    
                    // Adaptamos según el formato del servidor
                    if (data.type === 'welcome' || data.type === 'join') {
                        myId = data.id || data.clientId || Math.floor(Math.random() * 1000);
                        console.log(`🐧 Eres el jugador ${myId}`);
                    }
                    
                    if (data.type === 'sync' || data.type === 'update' || data.type === 'message') {
                        sharedData = data.data || data.payload || data.message || {};
                        watchCallbacks.forEach(cb => cb(sharedData));
                    }
                    
                    // Para servidores echo, usamos un formato especial
                    if (serverUrl.includes('echo')) {
                        if (data.type === 'sync' || data.type === 'update') {
                            sharedData = data.data || {};
                            watchCallbacks.forEach(cb => cb(sharedData));
                        }
                    }
                } catch (e) {
                    console.log('Error procesando mensaje:', e);
                }
            };
            
            connection.onerror = (error) => {
                console.log(`❌ Error en servidor ${currentServerIndex + 1}, probando siguiente...`);
                currentServerIndex++;
                
                // Intentar con el siguiente servidor
                if (currentServerIndex < SERVERS.length) {
                    tryConnect(seed, resolve, reject);
                } else {
                    reject(error);
                }
            };
            
            connection.onclose = () => {
                console.log('Desconectado, intentando reconectar automáticamente en 3 segundos...');
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => {
                    currentServerIndex = 0; // Reiniciar desde el primer servidor
                    tryConnect(roomName || seed, 
                        () => console.log('✅ Reconectado exitosamente'),
                        () => console.log('❌ No se pudo reconectar')
                    );
                }, 3000);
            };
            
        } catch (e) {
            console.log('Error creando conexión:', e);
            currentServerIndex++;
            if (currentServerIndex < SERVERS.length) {
                tryConnect(seed, resolve, reject);
            } else {
                reject(e);
            }
        }
    }
    
    // Conectar a una sala
    window.partyConnect = function(seed) {
        roomName = seed;
        currentServerIndex = 0; // Reiniciar índice al conectar
        
        return new Promise((resolve, reject) => {
            tryConnect(seed, resolve, reject);
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
            const message = {
                type: 'update',
                app: APP_NAME,
                room: roomName,
                data: sharedData,
                sender: myId
            };
            
            // Para servidores echo, enviamos como mensaje directo
            if (SERVERS[currentServerIndex] && SERVERS[currentServerIndex].includes('echo')) {
                message.type = 'message';
            }
            
            connection.send(JSON.stringify(message));
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
    
    // Función para desconectar manualmente
    window.partyDisconnect = function() {
        if (connection) {
            connection.close();
        }
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    };
})();
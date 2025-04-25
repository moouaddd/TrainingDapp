// Configuración
const contractAddress = "0x0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Reemplaza con la dirección de tu contrato
let web3;
let contract;
let accounts = [];
let isOwner = false;

// Elementos del DOM
const connectWalletBtn = document.getElementById('connectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const walletBalance = document.getElementById('walletBalance');
const adminSection = document.getElementById('adminSection');
const sessionsContainer = document.getElementById('sessionsContainer');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const confirmBookingBtn = document.getElementById('confirmBooking');
const closeModal = document.querySelector('.close');

// Formularios
const addSessionForm = document.getElementById('addSessionForm');
const updateSessionForm = document.getElementById('updateSessionForm');

// Variables para la reserva
let currentSessionId = null;

// Inicialización
window.addEventListener('load', async () => {
    // Verificar si MetaMask está instalado
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        
        try {
            // Solicitar acceso a la cuenta
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            initApp();
        } catch (error) {
            console.error("User denied account access");
        }
        
        // Escuchar cambios de cuenta
        window.ethereum.on('accountsChanged', (newAccounts) => {
            accounts = newAccounts;
            initApp();
        });
        
        // Escuchar cambios de red
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    } else {
        alert('Por favor instala MetaMask para usar esta aplicación');
    }
});

// Inicializar la aplicación
async function initApp() {
    if (accounts.length > 0) {
        // Mostrar información de la wallet
        connectWalletBtn.style.display = 'none';
        walletInfo.style.display = 'flex';
        walletAddress.textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`;
        
        // Obtener balance
        const balance = await web3.eth.getBalance(accounts[0]);
        walletBalance.textContent = web3.utils.fromWei(balance, 'ether').substring(0, 6);
        
        // Cargar ABI del contrato (debes crear un archivo abi.json o incluir el ABI aquí)
        const response = await fetch('abi.json');
        const abi = await response.json();
        
        // Instanciar el contrato
        contract = new web3.eth.Contract(abi, contractAddress);
        
        // Verificar si el usuario es el owner
        const owner = await contract.methods.owner().call();
        isOwner = (accounts[0].toLowerCase() === owner.toLowerCase());
        
        if (isOwner) {
            adminSection.style.display = 'block';
            setupAdminForms();
        }
        
        // Cargar sesiones
        loadSessions();
    } else {
        connectWalletBtn.style.display = 'block';
        walletInfo.style.display = 'none';
        adminSection.style.display = 'none';
    }
}

// Conectar MetaMask
connectWalletBtn.addEventListener('click', async () => {
    try {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        initApp();
    } catch (error) {
        console.error("User denied account access");
    }
});

// Cargar sesiones
async function loadSessions() {
    sessionsContainer.innerHTML = '<p>Cargando sesiones...</p>';
    
    try {
        const sessions = await contract.methods.getSessions().call();
        
        if (sessions.length === 0) {
            sessionsContainer.innerHTML = '<p>No hay sesiones disponibles</p>';
            return;
        }
        
        sessionsContainer.innerHTML = '';
        
        sessions.forEach(session => {
            const sessionCard = document.createElement('div');
            sessionCard.className = 'session-card';
            
            sessionCard.innerHTML = `
                <img src="${session.image}" alt="${session.name}" class="session-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="session-info">
                    <h3>${session.name}</h3>
                    <p>ID: ${session.id}</p>
                    <p class="session-price">Precio: ${web3.utils.fromWei(session.price, 'ether')} ETH</p>
                    <p class="session-slots ${session.slots <= 2 ? 'low' : ''}">Plazas disponibles: ${session.slots}</p>
                    <button class="book-button" data-id="${session.id}">Reservar</button>
                </div>
            `;
            
            sessionsContainer.appendChild(sessionCard);
        });
        
        // Agregar event listeners a los botones de reserva
        document.querySelectorAll('.book-button').forEach(button => {
            button.addEventListener('click', (e) => {
                currentSessionId = e.target.getAttribute('data-id');
                showBookingModal(currentSessionId);
            });
        });
    } catch (error) {
        console.error("Error al cargar sesiones:", error);
        sessionsContainer.innerHTML = '<p>Error al cargar las sesiones</p>';
    }
}

// Mostrar modal de reserva
async function showBookingModal(sessionId) {
    try {
        const session = await contract.methods.getSession(sessionId).call();
        
        modalTitle.textContent = `Reservar: ${session.name}`;
        modalContent.innerHTML = `
            <p><strong>Precio:</strong> ${web3.utils.fromWei(session.price, 'ether')} ETH</p>
            <p><strong>Plazas disponibles:</strong> ${session.slots}</p>
            <p>Confirma que deseas reservar esta sesión.</p>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error("Error al cargar sesión:", error);
        alert("Error al cargar la información de la sesión");
    }
}

// Confirmar reserva
confirmBookingBtn.addEventListener('click', async () => {
    if (!currentSessionId) return;
    
    try {
        const session = await contract.methods.getSession(currentSessionId).call();
        const priceInWei = session.price;
        
        await contract.methods.bookSession(currentSessionId).send({
            from: accounts[0],
            value: priceInWei
        });
        
        alert('Reserva realizada con éxito!');
        modal.style.display = 'none';
        loadSessions();
    } catch (error) {
        console.error("Error al reservar:", error);
        alert(`Error al reservar: ${error.message}`);
    }
});

// Cerrar modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Configurar formularios de admin
function setupAdminForms() {
    // Añadir sesión
    addSessionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('sessionName').value;
        const image = document.getElementById('sessionImage').value;
        const price = document.getElementById('sessionPrice').value;
        const slots = document.getElementById('sessionSlots').value;
        
        try {
            const priceInWei = web3.utils.toWei(price, 'ether');
            
            await contract.methods.addSession(
                name,
                image,
                priceInWei,
                slots
            ).send({ from: accounts[0] });
            
            alert('Sesión añadida con éxito!');
            addSessionForm.reset();
            loadSessions();
        } catch (error) {
            console.error("Error al añadir sesión:", error);
            alert(`Error al añadir sesión: ${error.message}`);
        }
    });
    
    // Actualizar sesión
    updateSessionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('updateSessionId').value;
        const name = document.getElementById('updateSessionName').value;
        const image = document.getElementById('updateSessionImage').value;
        const price = document.getElementById('updateSessionPrice').value;
        const slots = document.getElementById('updateSessionSlots').value;
        
        try {
            let priceInWei = null;
            if (price) {
                priceInWei = web3.utils.toWei(price, 'ether');
            }
            
            await contract.methods.updateSession(
                id,
                name || '',
                image || '',
                priceInWei || 0,
                slots || 0
            ).send({ from: accounts[0] });
            
            alert('Sesión actualizada con éxito!');
            updateSessionForm.reset();
            loadSessions();
        } catch (error) {
            console.error("Error al actualizar sesión:", error);
            alert(`Error al actualizar sesión: ${error.message}`);
        }
    });
}
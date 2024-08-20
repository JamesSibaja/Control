document.getElementById('water1').addEventListener('click', function() {
    toggleButton(this, 1);
});

document.getElementById('water2').addEventListener('click', function() {
    toggleButton(this, 2);
});

function toggleButton(button, id) {
    button.classList.toggle('active');
    let isActive = button.classList.contains('active');
    sendWaterCommand(id, isActive);
}

function sendWaterCommand(id, isActive) {
    // Aquí se enviaría el comando al EV3
    console.log(`Riego ${id} está ${isActive ? 'activado' : 'desactivado'}`);
}

const joystick1 = document.getElementById('joystick1');
const joystick2 = document.getElementById('joystick2');

joystick1.addEventListener('mousedown', (event) => startDrag(event, joystick1, 1));
joystick1.addEventListener('touchstart', (event) => startDrag(event, joystick1, 1));
joystick2.addEventListener('mousedown', (event) => startDrag(event, joystick2, 2));
joystick2.addEventListener('touchstart', (event) => startDrag(event, joystick2, 2));

function startDrag(event, joystick, joystickId) {
    event.preventDefault();

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function onDragMove(event) {
        handleDrag(event, joystick, joystickId);
    }

    function endDrag() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);

        // Regresar el joystick al centro al soltar
        joystick.style.transform = 'translate(-50%, -50%)';
        sendCommand(joystickId, 0, 0); // Comando para detener el movimiento
    }
}

function handleDrag(event, joystick, joystickId) {
    let clientX = event.clientX || event.touches[0].clientX;
    let clientY = event.clientY || event.touches[0].clientY;

    let rect = joystick.parentElement.getBoundingClientRect();
    let x = clientX - rect.left - rect.width / 2;
    let y = clientY - rect.top - rect.height / 2;

    let angle = Math.atan2(y, x);
    let distance = Math.min(Math.hypot(x, y), (rect.width - joystick.offsetWidth) / 2);

    let joystickX = distance * Math.cos(angle);
    let joystickY = distance * Math.sin(angle);

    joystick.style.transform = `translate(${joystickX - joystick.offsetWidth / 2}px, ${joystickY - joystick.offsetHeight / 2}px)`;

    if (distance > rect.width / 4) {
        sendCommand(joystickId, joystickX, joystickY);
    }
}

function sendCommand(joystickId, x, y) {
    // Aquí se enviaría el comando de movimiento al EV3
    console.log(`Joystick ${joystickId} - X: ${x}, Y: ${y}`);
}

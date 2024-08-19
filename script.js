let device;
let characteristic;
let joystick1 = document.getElementById('joystick1');
let joystick2 = document.getElementById('joystick2');
let isDragging1 = false;
let isDragging2 = false;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['battery_service'] }],
            optionalServices: ['generic_access']
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('battery_service');
        characteristic = await service.getCharacteristic('battery_level');

        document.getElementById('status').innerText = "Status: Connected";
    } catch (error) {
        console.log(error);
        document.getElementById('status').innerText = "Status: Connection failed";
    }
});

function setupJoystick(joystick, joystickContainer, startDrag, onDrag, stopDrag) {
    joystick.addEventListener('mousedown', startDrag);
    joystick.addEventListener('touchstart', startDrag);

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag);

    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function startDrag1(event) {
    isDragging1 = true;
}

function startDrag2(event) {
    isDragging2 = true;
}

function onDrag1(event) {
    if (!isDragging1) return;

    handleDrag(event, joystick1, 'joystick1');
}

function onDrag2(event) {
    if (!isDragging2) return;

    handleDrag(event, joystick2, 'joystick2');
}

function handleDrag(event, joystick, joystickId) {
    let clientX = event.clientX || event.touches[0].clientX;
    let clientY = event.clientY || event.touches[0].clientY;

    let rect = joystick.parentElement.getBoundingClientRect();
    let x = clientX - rect.left - rect.width / 2;
    let y = clientY - rect.top - rect.height / 2;

    let angle = Math.atan2(y, x);
    let distance = Math.min(Math.hypot(x, y), rect.width / 2);

    let joystickX = distance * Math.cos(angle);
    let joystickY = distance * Math.sin(angle);

    joystick.style.transform = `translate(${joystickX}px, ${joystickY}px)`;

    if (distance > rect.width / 4) {
        sendCommand(joystickId, joystickX, joystickY);
    }
}

function stopDrag1() {
    if (isDragging1) {
        isDragging1 = false;
        joystick1.style.transform = 'translate(-50%, -50%)';
        sendCommand('joystick1', 0, 0);
    }
}

function stopDrag2() {
    if (isDragging2) {
        isDragging2 = false;
        joystick2.style.transform = 'translate(-50%, -50%)';
        sendCommand('joystick2', 0, 0);
    }
}

function sendCommand(control, x, y) {
    if (characteristic) {
        let command;
        if (control === 'joystick1') {
            command = `J1:${x},${y}`;
        } else if (control === 'joystick2') {
            command = `J2:${x},${y}`;
        } else if (control === 'water1') {
            command = 'W1:TOGGLE';
        } else if (control === 'water2') {
            command = 'W2:TOGGLE';
        }

        const encoder = new TextEncoder('utf-8');
        characteristic.writeValue(encoder.encode(command))
            .then(() => console.log('Command sent:', command))
            .catch(error => console.log('Error sending command:', error));
    }
}

setupJoystick(joystick1, joystick1.parentElement, startDrag1, onDrag1, stopDrag1);
setupJoystick(joystick2, joystick2.parentElement, startDrag2, onDrag2, stopDrag2);

document.getElementById('water1').addEventListener('click', () => sendCommand('water1'));
document.getElementById('water2').addEventListener('click', () => sendCommand('water2'));

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (event) {
        let gamma = event.gamma; // In degrees, from -90 to 90
        let beta = event.beta; // In degrees, from -180 to 180

        // Send gamma and beta as joystick-like commands for the car movement
        if (characteristic) {
            let command = `GYRO:${gamma.toFixed(2)},${beta.toFixed(2)}`;
            const encoder = new TextEncoder('utf-8');
            characteristic.writeValue(encoder.encode(command))
                .then(() => console.log('Gyro Command sent:', command))
                .catch(error => console.log('Error sending gyro command:', error));
        }
    });
}

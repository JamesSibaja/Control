let device;
let characteristic;

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

document.getElementById('forward').addEventListener('click', () => sendCommand('F'));
document.getElementById('backward').addEventListener('click', () => sendCommand('B'));
document.getElementById('left').addEventListener('click', () => sendCommand('L'));
document.getElementById('right').addEventListener('click', () => sendCommand('R'));
document.getElementById('stop').addEventListener('click', () => sendCommand('S'));

function sendCommand(command) {
    if (characteristic) {
        const encoder = new TextEncoder('utf-8');
        characteristic.writeValue(encoder.encode(command))
            .then(() => console.log('Command sent:', command))
            .catch(error => console.log('Error sending command:', error));
    }
}

function initSingleJoystick() {
    const base = document.getElementById('joy1-base');
    const stick = document.getElementById('joy1-stick');
    const maxDist = 90;
    
    function updateStick(clientX, clientY) {
        const rect = base.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX; const dy = clientY - centerY;
        const dist = Math.min(Math.hypot(dx, dy), maxDist);
        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * dist; const moveY = Math.sin(angle) * dist;
        stick.style.transform = `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`;
        
        const valX = Math.round((moveX / maxDist) * 100);
        const valY = Math.round((moveY / maxDist) * 100) * -1;

        document.getElementById('sX').innerText = valX;
        document.getElementById('sY').innerText = valY;

        const hX = (valX & 0xFF).toString(16).toUpperCase().padStart(2, '0');
        const hY = (valY & 0xFF).toString(16).toUpperCase().padStart(2, '0');
        document.getElementById('singleHex').innerText = `${hX} ${hY} 0A`;

        if(isConnected && activeView === 'view-joystick') sendRawPacket(new Int8Array([valX, valY, 10]));
    }

    const handleMove = (e) => { e.preventDefault(); const touch = e.touches ? e.touches[0] : e; updateStick(touch.clientX, touch.clientY); };
    const handleEnd = () => {
        stick.classList.add('snap'); stick.style.transform = `translate(-50%, -50%)`;
        document.getElementById('sX').innerText = "0"; document.getElementById('sY').innerText = "0";
        document.getElementById('singleHex').innerText = "00 00 0A";
        if(isConnected && activeView === 'view-joystick') sendRawPacket(new Int8Array([0, 0, 10]));
    };

    base.addEventListener('touchstart', (e) => { stick.classList.remove('snap'); });
    base.addEventListener('touchmove', handleMove);
    base.addEventListener('touchend', handleEnd);
    base.addEventListener('mousedown', (e) => {
        stick.classList.remove('snap'); updateStick(e.clientX, e.clientY);
        const mouseMove = (ev) => updateStick(ev.clientX, ev.clientY);
        const mouseUp = () => { handleEnd(); window.removeEventListener('mousemove', mouseMove); window.removeEventListener('mouseup', mouseUp); };
        window.addEventListener('mousemove', mouseMove); window.addEventListener('mouseup', mouseUp);
    });
}
initSingleJoystick();

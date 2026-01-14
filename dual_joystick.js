const dualState = { lx: 0, ly: 0, rx: 0, ry: 0, btnL: 0, btnR: 0 };
let btnValues = { L: 1, R: 1 };
let protocol = [
    { type: 'axis', src: 'lx' }, { type: 'axis', src: 'ly' },
    { type: 'axis', src: 'rx' }, { type: 'axis', src: 'ry' },
    { type: 'btn', src: 'btnL' }, { type: 'btn', src: 'btnR' },
    { type: 'const', val: 10 }
];

function initDualJoystick(baseId, stickId, prefix) {
    const base = document.getElementById(baseId);
    const stick = document.getElementById(stickId);
    const maxDist = 40;

    function update(cx, cy) {
        const rect = base.getBoundingClientRect();
        const dx = cx - (rect.left + rect.width/2); const dy = cy - (rect.top + rect.height/2);
        const dist = Math.min(Math.hypot(dx, dy), maxDist);
        const angle = Math.atan2(dy, dx);
        const mx = Math.cos(angle) * dist; const my = Math.sin(angle) * dist;
        stick.style.transform = `translate(-50%, -50%) translate(${mx}px, ${my}px)`;
        dualState[prefix+'x'] = Math.round((mx/maxDist)*100);
        dualState[prefix+'y'] = Math.round((my/maxDist)*100)*-1;
    }

    base.addEventListener('touchmove', (e)=>{ e.preventDefault(); update(e.touches[0].clientX, e.touches[0].clientY); });
    base.addEventListener('touchend', ()=>{ stick.classList.add('snap'); stick.style.transform = `translate(-50%, -50%)`; dualState[prefix+'x']=0; dualState[prefix+'y']=0; });
    base.addEventListener('touchstart', ()=>{ stick.classList.remove('snap'); });
    base.addEventListener('mousedown', (e)=>{
        stick.classList.remove('snap'); update(e.clientX, e.clientY);
        const mm = (ev)=>update(ev.clientX, ev.clientY);
        const mu = ()=>{ window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); stick.classList.add('snap'); stick.style.transform = `translate(-50%, -50%)`; dualState[prefix+'x']=0; dualState[prefix+'y']=0; };
        window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu);
    });
}

initDualJoystick('joyL-base', 'joyL-stick', 'l');
initDualJoystick('joyR-base', 'joyR-stick', 'r');

function setBtn(side, pressed) {
    if(pressed && navigator.vibrate) navigator.vibrate(20);
    dualState['btn'+side] = pressed ? btnValues[side] : 0;
}

let currentCfgBtn = null;
function configBtn(side) {
    currentCfgBtn = side;
    document.getElementById('btnValInput').value = btnValues[side];
    document.getElementById('valueConfigModal').classList.remove('hidden');
}
function saveBtnConfig() {
    const val = parseInt(document.getElementById('btnValInput').value);
    if(!isNaN(val) && val >= 0 && val <= 255) {
        btnValues[currentCfgBtn] = val;
        document.getElementById(`valDisp${currentCfgBtn}`).innerText = val;
    }
    document.getElementById('valueConfigModal').classList.add('hidden');
}

function openProtocolModal() { renderProtocolList(); document.getElementById('protocolModal').classList.remove('hidden'); }
function renderProtocolList() {
    const list = document.getElementById('byteList'); list.innerHTML = '';
    protocol.forEach((item, index) => {
        const el = document.createElement('div'); el.className = 'flex justify-between items-center bg-slate-800 p-2 rounded mb-2 border border-slate-600';
        let options = `<select onchange="updateByte(${index}, 'type', this.value)" class="bg-slate-900 text-xs rounded p-1 text-white"><option value="axis" ${item.type==='axis'?'selected':''}>Вісь</option><option value="btn" ${item.type==='btn'?'selected':''}>Кнопка</option><option value="const" ${item.type==='const'?'selected':''}>Конст</option></select>`;
        let valInp = item.type === 'const' ? `<input type="number" value="${item.val}" onchange="updateByte(${index}, 'val', this.value)" class="w-12 bg-slate-900 text-xs text-center rounded text-white">` : `<select onchange="updateByte(${index}, 'src', this.value)" class="w-16 bg-slate-900 text-xs rounded text-white"><option value="lx" ${item.src==='lx'?'selected':''}>LX</option><option value="ly" ${item.src==='ly'?'selected':''}>LY</option><option value="rx" ${item.src==='rx'?'selected':''}>RX</option><option value="ry" ${item.src==='ry'?'selected':''}>RY</option><option value="btnL" ${item.src==='btnL'?'selected':''}>BtnL</option><option value="btnR" ${item.src==='btnR'?'selected':''}>BtnR</option></select>`;
        el.innerHTML = `<span class="text-xs text-slate-400 font-mono">B${index}</span>${options}${valInp}<button onclick="removeByte(${index})" class="text-red-500"><i class="fa-solid fa-trash"></i></button>`;
        list.appendChild(el);
    });
}
function updateByte(i, k, v) { protocol[i][k] = k==='val'?parseInt(v):v; if(k==='type') renderProtocolList(); }
function addByte() { protocol.push({ type: 'const', val: 0 }); renderProtocolList(); }
function removeByte(i) { protocol.splice(i, 1); renderProtocolList(); }
function saveProtocol() { document.getElementById('protocolModal').classList.add('hidden'); }

setInterval(() => {
    if(activeView === 'view-dual') {
        const packet = new Int8Array(protocol.length);
        let hexStr = "";
        protocol.forEach((byteCfg, i) => {
            let val = 0;
            if(byteCfg.type === 'axis') val = dualState[byteCfg.src];
            else if(byteCfg.type === 'btn') val = dualState[byteCfg.src];
            else if(byteCfg.type === 'const') val = byteCfg.val;
            packet[i] = val;
            hexStr += (val & 0xFF).toString(16).toUpperCase().padStart(2, '0') + " ";
        });
        document.getElementById('dualPacketHex').innerText = hexStr;
        if(isConnected) sendRawPacket(packet);
    }
}, 100);

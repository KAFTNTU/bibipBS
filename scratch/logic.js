// --- 0. ЯДЕРНИЙ CSS (FORCE INJECTION) ---
// Ми додаємо стилі прямо з JS, щоб перебити будь-які старі кешовані файли
const style = document.createElement('style');
style.innerHTML = `
    /* Примусові стилі для меню */
    .blocklyToolboxDiv { 
        background-color: rgba(2, 6, 23, 0.95) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8) !important;
        border-radius: 16px !important;
        z-index: 9999 !important;
        
        /* СТАРТОВА ПОЗИЦІЯ ПО ЦЕНТРУ */
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        
        margin: 0 !important;
        width: 180px !important;
        min-width: 140px !important;
        max-height: 70vh !important;
        padding-top: 32px !important;
    }
    
    .blocklyTreeLabel { color: #cbd5e1 !important; font-family: sans-serif !important; font-weight: 600 !important; }
    .blocklyTreeRow:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
    .blocklyTreeSelected .blocklyTreeRow { background-color: #2563eb !important; border-left: 4px solid #60a5fa !important; }
    .blocklyFlyoutBackground { fill: #020617 !important; fill-opacity: 0.95 !important; }
    
    /* Ручки керування */
    #toolbox-drag-handle {
        position: absolute; top: 0; left: 0; right: 0; height: 32px;
        background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
        cursor: grab; z-index: 10000; border-radius: 16px 16px 0 0;
    }
    #toolbox-drag-handle::after { content: ''; position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; background: #64748b; border-radius: 2px; }
    #toolbox-resize-handle { position: absolute; top: 0; right: 0; bottom: 0; width: 16px; cursor: col-resize; z-index: 10000; }
`;
document.head.appendChild(style);

// --- 1. BLOCKLY INIT ---
var workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    theme: Blockly.Themes.Dark,
    renderer: 'zelos',
    zoom: { controls: false, wheel: true },
    trashcan: false
});

// --- 2. TOOLBOX LOGIC ---
setTimeout(() => {
    const toolbox = document.querySelector('.blocklyToolboxDiv');
    if(toolbox) {
        // Додаємо ручки керування
        toolbox.insertAdjacentHTML('afterbegin', `<div id="toolbox-drag-handle"></div><div id="toolbox-resize-handle"></div>`);

        // --- DRAG LOGIC ---
        let dragging = false; let offsetX, offsetY; let firstDrag = true;
        const handle = document.getElementById('toolbox-drag-handle');

        const onDown = (cx, cy) => {
            dragging = true;
            if(firstDrag) {
                // Фіксуємо позицію і знімаємо центрування
                const r = toolbox.getBoundingClientRect();
                toolbox.style.left = r.left + 'px';
                toolbox.style.top = r.top + 'px';
                toolbox.style.transform = 'none';
                firstDrag = false;
            }
            offsetX = cx - toolbox.getBoundingClientRect().left;
            offsetY = cy - toolbox.getBoundingClientRect().top;
        };

        const onMove = (cx, cy) => {
            if(!dragging) return;
            toolbox.style.left = (cx - offsetX) + 'px';
            toolbox.style.top = (cy - offsetY) + 'px';
        };

        const onUp = () => { dragging = false; };

        handle.addEventListener('mousedown', (e) => onDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', onUp);
        
        handle.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(e.touches[0].clientX, e.touches[0].clientY); });
        window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX, e.touches[0].clientY));
        window.addEventListener('touchend', onUp);

        // --- RESIZE LOGIC ---
        let resizing = false;
        const resizer = document.getElementById('toolbox-resize-handle');
        
        const startRes = (e) => { resizing = true; e.stopPropagation(); };
        const doRes = (cx) => { if(resizing) toolbox.style.width = Math.max(140, cx - toolbox.getBoundingClientRect().left) + 'px'; };
        const stopRes = () => { if(resizing) { resizing = false; Blockly.svgResize(workspace); } };

        resizer.addEventListener('mousedown', startRes);
        window.addEventListener('mousemove', (e)=>doRes(e.clientX));
        window.addEventListener('mouseup', stopRes);
        resizer.addEventListener('touchstart', startRes);
        window.addEventListener('touchmove', (e)=>doRes(e.touches[0].clientX));
        window.addEventListener('touchend', stopRes);
    }
}, 200);

// --- BLOCKS ---
Blockly.Blocks['start_hat'] = {
    init: function() {
        this.appendDummyInput().appendField("🏁 СТАРТ").appendField(new Blockly.FieldImage("https://upload.wikimedia.org/wikipedia/commons/2/21/Play_icon_green.svg", 24, 24, "Play", this.onRunClick.bind(this)), "RUN_ICON");
        this.setNextStatement(true, null); this.setColour(120); this.isRunning = false;
    },
    onRunClick: function(imgField) {
        if(this.sourceBlock_.isRunning) {
            stopCode(); imgField.setValue("https://upload.wikimedia.org/wikipedia/commons/2/21/Play_icon_green.svg"); this.sourceBlock_.isRunning = false;
        } else {
            runBlocklyCode(this.sourceBlock_); imgField.setValue("https://upload.wikimedia.org/wikipedia/commons/4/47/Stop_icon_red.svg"); this.sourceBlock_.isRunning = true;
        }
    }
};
javascript.javascriptGenerator.forBlock['start_hat'] = function(block) { return ''; };

Blockly.Blocks['go_home'] = { init: function() { this.appendDummyInput().appendField("🏠 ДОДОМУ (Назад)"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290); } };
javascript.javascriptGenerator.forBlock['go_home'] = function(block) { return 'await goHomeSequence();\n'; };

Blockly.Blocks['robot_move'] = { init: function() { this.appendDummyInput().appendField("🚗 Їхати").appendField("L").appendField(new Blockly.FieldTextInput("100"), "L").appendField("R").appendField(new Blockly.FieldTextInput("100"), "R"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(230); } };
javascript.javascriptGenerator.forBlock['robot_move'] = function(block, generator) {
    var l = block.getFieldValue('L'); var r = block.getFieldValue('R');
    return `recordMove(${l}, ${r}); await bt_move(${l}, ${r});\n`;
};

Blockly.Blocks['robot_stop'] = { init: function() { this.appendDummyInput().appendField("🛑 Стоп"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(0); } };
javascript.javascriptGenerator.forBlock['robot_stop'] = function(block, generator) { return `recordMove(0,0); await bt_move(0, 0);\n`; };

Blockly.Blocks['wait_seconds'] = { init: function() { this.appendDummyInput().appendField("⏳ Чекати").appendField(new Blockly.FieldTextInput("1"), "SECONDS"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(40); } };
javascript.javascriptGenerator.forBlock['wait_seconds'] = function(block, generator) { const sec = block.getFieldValue('SECONDS'); return `recordWait(${sec}); await new Promise(r => setTimeout(r, ${sec*1000}));\n`; };

Blockly.Blocks['move_3_motors'] = {
    init: function() {
        this.appendDummyInput().appendField("🚀 3 Мотори")
            .appendField("M1").appendField(new Blockly.FieldTextInput("100"), "M1")
            .appendField("M2").appendField(new Blockly.FieldTextInput("100"), "M2")
            .appendField("M3").appendField(new Blockly.FieldTextInput("100"), "M3");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260);
    }
};
javascript.javascriptGenerator.forBlock['move_3_motors'] = function(block, generator) {
    var m1 = block.getFieldValue('M1'); var m2 = block.getFieldValue('M2'); var m3 = block.getFieldValue('M3');
    return `await bt_move3(${m1}, ${m2}, ${m3});\n`;
};

// --- EXECUTION ---
let moveHistory = []; let isCodeRunning = false;
function recordMove(l, r) { if(isCodeRunning) moveHistory.push({ type: 'move', l: parseInt(l), r: parseInt(r) }); }
function recordWait(sec) { if(isCodeRunning) moveHistory.push({ type: 'wait', sec: parseFloat(sec) }); }

async function bt_move(l, r) {
    if (typeof isConnected !== 'undefined' && isConnected) {
        let bL = Math.max(-100, Math.min(100, parseInt(l))); let bR = Math.max(-100, Math.min(100, parseInt(r)));
        try { await sendRawPacket(new Int8Array([bL, bR, 10])); } catch(e){}
    }
}

async function bt_move3(m1, m2, m3) {
    if (typeof isConnected !== 'undefined' && isConnected) {
        let v1 = Math.max(-100, Math.min(100, parseInt(m1)));
        let v2 = Math.max(-100, Math.min(100, parseInt(m2)));
        let v3 = Math.max(-100, Math.min(100, parseInt(m3)));
        try { await sendRawPacket(new Int8Array([v1, v2, v3, 10])); } catch(e){}
    }
}

async function goHomeSequence() {
    for (let i = moveHistory.length - 1; i >= 0; i--) {
        const action = moveHistory[i];
        if (action.type === 'wait') await new Promise(r => setTimeout(r, action.sec * 1000));
        else if (action.type === 'move') await bt_move(-action.l, -action.r);
    }
    await bt_move(0, 0); moveHistory = [];
}

async function runBlocklyCode(startBlock) {
    if(typeof isConnected !== 'undefined' && !isConnected) { alert('Спочатку підключіться!'); return; }
    moveHistory = []; isCodeRunning = true;
    const code = javascript.javascriptGenerator.blockToCode(startBlock);
    try { const runner = new Function(`return (async () => { ${code} })();`); await runner(); } catch(e) { console.error(e); }
    isCodeRunning = false;
    if(startBlock) { startBlock.isRunning = false; startBlock.getField("RUN_ICON").setValue("https://upload.wikimedia.org/wikipedia/commons/2/21/Play_icon_green.svg"); }
}

function stopCode() { bt_move(0,0); isCodeRunning = false; }

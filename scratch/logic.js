// --- BLOCKLY INIT ---
var workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    theme: Blockly.Themes.Dark,
    renderer: 'zelos',
    zoom: { controls: false, wheel: true },
    trashcan: false
});

// --- TOOLBOX LOGIC (Modal -> Floating) ---
setTimeout(() => {
    const toolbox = document.querySelector('.blocklyToolboxDiv');
    if(toolbox) {
        // Додаємо ручки керування
        const dragH = document.createElement('div'); dragH.id = 'toolbox-drag-handle';
        toolbox.insertBefore(dragH, toolbox.firstChild);
        
        const resizeH = document.createElement('div'); resizeH.id = 'toolbox-resize-handle';
        toolbox.appendChild(resizeH);

        // --- DRAG LOGIC ---
        let isDragging = false;
        let startX, startY, initLeft, initTop;
        let firstDrag = true; // Прапорець першого переміщення

        const startDrag = (clientX, clientY) => {
            isDragging = true;
            
            // Якщо це перше перетягування - знімаємо CSS центрування
            if (firstDrag) {
                const rect = toolbox.getBoundingClientRect();
                // Фіксуємо поточні координати в пікселях
                toolbox.style.left = rect.left + 'px';
                toolbox.style.top = rect.top + 'px';
                toolbox.style.transform = 'none'; // Прибираємо центрування
                toolbox.style.margin = '0';
                firstDrag = false;
            }

            startX = clientX;
            startY = clientY;
            
            // Читаємо поточні left/top
            initLeft = parseInt(toolbox.style.left) || 0;
            initTop = parseInt(toolbox.style.top) || 0;
        };

        const doDrag = (clientX, clientY) => {
            if (!isDragging) return;
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            
            let newLeft = initLeft + deltaX;
            let newTop = initTop + deltaY;
            
            // Обмежуємо екраном
            newLeft = Math.max(0, Math.min(window.innerWidth - toolbox.offsetWidth, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - toolbox.offsetHeight, newTop));

            toolbox.style.left = newLeft + 'px';
            toolbox.style.top = newTop + 'px';
        };

        const stopDrag = () => { isDragging = false; };

        // Mouse Events
        dragH.addEventListener('mousedown', (e) => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
        window.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
        window.addEventListener('mouseup', stopDrag);

        // Touch Events
        dragH.addEventListener('touchstart', (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); });
        window.addEventListener('touchmove', (e) => doDrag(e.touches[0].clientX, e.touches[0].clientY));
        window.addEventListener('touchend', stopDrag);


        // --- RESIZE LOGIC ---
        let isResizing = false;
        
        const startResize = (e) => { isResizing = true; e.stopPropagation(); e.preventDefault(); };
        const doResize = (clientX) => { 
            if(isResizing) {
                // Враховуємо зсув, якщо вікно не зліва
                const newWidth = clientX - toolbox.getBoundingClientRect().left;
                toolbox.style.width = Math.max(140, Math.min(500, newWidth)) + 'px'; 
            }
        };
        const stopResize = () => { 
            if(isResizing) { isResizing = false; Blockly.svgResize(workspace); } 
        };

        resizeH.addEventListener('mousedown', startResize);
        resizeH.addEventListener('touchstart', startResize);
        
        window.addEventListener('mousemove', (e) => doResize(e.clientX));
        window.addEventListener('touchmove', (e) => doResize(e.touches[0].clientX));
        
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchend', stopResize);
    }
}, 500);

// --- BLOCKS (Ті самі, що й були) ---

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

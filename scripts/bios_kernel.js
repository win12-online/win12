function addZero(i) {
    return i < 10 ? `0${i}` : i;
}

function timeChange() {
    const d = new Date();
    $('#time')[0].innerText = `[${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}]`;
    $('#date')[0].innerText = `[${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}]`;
}

function toBoot() {
    setTimeout(() => {
        $('#body').html('');
        $('#body').css('cssText', 'background-color: black;');
    }, 500);
    setTimeout(() => {
        location.href = './boot.html';
    }, 1000);
}

function BIOS_confirm(tit, func) {
    $('#confirm-tit')[0].innerText = tit;
    $('#confirmContainer').css('display', 'flex');
    $('#confirm').attr('data-show', 'true');
    $('#confirm>.btns>*:first-child').attr('onclick', func);
    $('#confirm>.btns>*:first-child').attr('ontouchstart', `event.preventDefault();${func}`);
}

function changePage(t) {
    $('.tab.show').removeClass('show');
    $('.tab.foc').removeClass('foc');
    $(`.tab${t}`).addClass('show');
    $(`.tab${t}`).addClass('foc');
    $('.page.show').removeClass('show');
    $(`.page${t}`).addClass('show');
    tab = t;
}

let tab = 0;
let btn = 0;
let foc = 0;
let tab_back = tab;
let btn_back = btn;
let foc_back = foc;
let subFoc = -1;

timeChange();

// Add configuration state
const biosConfig = {
    cpuHyperThreading: true,
    cpuTurboBoost: true,
    cpuCoreRatio: 'Auto',
    memoryFrequency: 'Auto',
    memoryTimingMode: 'Auto',
    xmpProfile: false,
    fastBoot: true,
    bootMode: 'UEFI',
    secureBoot: true,
    tpmState: true
};

function toggleOption(optionElement) {
    const currentValue = optionElement.innerText;
    if (currentValue.includes('Enabled')) {
        optionElement.innerText = '[Disabled]';
        return false;
    }
    if (currentValue.includes('Disabled')) {
        optionElement.innerText = '[Enabled]';
        return true;
    }
    if (currentValue.includes('Auto')) {
        optionElement.innerText = '[Manual]';
        return 'Manual';
    }
    if (currentValue.includes('Manual')) {
        optionElement.innerText = '[Auto]';
        return 'Auto';
    }
    return currentValue;
}

function handleExitOption(option) {
    const action = $(option).attr('onclick') || '';
    if (action.includes('toBoot()')) {
        toBoot();
    } else if (action.includes('BIOS_confirm')) {
        const match = action.match(/BIOS_confirm\('([^']+)',\s*'([^']+)'\)/);
        if (match) {
            const [_, message, callback] = match;
            BIOS_confirm(message, callback);
        }
    }
}

function updateFocus() {
    // Clear all focus states first
    $('.option').css('background-color', '#aaaaaa');
    $('.option').css('color', '#0100a2');
    $('.exit').css('color', '#0100a2');
    
    const currentPage = $(`.page${tab}`);
    
    if (tab === tabs.length - 1) { // Exit page
        const exitOptions = currentPage.find('.exit');
        if (foc > 0 && foc <= exitOptions.length) {
            $(exitOptions[foc - 1]).css('color', '#ffffff');
        }
    } else { // Other pages
        const options = currentPage.find('.option');
        if (foc > 0 && options.length > 0) {
            const focusedOption = options[Math.min(foc - 1, options.length - 1)];
            if (focusedOption) {
                $(focusedOption).css('background-color', '#0100a2');
                $(focusedOption).css('color', '#ffffff');
            }
        }
    }
}

// Update tabs array
const tabs = ['main', 'advanced', 'boot', 'security', 'exit'];

changePage(0);
document.oncontextmenu = () => false;

window.onkeydown = (evt) => {
    const event = evt || window.event;
    
    if ($('#confirm').attr('data-show') !== 'true') {
        if (event.keyCode === 9) { // Tab
            event.preventDefault();
            tab = (tab + 1) % tabs.length;
            foc = 0;
            changePage(tab);
        }
        else if (event.keyCode === 121) { // F10
            toBoot();
        }
        else if (event.keyCode === 39) { // Right
            event.preventDefault();
            if (tab < tabs.length - 1) {
                tab++;
                foc = 0;
                changePage(tab);
            }
        }
        else if (event.keyCode === 37) { // Left
            event.preventDefault();
            if (tab > 0) {
                tab--;
                foc = 0;
                changePage(tab);
            }
        }
        else if (event.keyCode === 40) { // Down
            event.preventDefault();
            const currentPage = $(`.page${tab}`);
            if (tab === tabs.length - 1) { // Exit page
                const exitOptions = currentPage.find('.exit');
                if (exitOptions.length > 0) {
                    foc = Math.min(foc + 1, exitOptions.length);
                    updateFocus();
                }
            } else {
                const options = currentPage.find('.option');
                if (options.length > 0) {
                    foc = Math.min(foc + 1, options.length);
                    updateFocus();
                }
            }
        }
        else if (event.keyCode === 38) { // Up
            event.preventDefault();
            if (foc > 0) {
                foc--;
                updateFocus();
            }
        }
        else if (event.keyCode === 13) { // Enter
            const currentPage = $(`.page${tab}`);
            if (tab === tabs.length - 1) { // Exit page
                const exitOptions = currentPage.find('.exit');
                if (foc > 0 && foc <= exitOptions.length) {
                    const focusedOption = exitOptions[foc - 1];
                    handleExitOption(focusedOption);
                }
            } else {
                const options = currentPage.find('.option');
                if (foc > 0 && foc <= options.length) {
                    const focusedOption = options[foc - 1];
                    const newValue = toggleOption(focusedOption);
                    const optionId = $(focusedOption).attr('data-option');
                    if (optionId) {
                        biosConfig[optionId] = newValue;
                    }
                }
            }
        }
    } else {
        // Confirm dialog navigation
        if (event.keyCode === 39 || event.keyCode === 37) { // Right/Left
            event.preventDefault();
            btn = btn ? 0 : 1;
            if (btn) {
                $('#cancel-btn').css('cssText', 'background-color: #000; color: #fff;');
                $('#ok-btn').css('cssText', 'color: #000; background-color: #fff;');
            } else {
                $('#ok-btn').css('cssText', 'background-color: #000;color: #fff;');
                $('#cancel-btn').css('cssText', 'color: #000;background-color: #fff;');
            }
        }
        else if (event.keyCode === 13) { // Enter
            event.preventDefault();
            if (btn) {
                $('#confirmContainer').css('display', 'none');
                $('#confirm').attr('data-show', 'false');
            } else {
                toBoot();
            }
            btn = 0;
            $('#ok-btn').css('cssText', 'background-color: #000;color: #fff;');
            $('#cancel-btn').css('cssText', 'color: #000;background-color: #fff;');
        }
    }
};

// Add click handlers for options
for (const option of document.querySelectorAll('.option')) {
    option.addEventListener('click', function() {
        const newValue = toggleOption(this);
        const optionId = this.getAttribute('data-option');
        if (optionId) {
            biosConfig[optionId] = newValue;
        }
    });
}

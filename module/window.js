// 窗口操作模块

/***** 项目一级保护代码 *****
 未经允许，严禁擅改，否则可致灾难性错误 */
function showwin(name) {
    $('.window.' + name).addClass('show-begin');
    setTimeout(() => { $('.window.' + name).addClass('show'); }, 0);
    setTimeout(() => { $('.window.' + name).addClass('notrans'); }, 200);
    if (name != 'run') {
        $('.window.' + name).attr('style', 'top: 10%;left: 15%;');
    }
    $('#taskbar>.' + wo[0]).removeClass('foc');
    $('.window.' + wo[0]).removeClass('foc');
    wo.splice(0, 0, name);
    orderwin();
    $('.window.' + name).addClass('foc');
    if (!$('#start-menu.show')[0] && !$('#search-win.show')[0] && !$('#widgets.show')[0] && !$('#control.show')[0] && !$('#datebox.show')[0]) {
        $('#dock-box').removeClass('hide');
    }
    else {
        $('#dock-box').removeClass('hide');
    }
}

function hidewin(name, arg = 'window') {
    $('.window.' + name).removeClass('notrans');
    $('.window.' + name).removeClass('max');
    $('.window.' + name).removeClass('show');
    if (name == 'camera') {
      // 相机关闭后统一清理 tracks
      closeVideo()
    }
    if (arg == 'window') {
        $('#taskbar').attr('count', Number($('#taskbar').attr('count')) - 1);
        $('#taskbar>.' + name).remove();
        $('#taskbar').css('width', 4 + $('#taskbar').attr('count') * (34 + 4));
        setTimeout(() => {
            if ($('#taskbar').attr('count') == '0') {
                $('#taskbar').css('display', 'none');
            }
        }, 80);
    }
    setTimeout(() => {
        $('.window.' + name).removeClass('show-begin');
        if (name == 'run') {
            window.setTimeout(() => {
                $('.window.' + name).attr('style', '');
            }, 200);
        }
    }, 200);
    $('.window.' + name + '>.titbar>div>.wbtg.max').html('<i class="bi bi-app"></i>');
    wo.splice(wo.indexOf(name), 1);
    focwin(wo[wo.length - 1]);
    // orderwindow();
    if (!$('#start-menu.show')[0] && !$('#search-win.show')[0] && !$('#widgets.show')[0] && !$('#control.show')[0] && !$('#datebox.show')[0]) {
        $('#dock-box').removeClass('hide');
    }
    else {
        $('#dock-box').removeClass('hide');
    }
    if (arg == 'window') {
        if (apps[name].remove) {
            apps[name].remove();
        }
    }
}

function maxwin(name, trigger = true) {
    if ($('.window.' + name).hasClass('max')) {
        $('.window.' + name).removeClass('left');
        $('.window.' + name).removeClass('right');
        $('.window.' + name).removeClass('max');
        $('.window.' + name + '>.titbar>div>.wbtg.max').html('<i class="bi bi-app"></i>');
        if (trigger) {
            setTimeout(() => { $('.window.' + name).addClass('notrans'); }, 200);
        }
        else if (!trigger) {
            $('.window.' + name).addClass('notrans');
        }
        if ($('.window.' + name).attr('data-pos-x') != 'null' && $('.window.' + name).attr('data-pos-y') != 'null') {
            // $('.window.' + name).attr(`style`, `left:${$('.window.' + name).attr('data-pos-x')};top:${$('.window.' + name).attr('data-pos-y')}`);
            $('.window.' + name).css('left', `${$('.window.' + name).attr('data-pos-x')}`);
            $('.window.' + name).css('top', `${$('.window.' + name).attr('data-pos-y')}`);
        }
        // }
    } else {
        if (trigger) {
            $('.window.' + name).attr('data-pos-x', `${$('.window.' + name).css('left')}`);
            $('.window.' + name).attr('data-pos-y', `${$('.window.' + name).css('top')}`);
        }
        $('.window.' + name).removeClass('notrans');
        $('.window.' + name).addClass('max');
        $('.window.' + name + '>.titbar>div>.wbtg.max').html('<svg version="1.1" width="12" height="12" viewBox="0,0,37.65105,35.84556" style="margin-top:4px;"><g transform="translate(-221.17804,-161.33903)"><g style="stroke:var(--text);" data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill="none" fill-rule="nonzero" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M224.68734,195.6846c-2.07955,-2.10903 -2.00902,-6.3576 -2.00902,-6.3576l0,-13.72831c0,0 -0.23986,-1.64534 2.00902,-4.69202c1.97975,-2.68208 4.91067,-2.00902 4.91067,-2.00902h14.06315c0,0 3.77086,-0.23314 5.80411,1.67418c2.03325,1.90732 1.33935,5.02685 1.33935,5.02685v13.39347c0,0 0.74377,4.01543 -1.33935,6.3576c-2.08312,2.34217 -5.80411,1.67418 -5.80411,1.67418h-13.39347c0,0 -3.50079,0.76968 -5.58035,-1.33935z"/><path d="M229.7952,162.85325h16.06111c0,0 5.96092,-0.36854 9.17505,2.64653c3.21412,3.01506 2.11723,7.94638 2.11723,7.94638v18.55642"/></g></g></svg>');
    }
    $('#dock-box').removeClass('hide');
}
function minwin(name) {
    if ($('.window.' + name).hasClass('min')) {
        const win = $('.window.' + name);
        const origLeft = win.attr('data-pos-x');
        const origTop = win.attr('data-pos-y');
        
        // Remove min class first
        win.removeClass('min');
        $('#taskbar>.' + name).removeClass('min');
        
        // Restore transform and position with animation
        setTimeout(() => {
            win.css('transition', 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)');
            win.css('transform', 'translate(0, 0) scale(1)');
            win.css('opacity', '1');
            
            if (origLeft && origTop && !win.hasClass('max') && origLeft !== 'auto' && origTop !== 'auto') {
                win.css('left', origLeft);
                win.css('top', origTop);
            }
            
            if (win.hasClass('min-max')) {
                win.addClass('max');
                win.removeClass('min-max');
            }
        }, 20);
        
        // Clean up after animation - don't clear left/top
        setTimeout(() => {
            win.css('transition', '');
            win.css('transform', '');
            win.css('opacity', '');
            if (!win.hasClass('max')) {
                win.addClass('notrans');
            }
            win.addClass('foc');
        }, 220);
    } else {
        const taskbarItem = $('#taskbar>.' + name);
        if (taskbarItem.length) {
            const rect = taskbarItem[0].getBoundingClientRect();
            const win = $('.window.' + name);
            
            if (!win.attr('data-pos-x')) {
                win.attr('data-pos-x', win.css('left'));
            }
            if (!win.attr('data-pos-y')) {
                win.attr('data-pos-y', win.css('top'));
            }
            
            const winRect = win[0].getBoundingClientRect();
            const deltaX = (rect.left + rect.width / 2) - (winRect.left + winRect.width / 2);
            const deltaY = (rect.top + rect.height / 2) - (winRect.top + winRect.height / 2);
            
            win.css('left', winRect.left + 'px');
            win.css('top', winRect.top + 'px');
            win[0].offsetHeight;
            win.css('transition', 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)');
            
            setTimeout(() => {
                focwin(null);
                if (win.hasClass('max')) {
                    win.addClass('min-max');
                }
                win.removeClass('foc');
                win.removeClass('max');
                $('#taskbar>.' + name).addClass('min');
                win.addClass('min');
                win.removeClass('notrans');
                win.css('transform', `translate(${deltaX}px, ${deltaY}px) scale(0.2)`);
                win.css('opacity', '0');
            }, 20);
        }
    }
}

function resizewin(win, arg, resizeElt) {
    page.onmousemove = function (e) {
        win_resizing(win, e, arg);
    };
    page.ontouchmove = function (e) {
        win_resizing(win, e, arg);
    };
    function up_f() {
        page.onmousedown = null;
        page.ontouchstart = null;
        page.onmousemove = null;
        page.ontouchmove = null;
        page.ontouchcancel = null;
        page.style.cursor = 'auto';
    }
    page.onmouseup = up_f;
    page.ontouchend = up_f;
    page.ontouchcancel = up_f;
    page.style.cursor = window.getComputedStyle(resizeElt, null).cursor;
}
function win_resizing(win, e, arg) {
    let x, y,
        minWidth = win.dataset.minWidth ? win.dataset.minWidth : 400,
        minHeight = win.dataset.minHeight ? win.dataset.minHeight : 300,
        offsetLeft = win.getBoundingClientRect().left,
        offsetTop = win.getBoundingClientRect().top,
        offsetRight = win.getBoundingClientRect().right,
        offsetBottom = win.getBoundingClientRect().bottom;
    if (e.type.match('mouse')) {
        x = e.clientX;
        y = e.clientY;
    }
    else if (e.type.match('touch')) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    }
    if (arg == 'right' && x - offsetLeft >= minWidth) {
        win.style.width = x - offsetLeft + 'px';
    }
    else if (arg == 'right') {
        win.style.width = minWidth + 'px';
    }

    if (arg == 'left' && offsetRight - x >= minWidth) {
        win.style.left = x + 'px';
        win.style.width = offsetRight - x + 'px';
    }
    else if (arg == 'left') {
        win.style.width = minWidth + 'px';
        win.style.left = offsetRight - minWidth + 'px';
    }

    if (arg == 'bottom' && y - offsetTop >= minHeight) {
        win.style.height = y - offsetTop + 'px';
    }
    else if (arg == 'bottom') {
        win.style.height = minHeight + 'px';
    }

    if (arg == 'top' && offsetBottom - y >= minHeight) {
        win.style.top = y + 'px';
        win.style.height = offsetBottom - y + 'px';
    }
    else if (arg == 'top') {
        win.style.top = offsetBottom - minHeight + 'px';
        win.style.height = minHeight + 'px';
    }

    if (arg == 'top-left') {
        if (offsetRight - x >= minWidth) {
            win.style.left = x + 'px';
            win.style.width = offsetRight - x + 'px';
        }
        else {
            win.style.left = offsetRight - minWidth + 'px';
            win.style.width = minWidth + 'px';
        }
        if (offsetBottom - y >= minHeight) {
            win.style.top = y + 'px';
            win.style.height = offsetBottom - y + 'px';
        }
        else {
            win.style.top = offsetBottom - minHeight + 'px';
            win.style.height = minHeight + 'px';
        }
    }

    else if (arg == 'top-right') {
        if (x - offsetLeft >= minWidth) {
            win.style.width = x - offsetLeft + 'px';
        }
        else {
            win.style.width = minWidth + 'px';
        }
        if (offsetBottom - y >= minHeight) {
            win.style.top = y + 'px';
            win.style.height = offsetBottom - y + 'px';
        }
        else {
            win.style.top = offsetBottom - minHeight + 'px';
            win.style.height = minHeight + 'px';
        }
    }

    else if (arg == 'bottom-left') {
        if (offsetRight - x >= minWidth) {
            win.style.left = x + 'px';
            win.style.width = offsetRight - x + 'px';
        }
        else {
            win.style.left = offsetRight - minWidth + 'px';
            win.style.width = minWidth + 'px';
        }
        if (y - offsetTop >= minHeight) {
            win.style.height = y - offsetTop + 'px';
        }
        else {
            win.style.height = minHeight + 'px';
        }
    }

    else if (arg == 'bottom-right') {
        if (x - offsetLeft >= minWidth) {
            win.style.width = x - offsetLeft + 'px';
        }
        else {
            win.style.width = minWidth + 'px';
        }
        if (y - offsetTop >= minHeight) {
            win.style.height = y - offsetTop + 'px';
        }
        else {
            win.style.height = minHeight + 'px';
        }
    }
}
let wo = [];
function orderwin() {
    for (let i = 0; i < wo.length; i++) {
        const win = $('.window.' + wo[wo.length - i - 1]);
        if (topmost.includes(wo[wo.length - i - 1])) {
            win.css('z-index', 10 + i + 50);
        } else {
            win.css('z-index', 10 + i);
        }
    }
}

// 拖拽窗口
const titbars = document.querySelectorAll('.window>.titbar');
const wins = document.querySelectorAll('.window');
let deltaLeft = 0, deltaTop = 0, fil = false, filty = 'none', bfLeft = 0, bfTop = 0;
function win_move(e) {
    let cx, cy;
    if (e.type == 'touchmove') {
        cx = e.targetTouches[0].clientX, cy = e.targetTouches[0].clientY;
    }
    else {
        cx = e.clientX, cy = e.clientY;
    }
    // $(this).css('cssText', `left:${cx - deltaLeft}px;top:${cy - deltaTop}px;`);
    $(this).css('left', `${cx - deltaLeft}px`);
    $(this).css('top', `${cy - deltaTop}px`);
    if (cy <= 0) {
        // $(this).css('cssText', `left:${cx - deltaLeft}px;top:${-deltaTop}px`);
        $(this).css('left', `${cx - deltaLeft}px`);
        $(this).css('top', `${-deltaTop}px`);
        if (!(this.classList[1] in nomax)) {
            $('#window-fill').addClass('top');
            setTimeout(() => {
                $('#window-fill').addClass('fill');
            }, 0);
            fil = this;
            filty = 'top';
        }
        // console.log(this.classList[1], nomax,this.classList[1] in nomax,not this.classList[1] in nomax);
    }
    else if (cx <= 0) {
        // $(this).css('cssText', `left:${-deltaLeft}px;top:${cy - deltaTop}px`);
        $(this).css('left', `${-deltaLeft}px`);
        $(this).css('top', `${cy - deltaTop}px`);
        if (!(this.classList[1] in nomax)) {
            $('#window-fill').addClass('left');
            setTimeout(() => {
                $('#window-fill').addClass('fill');
            }, 0);
            fil = this;
            filty = 'left';
        }
    }
    else if (cx >= document.body.offsetWidth - 2) {
        // $(this).css('cssText', `left:calc(100% - ${deltaLeft}px);top:${cy - deltaTop}px`);
        $(this).css('left', `calc(100% - ${deltaLeft}px)`);
        $(this).css('top', `${cy - deltaTop}px`);
        if (!(this.classList[1] in nomax)) {
            $('#window-fill').addClass('right');
            setTimeout(() => {
                $('#window-fill').addClass('fill');
            }, 0);
            fil = this;
            filty = 'right';
        }
    }
    else if (fil) {
        $('#window-fill').removeClass('fill');
        setTimeout(() => {
            $('#window-fill').removeClass('top');
            $('#window-fill').removeClass('left');
            $('#window-fill').removeClass('right');
        }, 200);
        fil = false;
        filty = 'none';
    }
    else if ($(this).hasClass('max')) {
        deltaLeft = deltaLeft / (this.offsetWidth - (45 * 3)) * ((0.7 * document.body.offsetWidth) - (45 * 3));
        maxwin(this.classList[1], false);
        // 窗口控制按钮宽 45px
        // $(this).css('cssText', `left:${cx - deltaLeft}px;top:${cy - deltaTop}px;`);
        $(this).css('left', `${cx - deltaLeft}px`);
        $(this).css('top', `${cy - deltaTop}px`);
        $('.window.' + this.classList[1] + '>.titbar>div>.wbtg.max').html('<i class="bi bi-app"></i>');

        $(this).addClass('notrans');
    }else if(cy >= document.body.offsetHeight - 10){
        $(this).css('left', `${cx - deltaLeft}px`);
        $(this).css('top', `calc(100% - ${deltaTop}px)`);
    }
}
for (let i = 0; i < wins.length; i++) {
    const win = wins[i];
    const titbar = titbars[i];
    titbar.addEventListener('mousedown', (e) => {
        if ($('.taskmgr>.titbar>div>input').is(':focus')) {
            return;
        }
        let x = window.getComputedStyle(win, null).getPropertyValue('left').split('px')[0];
        let y = window.getComputedStyle(win, null).getPropertyValue('top').split('px')[0];
        if (y != 0) {
            bfLeft = x;
            bfTop = y;
        }
        deltaLeft = e.clientX - x;
        deltaTop = e.clientY - y;
        page.onmousemove = win_move.bind(win);
    });
    titbar.addEventListener('touchstart', (e) => {
        let x = window.getComputedStyle(win, null).getPropertyValue('left').split('px')[0];
        let y = window.getComputedStyle(win, null).getPropertyValue('top').split('px')[0];
        if (y != 0) {
            bfLeft = x;
            bfTop = y;
        }
        deltaLeft = e.targetTouches[0].clientX - x;
        deltaTop = e.targetTouches[0].clientY - y;
        page.ontouchmove = win_move.bind(win);
    });
}
page.addEventListener('mouseup', () => {
    page.onmousemove = null;
    if (fil) {
        if (filty == 'top') {
            maxwin(fil.classList[1], false);
        }
        else if (filty == 'left') {
            $(fil).addClass('left');
            maxwin(fil.classList[1], false);
        }
        else if (filty == 'right') {
            $(fil).addClass('right');
            maxwin(fil.classList[1], false);
        }
        setTimeout(() => {
            $('#window-fill').removeClass('fill');
            $('#window-fill').removeClass('top');
            $('#window-fill').removeClass('left');
            $('#window-fill').removeClass('right');
        }, 200);
        $('.window.' + fil.classList[1]).attr('data-pos-x', `${bfLeft}px`);
        $('.window.' + fil.classList[1]).attr('data-pos-y', `${bfTop}px`);
        fil = false;
    }
});
page.addEventListener('touchend', () => {
    page.ontouchmove = null;
    if (fil) {
        if (filty == 'top')
            maxwin(fil.classList[1], false);
        else if (filty == 'left') {
            maxwin(fil.classList[1], false);
            $(fil).addClass('left');
        } else if (filty == 'right') {
            maxwin(fil.classList[1], false);
            $(fil).addClass('right');
        }
        setTimeout(() => {
            $('#window-fill').removeClass('fill');
            $('#window-fill').removeClass('top');
            $('#window-fill').removeClass('left');
            $('#window-fill').removeClass('right');
        }, 200);
        setTimeout(() => {
            $('.window.' + fil.classList[1]).attr('data-pos-x', `${bfLeft}px`);
            $('.window.' + fil.classList[1]).attr('data-pos-y', `${bfTop}px`);
        }, 200);
        fil.setAttribute('style', `left:${bfLeft}px;top:${bfTop}px`);
        fil = false;
    }
});
page.addEventListener('mousemove', (e) => {
    if (e.clientY >= window.innerHeight - 60) {
        $('#dock-box').removeClass('hide');
    }
    else {
        $('#dock-box').removeClass('hide');
    }
});


// 屎山警告
function focwin(name, arg = 'window') {
    // if(wo[0]==name)return;
    if (arg == 'window') {
        $('#taskbar>.' + wo[0]).removeClass('foc');
        $('#taskbar>.' + name).addClass('foc');
    }
    $('.window.' + wo[0]).removeClass('foc');
    wo.splice(wo.indexOf(name), 1);
    wo.splice(0, 0, name);
    orderwin();
    $('.window.' + name).addClass('foc');
}
function taskbarclick(name) {
    if ($('.window.' + name).hasClass('foc')) {
        minwin(name);
        // focwin(null); 
        return;
    }
    if ($('.window.' + name).hasClass('min')) {
        minwin(name);
    }
    focwin(name);
}
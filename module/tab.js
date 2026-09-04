let m_tab={
    closing: new WeakSet(),
    newtab: (appn,n) => {
        let app=apps[appn];
        app.tabs.push([app.len++, n]);
        m_tab.settabs(appn);
    },
    settabs: (appn) => {
        let app=apps[appn];
        let html = '';
        for (let i = 0; i < app.tabs.length; i++) {
            const t = app.tabs[i];
            html+=app.settab(t,i);
        }
        $(`.window.${appn}>.titbar>.tabs`)[0].innerHTML = html;
        $(`.window.${appn}>.titbar>.tabs`)[0].innerHTML += `<a class="new bi bi-plus" onclick="apps.${appn}.newtab()"></a>`;
        // $(`.window.${appn}>.titbar>.tabs>.tab.`+app.tabs[app.now][0]).addClass('show');
    },
    moving: (appn, t, ev, np) => {
        let app=apps[appn];
        let deltaLeft, pos=np;
        if (ev.type.match('mouse')) {
            deltaLeft = ev.clientX;
        }
        else if (ev.type.match('touch')) {
            deltaLeft = ev.touches[0].clientX;
        }
        function move_f(e) {
            let x;
            if (e.type.match('mouse')) {
                x = e.clientX;
            }
            else if (e.type.match('touch')) {
                x = e.touches[0].clientX;
            }
            $(this).css('transform', `translateX(${x - deltaLeft}px)`);
            pos = Math.floor((this.offsetLeft + x - deltaLeft - 36 + (this.offsetWidth / 2)) / this.offsetWidth);
            if (pos > app.tabs.length - 1) {
                pos = app.tabs.length - 1;
            }
            $(`.window.${appn}>.titbar>.tabs>.tab.left`).removeClass('left');
            $(`.window.${appn}>.titbar>.tabs>.tab.right`).removeClass('right');
            if (np < pos) {
                for (let i = np + 1; i <= pos; i++) {
                    const ta = app.tabs[i];
                    if (ta) {
                        $(`.window.${appn}>.titbar>.tabs>.tab.` + ta[0]).addClass('left');
                    }
                }
            }
            else if (np > pos) {
                for (let i = pos; i < np; i++) {
                    const ta = app.tabs[i];
                    if (ta) {
                        $(`.window.${appn}>.titbar>.tabs>.tab.${ta[0]}`).addClass('right');
                    }
                }
            }
        };
        page.onmousemove = move_f.bind(t);
        page.ontouchmove = move_f.bind(t);

        function up_f(e) {
            page.onmousemove = null;
            page.onmouseup = null;
            page.ontouchmove = null;
            page.ontouchend = null;
            page.ontouchcancel = null;
            // let x;
            // if (e.type.match('mouse')) {
            //     x = e.clientX;
            // }else if (e.type.match('touch')) {
            //     x = e.touches[0].clientX
            // }
            // pos = Math.floor((this.offsetLeft + x - deltaLeft - 36 + (this.offsetWidth / 2)) / this.offsetWidth);
            if (pos > app.tabs.length - 1) {
                pos = app.tabs.length - 1;
            }
            if (pos == np || pos > app.tabs.length || pos < 0) {
                $(this).css('transform', 'none');
                $(this).removeClass('moving');
                $(`.window.${appn}>.titbar>.tabs>.tab.left`).removeClass('left');
                $(`.window.${appn}>.titbar>.tabs>.tab.right`).removeClass('right');
            }
            else {
                app.tabs.splice(np < pos ? pos + 1 : pos, 0, app.tabs[np]);
                app.tabs.splice(np < pos ? np : (np + 1), 1);
                m_tab.settabs(appn);
                // console.log('pos:',pos);
                m_tab.tab(appn,pos);
            }
        }
        page.onmouseup = up_f.bind(t);
        page.ontouchend = up_f.bind(t);
        page.ontouchcancel = up_f.bind(t);
        $(t).addClass('moving');
    },
    close: (appn, c) => {
        let app=apps[appn];
        const tab = app.tabs[c];
        if (!tab || m_tab.closing.has(tab)) {
            return;
        }
        const tabId = tab[0];
        m_tab.closing.add(tab);
        $(`.window.${appn}>.titbar>.tabs>.tab.${tabId}`).addClass('close');
        for (let i = c + 1; i < app.tabs.length; i++) {
            const _id = app.tabs[i][0];
            $(`.window.${appn}>.titbar>.tabs>.tab.${_id}`).addClass('left');
        }
        setTimeout(() => {
            const currentIndex = app.tabs.findIndex(current => current[0] == tabId);
            if (currentIndex < 0 || app.tabs[currentIndex] !== tab) {
                m_tab.closing.delete(tab);
                return;
            }
            $(`#win-${appn}>iframe.${tabId}`).remove();
            app.tabs.splice(currentIndex, 1);
            m_tab.closing.delete(tab);
            m_tab.settabs(appn);
            if (app.tabs.length == 0) {
                hidewin(appn);
            }
            else {
                m_tab.tab(appn,app.tabs.length - 1);
            }
        }, 200);
    },
    tab: (appn,c,load=true) => {
        focwin(appn);
        let app=apps[appn];
        app.now = c;
        app.tab(c,load);
        $(`.window.${appn}>.titbar>.tabs>.tab.show`).removeClass('show');
        $(`.window.${appn}>.titbar>.tabs>.tab.${app.tabs[c][0]}`).addClass('show');
    },
    rename: (appn,n) => {
        let app=apps[appn];
        app.tabs[app.now][1] = n;
        m_tab.settabs(appn);
        m_tab.tab(appn,app.now,false);
    },
}

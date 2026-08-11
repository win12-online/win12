/**
 * @author lingbopro
 * 在线新闻功能
 */

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

var news = {
    sources: [
        {
            name: '东方网',
            description: '东方网新闻头条（使用公益 API）',
            url: 'https://tools.mgtv100.com/external/v1/toutiao/index',
            async getData() {
                try {
                    const response = await fetch(this.url);
                    const data = await response.json();
                    if (!(data.status === 'success' && data.code === 200)) {
                        return {
                            status: 'error',
                            message: '返回结果中未包含成功信息',
                        };
                    }
                    const list = data.data.result.data.map((value) => {
                        return {
                            title: value.title,
                            author: value.author_name,
                            category: value.category,
                            url: value.url,
                            image: value.thumbnail_pic_s,
                        };
                    });
                    return {
                        status: 'success',
                        data: list,
                    };
                } catch (error) {
                    return {
                        status: 'error',
                        error: error,
                    };
                }
            },
        },
        {
            name: '知乎每日新闻',
            description: '知乎每日新闻（使用公益 API）',
            url: 'https://v.api.aa1.cn/api/zhihu-news/index.php?aa1=xiarou',
            async getData() {
                try {
                    const response = await fetch(this.url);
                    const data = await response.json();
                    const list = data.news.map((value) => {
                        return {
                            title: value.title,
                            hint: value.hint,
                            url: value.url,
                            image: value.image,
                        };
                    });
                    return {
                        status: 'success',
                        data: list,
                    };
                } catch (error) {
                    return {
                        status: 'error',
                        error: error,
                    };
                }
            },
        },
    ],
    setupExecuted: false,
    selectedSource: 0,
    setup() {
        if (this.setupExecuted) {
            return;
        }
        const sourcesListSelectInnerListHtml = this.sources
            .map((value, index) => {
                return `<a class="a" onclick="closenotice(); news.setSource(${index})" win12_title="${value.description}">${value.name}</a>`;
            })
            .join('\n');
        nts['widgets.news.source'].cnt = `
                <p class="tit">切换新闻源</p>
                <list class="new">
                    ${sourcesListSelectInnerListHtml}
                </list>`;
        this.refresh();
        this.setupExecuted = true;
    },
    setSource(index) {
        this.selectedSource = index;
        this.refresh();
    },
    async refresh() {
        const contentEl = document.querySelector('#widgets>.news>.content');
        const contentNewsEl = document.querySelector('#widgets>.news>.content>.news-all');
        this.setFullTip(false, true, '加载中');
        contentNewsEl.innerHTML = '';
        const data = await this.sources[this.selectedSource].getData();
        if (data.status !== 'success') {
            this.setFullTip(
                false,
                false,
                '载入失败',
                '无法载入新闻。\n请检查你的网络设置，或更改新闻源并稍后再试。',
                '详细信息：' + (data.error ? data.error.message : data.message ? data.message : '未知')
            );
            return;
        }
        const genCardHTML = async (data, classList = '') => {
            return `
<div class="card ${classList}" style="background: url(${data.image}) right;">
    <p class="tit">${await this.parseToHTMLString(data.title)}</p>
    <a class="a" onclick="openapp(\'edge\');window.setTimeout(() => {apps.edge.newtab();apps.edge.goto('${data.url}');}, 300);">详细信息 &gt;</a>
</div>
`;
        };
        const topNews = data.data.shift();
        const topNewsHTML = await genCardHTML(topNews, 'top-news');
        let contentNews = [''];
        for (let i = 0; i < data.data.length; i++) {
            const current = data.data[i];
            const html = await genCardHTML(current, i % 2 == 0 ? 'card-left' : 'card-right');
            contentNews.push(html);
            // 不等待会有严重卡顿，我也不知道为啥
            await wait(1);
        }
        let contentNewsHTML = '';
        for (let i = 0; i < contentNews.length; i += 2) {
            contentNewsHTML += `
<div class="line">${contentNews[i]}${i + 1 < contentNews.length ? contentNews[i + 1] : ''}</div>`;
            await wait(1);
        }
        contentEl.innerHTML = `
${topNewsHTML}
<div class="news-all">
${contentNewsHTML}
</div>
`;
        this.setFullTip(true);
    },
    setFullTip(hidden = true, loading = false, tit = '', desc = '', data = '') {
        let fullTipEl = document.querySelector('#widgets>.news>.full-tip');
        fullTipEl.querySelector('loading').hidden = !loading;
        fullTipEl.querySelector('.tit').innerText = tit;
        fullTipEl.querySelector('.desc').innerText = desc;
        fullTipEl.querySelector('.info').innerText = data;
        if (hidden) {
            fullTipEl.classList.add('hidden');
        } else {
            fullTipEl.classList.remove('hidden');
        }
    },
    async parseToHTMLString(str) {
        let element = document.createElement('span');
        element.innerText = str;
        return element.innerHTML;
    },
};

/* 终端彩蛋。从 desktop.js 的 runcmd 抽出 —— 这 4 个分支原本占了该函数 599 行中的约 280 行。
 * 每个彩蛋只依赖 inTerminal 与全局 jQuery，不闭包 runcmd 的任何其他局部变量。
 */
'use strict';
const terminalEggs = {
    matrix(inTerminal) {
        if (inTerminal) {
            const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890'; // 哈？(from stsc)
            let matrix = '';

            // 创建一个专门的容器来放置 matrix 效果
            const matrixContainer = $('<div class="matrix-container" style="font-family: monospace; line-height: 1.2;"></div>');
            $('#win-terminal>.text-cmd').append(matrixContainer);

            for (let i = 0; i < 15; i++) {
                let line = '';
                for (let j = 0; j < 50; j++) {
                    const rand = Math.random();
                    if (rand < 0.3) {
                        line += `<span style="color: #0f0; text-shadow: 0 0 8px #0f0;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else if (rand < 0.4) {
                        line += `<span style="color: #fff; text-shadow: 0 0 8px #fff;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else {
                        line += `<span style="color: #050;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    }
                }
                matrix += line + '\n';
            }
            matrixContainer.html(matrix);

            // 添加动画效果
            const interval = setInterval(() => {
                const newLine = Array.from({ length: 50 }, () => {
                    const rand = Math.random();
                    if (rand < 0.3) {
                        return `<span style="color: #0f0; text-shadow: 0 0 8px #0f0;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else if (rand < 0.4) {
                        return `<span style="color: #fff; text-shadow: 0 0 8px #fff;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else {
                        return `<span style="color: #050;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    }
                }).join('');

                const matrixContent = matrixContainer.html().split('\n');
                matrixContent.shift();
                matrixContent.push(newLine);
                matrixContainer.html(matrixContent.join('\n'));
            }, 100);

            // 10 秒后停止动画并移除容器
            setTimeout(() => {
                clearInterval(interval);
                setTimeout(() => {
                    matrixContainer.fadeOut(500, function () {
                        $(this).remove();
                    });
                }, 500);
            }, 10000);
        }
        return true;
    },
    snow(inTerminal) {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append('让整个屏幕下雪吧! ❄️\n');
            if (!$('#snow-container').length) {
                $('body').append(`
                    <div id="snow-container" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999;">
                        <div id="snow-pile" style="position: absolute; bottom: 0; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; perspective: 1000px; transform-style: preserve-3d;"></div>
                    </div>
                `);
            }

            const snowflakes = ['❄', '❅', '❆', '✻', '✼', '❉'];
            const pileFlakes = ['❄', '❅', '❆'];
            const colors = ['#fff', '#eef', '#ddf'];
            let pileCount = 0;
            let lastPilePosition = 50; // 用于记录上一个堆积位置

            function createSnowflake() {
                const flake = snowflakes[Math.floor(Math.random() * snowflakes.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = Math.random() * 1.2 + 0.6;
                const left = Math.random() * 100;
                const fallDuration = 3 + Math.random() * 2;
                const $snowflake = $(`<span class="snowflake" style="position: absolute; left: ${left}%; top: -10%; font-size: ${size}em; color: ${color}; text-shadow: 0 0 5px ${color}; transition: all ${fallDuration}s linear; opacity: 0.8; transform: rotate(0deg) translateZ(0);">${flake}</span>`);

                $('#snow-container').append($snowflake);

                setTimeout(() => {
                    const rotation = Math.random() * 360;
                    const finalLeft = left + (Math.random() - 0.5) * 20;
                    $snowflake.css({
                        transform: `rotate(${rotation}deg) translateZ(0)`,
                        top: '90%',
                        left: `${finalLeft}%`
                    });
                }, 50);

                setTimeout(() => {
                    $snowflake.css({
                        transition: 'all 0.5s ease-out',
                        opacity: 0
                    });

                    if (pileCount < 200) {
                        const pileFlake = pileFlakes[Math.floor(Math.random() * pileFlakes.length)];
                        const pileSize = Math.random() * 0.4 + 0.3; // 减小堆积雪花的大小

                        // 计算新的堆积位置，使其更自然
                        const deviation = (Math.random() - 0.5) * 30;
                        lastPilePosition = Math.max(10, Math.min(90, lastPilePosition + deviation));
                        const pileLeft = lastPilePosition;

                        // 计算堆积高度，使其形成自然的山形
                        const baseHeight = Math.sin((pileLeft - 50) * Math.PI / 180) * 20;
                        const pileHeight = Math.max(0, 20 - Math.abs(pileLeft - 50) / 2.5 + baseHeight);

                        const $pile = $(`<span style="position: absolute; left: ${pileLeft}%; bottom: ${pileHeight}px; font-size: ${pileSize}em; opacity: 0; transform: scale(0) translateZ(${Math.random() * 50}px); transition: all 0.3s ease-out;">${pileFlake}</span>`);
                        $('#snow-pile').append($pile);

                        setTimeout(() => {
                            $pile.css({
                                transform: `scale(1) translateZ(${Math.random() * 50}px) rotate(${Math.random() * 30 - 15}deg)`,
                                opacity: 0.85
                            });
                        }, 50);

                        pileCount++;
                    }

                    setTimeout(() => $snowflake.remove(), 500);
                }, fallDuration * 1000);
            }

            // 持续创建新雪花
            const snowInterval = setInterval(() => {
                if ($('#snow-container .snowflake').length < 100) {
                    createSnowflake();
                }
            }, 200);

            // 30 秒后停止动画并缓慢消失
            setTimeout(() => {
                clearInterval(snowInterval);
                // 让所有堆积的雪花缓慢消失
                $('#snow-pile span').each(function (i) {
                    const $pile = $(this);
                    setTimeout(() => {
                        $pile.css({
                            transition: 'all 0.5s ease-in',
                            opacity: 0,
                            transform: 'scale(0) translateY(10px)'
                        });
                    }, Math.random() * 2000);
                });
                // 让飘落的雪花消失
                $('#snow-container .snowflake').each(function (i) {
                    const $flake = $(this);
                    setTimeout(() => {
                        $flake.css({
                            transition: 'all 1s ease-in',
                            opacity: 0
                        });
                    }, Math.random() * 2000);
                });
                setTimeout(() => {
                    $('#snow-container').fadeOut(1000, function () {
                        $(this).remove();
                    });
                }, 2500);
            }, 30000);
        }
        return true;
    },
    dance(inTerminal) {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append('窗口开始跳舞啦! ♪(^∇^*)\n');
            const windows = $('.window:not(.min)');
            const danceSteps = [
                { transform: 'rotate(5deg) translateY(-10px)' },
                { transform: 'rotate(-5deg) translateY(0px)' },
                { transform: 'rotate(5deg) translateX(10px)' },
                { transform: 'rotate(-5deg) translateX(-10px)' },
                { transform: 'rotate(0deg) translate(0, 0)' }
            ];

            windows.each(function () {
                const win = $(this);
                let danceCount = 0;
                const danceInterval = setInterval(() => {
                    danceCount++;
                    win.css({
                        transition: 'transform 0.3s ease-in-out',
                        transform: danceSteps[danceCount % danceSteps.length].transform
                    });

                    // 跳舞 15 次后停止
                    if (danceCount >= 15) {
                        clearInterval(danceInterval);
                        win.css({
                            transition: 'transform 0.5s ease-out',
                            transform: 'none'
                        });
                    }
                }, 300);
            });
        }
        return true;
    },
    starwars(inTerminal) {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append('原力与你同在... ⚔️\n');

            // 创建星球大战容器
            const starWarsContainer = $('<div class="starwars-container" style="font-family: monospace; perspective: 400px; color: #ffd700; position: relative; height: 400px; overflow: hidden; background: #000;"></div>');
            $('#win-terminal>.text-cmd').append(starWarsContainer);

            // 添加星球大战文本
            const text = `
            Episode XII
            WIN12 STRIKES BACK

            在遥远的未来，一个充满
            科技的银河系中...

            Windows 操作系统已经
            进化到了第 12 代。

            然而，这个系统不仅仅
            是一个操作系统，它是
            一个充满原力的存在。

            此刻，一股神秘的力量
            正在你的电脑中觉醒...

            你，就是那个被选中的人，
            将带领这个系统走向新的
            纪元...

            愿原力与你同在！
            `;

            const crawl = $(`<div class="crawl" style="position: relative; top: 400px; transform-origin: 50% 100%; transform: rotateX(60deg); text-align: center; font-size: 24px; line-height: 1.5; white-space: pre-line; text-shadow: 0 0 10px #ffd700;"></div>`);
            crawl.html(text);
            starWarsContainer.append(crawl);

            // 添加动态背景星星
            for (let i = 0; i < 200; i++) {
                const size = Math.random() * 2 + 1;
                const speed = Math.random() * 3 + 1;
                const star = $(`<div class="star" style="position: absolute; width: ${size}px; height: ${size}px; background: #fff; left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation: twinkle ${speed}s infinite alternate;"></div>`);
                starWarsContainer.append(star);
            }

            // 添加 CSS 动画
            const style = $(`<style>
                @keyframes twinkle {
                    0% { opacity: 0.2; }
                    100% { opacity: 1; }
                }
                .star {
                    border-radius: 50%;
                    box-shadow: 0 0 3px #fff;
                }
                .crawl {
                    animation: crawl 30s linear;
                }
                @keyframes crawl {
                    0% { top: 400px; opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: -1000px; opacity: 0; }
                }
            </style>`);
            starWarsContainer.append(style);

            // 30 秒后清理
            setTimeout(() => {
                starWarsContainer.fadeOut(2000, function () {
                    $(this).remove();
                });
            }, 30000);
        }
        return true;
    }
};

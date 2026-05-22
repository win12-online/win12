//设置页面时间获取逻辑  @Junchen Yi  2023-9-17

// 抱歉，但这确实是多余的 qwq from stsc


// // 获取具有 class="settingTime"的元素
// const settingTimeElement = document.querySelector('.settingTime');

// // 更新时间函数
// function updateTime() {
//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = now.getMinutes().toString().padStart(2, '0'); // 补零
//     const seconds = now.getSeconds().toString().padStart(2, '0'); // 补零

//     let timeOfDay = '';

//     if (hours < 12) {
//         timeOfDay = '上午';
//     } else if (hours < 18) {
//         timeOfDay = '下午';
//     } else {
//         timeOfDay = '晚上';
//     }

//     // 将时间注入到 HTML 元素内
//     settingTimeElement.textContent = `${timeOfDay} ${hours}:${minutes}:${seconds}`;
// }

// // 初始加载时更新时间
// updateTime();

// // 每秒钟更新一次时间
// setInterval(updateTime, 1000);

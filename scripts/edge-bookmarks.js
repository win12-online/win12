/* Edge 收藏栏的 add_save()。原本是一段内联 <script>，藏在 desktop.html 的
 * Edge 窗口标记里（约 2334 行）。窗口标记要移入模板，而经由 insertAdjacentHTML
 * 注入的 <script> **不会执行**，所以必须先搬出来。
 *
 * 注意：函数体里的 t 是隐式全局（原文如此）。本文件刻意不加 'use strict'，
 * 以保持与原内联脚本完全一致的行为。
 */
function add_save(){
	t = document.getElementById('edge-path').value
	if(t.length>7){
		t = t.substring(0,7) + '...';
	}
          var className = 'save_' + Math.random().toString(36).substr(2);
	document.getElementById('save-bar').innerHTML += "<a class='save-item " + className + "' " + `oncontextmenu="return showcm(event,'save-bar', '${className}');"` + "  onclick='apps.edge.goto(`" + document.getElementById('edge-path').value +  "`)' win12_title='" + document.getElementById('edge-path').value + "' class='save-item'><i class='bi bi-file-earmark'></i>" + t + "</a>";
}

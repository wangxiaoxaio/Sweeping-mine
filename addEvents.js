var jms = null,timeHandle = null;
window.onload = function () {
	var radios = document.getElementsByName('level');
	for (let i=0;i<radios.length;i++) {
		radios[i].onclick = function () {
			if (jms){
				if (jms.landMineCount >0) {
					if (!confirm("确定结束当前游戏?")) {
						return false;
					}
				}
			}
			var value = this.value;
			init(value,value,value*value/5-value,value*value/5);
			document.getElementById('JMS_main').style.width=value*40+180+60+'px';
		}
	}
	init(10,10,10*10/5-10,10*10/5);
}

function init(rowCount,colCount,minLandMineCount,maxLandMineCount) {
	var doc = document,
		landMineCountElement = doc.getElementById('landMineCount'),
		timeShow = doc.getElementById("costTime"),
		beginButton = doc.getElementById("begin");
		closeButton = doc.getElementById("close");
		outPut = doc.getElementById('result');
		time = outPut.value.match(/\d+/i)[0];
		console.log(time);
	//重复选择难度按钮时
	if (jms != null) {
		clearInterval(timeHandle);
		timeShow.innerHTML = 0;
		landMineCountElement.innerHTML=0;
		
	}

	jms = new JMS('landmine',rowCount,colCount,minLandMineCount,maxLandMineCount);//将jms声明成全局变量

	jms.endCallBack = function() {
		clearInterval(timeHandle);
	};
	jms.landMineCallBack = function() {
		landMineCountElement.innerHTML = jms.landMineCount-jms.markLandMineCount;
	};
	//为"开始游戏"按钮绑定事件
	beginButton.onclick = function() {
		timeShow.innerHTML=0;
		jms.play();//初始化
		landMineCountElement.innerHTML=jms.landMineCount;//显示地雷个数
		jms.begin() //开始
		//更新花费的时间
		timeHandle = setInterval(function() {
			if (parseInt((new Date() - jms.beginTime)/1000) >time) {
				jms.failed();
			}
			timeShow.innerHTML = parseInt((new Date() - jms.beginTime)/1000);
		},1000);
	};
	closeButton.onclick = function() {
		if(jms) {
			jms.failed();	
		}
	}
}

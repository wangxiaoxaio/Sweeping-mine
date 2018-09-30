(function () {
	var JMS = function (id,rowCount,colCount,minLandMineCount,maxLandMineCount) {
		if (!(this instanceof JMS))
			return new JMS(id,rowCount,colCount,minLandMineCount,maxLandMineCount);
		this.doc = document;
		this.table = this.doc.getElementById(id);
		this.cells = this.table.getElementsByTagName('td');
		this.rowCount = rowCount || 10;
		this.colCount = colCount || 10;
		this.landMineCount = 0;
		this.markLandMineCount = 0;
		this.minLandMineCount = minLandMineCount || 10;
		this.maxLandMineCount = maxLandMineCount || 10;
		this.arrs = []; //格子对应的数组
		this.beginTime = null;
		this.endTime = null;
		this.currentStepCount = 0;
		this.endCallBack = null; //游戏结束时的回调函数
		this.landMineCallBack = null; //标记为地雷时更新剩余地雷个数的回调函数
		this.doc.oncontextmenu = function () {
			return false; //禁用右键菜单
		};
		this.drawMap();
	};
	JMS.prototype = {
		//画格子
		drawMap:function() {
			var tds = [];
			if (window.ActiveXobject && parseInt(navigator.userAgent.match(/msie ([\d.]+)/i)[1]) <8) {
				var css = '#JMS_main table td{background-color:#888;}',
				head = this.doc.getElementsByTagName('head')[0],
				style = this.doc.createElement("style");
				style.type = 'text/css';
				if (style.styleSheet) {
					style.styleSheet.cssText = css;
				}
				else {
					style.appendChild(this.doc.createTextNode(css));
				}
				head.appendChild(style);
			}
			for (let i=0;i<this.rowCount;i++) {
				tds.push('<tr>');
				for (let j=0;j<this.colCount;j++) {
					tds.push("<td id='m_"+i+"_"+j+"'></td>");
				}
				tds.push("</tr>");
			}
			this.setTableInnerHTML(this.table,tds.join(""));

		},
		setTableInnerHTML:function (table,html) {
			if (navigator && navigator.userAgent.match(/msie/i))
			{
				var temp = table.ownerDocument.createElement('div');
				temp.innerHTML = '<table></tbody>' + html + '</tbody></table>';
				if (table.tBodies.length == 0) {
					var tbody = document.createElement('tbody');
					table.appendChild(tbody);
				}
				table.replaceChild(temp.firstChild.firstChild,table.tBodies[0]);
				
			}
			else {
				table.innerHTML = html;
			}
		},
		//初始化，一是设置数组默认值为0，二是确定地雷个数
		init:function() {
			for (let i=0;i<this.rowCount;i++) {
				this.arrs[i] = [];
				for(let j=0;j<this.colCount;j++) {
					this.arrs[i][j] = 0;
				}
			}
			this.landMineCount = this.selectFrom(this.minLandMineCount,this.maxLandMineCount);
			this.markLandMineCount = 0;
			this.beginTime = null;
			this.endTime = null;
			this.currentStepCount = 0;
		},
		//把是地雷的数组项的值设置为9
		landMine:function() {
			var allCount = this.rowCount*this.colCount-1,
				tempArr = {}; 
			for(var i=0;i<this.landMineCount;i++) {
				var randomNum = this.selectFrom(0,allCount),
					rowCol = this.getRowCol(randomNum);
				if (randomNum in tempArr) {
					i--;
					continue;
				}
				this.arrs[rowCol.row][rowCol.col] = 9;
				tempArr[randomNum] = randomNum;
			}
		},
		//计算其他格子中的数字
		calculateNoLandMineCount: function () {
			for (let i=0;i<this.rowCount;i++) { 
				for (let j=0;j<this.colCount;j++) {
					if (this.arrs[i][j] == 9) 
						continue;
					if (i>0 && j>0) {
						if (this.arrs[i-1][j-1] == 9)
							this.arrs[i][j]++;
					}
					if (i>0 && j< this.colCount-1) {
						if(this.arrs[i-1][j+1] == 9) 
							this.arrs[i][j]++;
					}
					if(i>0) {
						if(this.arrs[i-1][j] == 9) {
							this.arrs[i][j]++;
						}
					}
					if (j>0) {
						if (this.arrs[i][j-1] == 9) {
							this.arrs[i][j]++;
						}
					}
					if (j<this.colCount-1) {
						if(this.arrs[i][j+1] ==9 ){
							this.arrs[i][j]++;
						}
					}
					if (i<this.rowCount-1 && j>0) {
						if (this.arrs[i+1][j-1] ==9 ){
							this.arrs[i][j]++;
						}
					}
					if(i<this.rowCount-1) {
						if(this.arrs[i+1][j] == 9) {
							this.arrs[i][j]++;
						}
					}
					if(i<this.rowCount-1 && j<this.colCount-1) {
						if (this.arrs[i+1][j+1] ==9)
							this.arrs[i][j]++;
					}
				}
			}
		},
		selectFrom:function(first,last) {
			var choice = last-first+1;
			return Math.floor(Math.random()*choice+first);
		},
		getRowCol:function(val) {
			return {
				row:parseInt(val / this.colCount),
				col:val % this.colCount
			};
		},
		$: function(id) {
			return this.doc.getElementById(id);
		},
		bindCells:function() {
			var self = this;
			for (let i=0;i<this.rowCount;i++) {
				for (let j=0;j<this.colCount;j++) {
					// (function(row,col){
						self.$("m_" + i + "_" + j).onmousedown = function (e) {
							e = e || window.event;
							var mouseNum = e.button;
							var className = this.className;
							if (mouseNum == 2) {
								if (className =='flag') {
									this.className="";
									self.markLandMineCount--;
								}
								else {
									this.className = 'flag';
									self.markLandMineCount++;
								}
								if (self.landMineCallBack) {
									self.landMineCallBack(self.landMineCount - self.markLandMineCount);
								}
							}
							else if (className != 'flag') {
								self.openBlock.call(self,this,i,j);
							}
						}

				}
			}
		},
		//展开无雷区域
		showNoLandMine:function (x,y) {
			for (let i=x-1;i<x+2;i++) {
				for (let j=y-1;j<y+2;j++) {
					if (!(i==x && j==y)) {
						var elem = this.$("m_"+i+"_"+j);
						if (elem && elem.className == "") {
							this.openBlock.call(this,elem,i,j);
						}
					}
				}
			}
		},
		//显示
		openBlock:function(obj,x,y) {
			if (this.arrs[x][y] != 9) {
				this.currentStepCount++;
				if (this.arrs[x][y] != 0) {
					obj.innerHTML = this.arrs[x][y];
				}
				obj.className="normal";
				if (this.currentStepCount +this.LandMineCount == this.rowCount*this.colCount) {
					this.success();
				}
				obj.onmousedown = null;
				if (this.arrs[x][y] ==0) {
					this.showNoLandMine.call(this,x,y);
				}
			}
			else {
				this.failed();
			}
		},
		//显示地雷
		showLandMine: function() {
			for (let i=0;i<this.rowCount;i++) {
				for (let j=0;j<this.colCount;j++) {
					if (this.arrs[i][j] == 9) {
						this.$("m_"+i+"_"+j).className = 'landMine';
					}
				}
			}
		},
		//显示所有格子信息
		showAll :function() {
			for (let i=0;i<this.rowCount;i++) {
				for (let j=0;j<this.colCount;j++) {
					if (this.arrs[i][j] == 9) {
						this.$("m_"+i+"_"+j).className = "landMine";
					}
					else {
						var elem = this.$("m_"+i+"_"+j);
						if(this.arrs[i][j] != 0) {
							elem.innerHTML = this.arrs[i][j];
						}
						elem.className = "normal";
					}
				}
			}
		},
		//清除显示的格子信息
		hideAll:function() {
			for (let i=0;i<this.rowCount;i++) {
				for (let j=0;j<this.colCount;j++) {
					var tdCell = this.$('m_'+i+"_"+j);
					tdCell.className = "";
					tdCell.innerHTML=""
				}
			}
		},
		//删除格子绑定的事件
		disableAll:function() {
			for (let i=0;i<this.rowCount;i++) {
				for (let j=0;j<this.colCount;j++) {
					var tdCell = this.$("m_"+i+"_"+j);
					tdCell.onmousedowm=null;
				}
			}
		},
		//游戏开始
		begin:function() {
			this.currentStepCount = 0;
			this.markLandMineCount = 0;
			this.beginTime = new Date();//游戏开始时间
			this.hideAll();
			this.bindCells();

		},
		//游戏结束
		end:function() {
			this.endTime = new Date();//游戏结束时间
			if (this.endCallBack) {
				this.endCallBack();
			}
		},
		//游戏成功
		success:function() {
			this.end();
			this.showAll();
			this.disableAll();
			alert("Congratulation!");
		},
		//游戏失败
		failed:function() {
			this.end();
			this.showAll();
			this.disableAll();
			alert("GAME OVER!");
		},
		//入口
		play:function() {
			this.init();  //设置数组的默认值为0，并且确定地雷的个数
			this.landMine(); //把地雷随机分布在地图中
			this.calculateNoLandMineCount(); //计算地图中其他格子的数字
		}
	};
	window.JMS = JMS; //将JMS暴露为全局变量
})()

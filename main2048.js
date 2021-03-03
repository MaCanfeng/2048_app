var board = new Array();
var score = 0;
var hasConflicted = new Array();

var startx = 0;
var starty = 0;
var endx = 0;
var endy = 0;

//游戏的初始化，等待响应
$(document).ready(function(){
	prepareForMobile();
	newgame();
});

function prepareForMobile(){

	//防止游戏界面过大
	if (documentWidth > 600) {
		gridContainerWidth  = 600;
		cellSpace = 24;
		cellSideLength = 120;
	}

	$('#grid-container').css('width',gridContainerWidth - 2 * cellSpace);
	$('#grid-container').css('height',gridContainerWidth - 2 * cellSpace);
	$('#grid-container').css('padding',cellSpace);
	$('#grid-container').css('border-radius',0.02 * gridContainerWidth);	//圆角属性

	$('.grid-cell').css('width',cellSideLength);
	$('.grid-cell').css('height',cellSideLength);
	$('.grid-cell').css('border-radius',0.02 * cellSideLength);
}

function newgame(){
	//初始化棋盘格
	init();
	//在随机两个格子生成数字
	generateOneNumber();
	generateOneNumber();

}

function init(){
	for (var i = 0; i < 4; i ++ ){
		for(var j = 0; j < 4; j ++ ){
			var gridCell = $("#grid-cell-" + i + "-" + j);
			gridCell.css('top',getPosTop(i,j));	//传入i和j的坐标值来计算gridCell相应的top值
			gridCell.css('left',getPosLeft(i,j));
		}
	}

	//转换为二维数组
	for(var i = 0; i < 4; i ++ ){
		board[i] = new Array();
		hasConflicted[i] = new Array();
		for(var j = 0; j < 4; j ++ ){
			board[i][j] = 0;
			hasConflicted[i][j] = false;
		}
	}

	updateBoardView();

	score = 0;

}

function updateBoardView(){
	//刷新所有格子的数字和格式
	$(".number-cell").remove();
	for(var i = 0; i < 4; i ++ ){
		for(var j = 0; j < 4; j ++ ){
			$("#grid-container").append('<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>');
			var theNumberCell = $('#number-cell-'+i+'-'+j);

			if (board[i][j] == 0) {
				theNumberCell.css('width','0px');	//数值为0则不显示
				theNumberCell.css('height','0px');
				theNumberCell.css('top',getPosTop(i,j) + cellSideLength/2);
				theNumberCell.css('left',getPosLeft(i,j) + cellSideLength/2);
			}
			else{
				theNumberCell.css('width',cellSideLength);
				theNumberCell.css('height',cellSideLength);
				theNumberCell.css('top',getPosTop(i,j));
				theNumberCell.css('left',getPosLeft(i,j));
				theNumberCell.css('background-color',getNumberBackGroundColor(board[i][j]));
				theNumberCell.css('color',getNumberColor(board[i][j]));
				theNumberCell.text(board[i][j]);
			}
			hasConflicted[i][j] = false;
		}
	}
	$(".number-cell").css('line-height',cellSideLength + 'px');
	$(".number-cell").css('font-size',0.6 * cellSideLength + 'px');
}

function generateOneNumber(){
	if (nospace(board)) {
		return false;
	}

	//随机一个位置
	var randx = parseInt(Math.floor(Math.random() * 4));
	var randy = parseInt(Math.floor(Math.random() * 4));

	var times = 0;
	while(times < 50){
		if (board[randx][randy] == 0) {
			break;
		}

		randx = parseInt(Math.floor(Math.random() * 4));
		randy = parseInt(Math.floor(Math.random() * 4));

		times ++;	//性能优化
	}	//若生成的位置已存在数字，则重新生成

	//达到次数上限后，搜索第一个0的位置来生成新数字
	if (times == 50) {
		for(var i = 0; i < 4; i ++){
			for(var j  = 0; j < 4; j ++){
				if (board[i][j] == 0) {
					randx = i;
					randy = j;
				}
			}
		}
	}

	//随机一个数字
	var randNumber = Math.random() < 0.5? 2 : 4;

	//在随机位置显示随机数字
	board[randx][randy] = randNumber;
	showNumberWithAnimation(randx,randy,randNumber);

	return true;
}

//有按键输入时进行响应
$(document).keydown(function (event){
	switch(event.keyCode){
		case 37: //left
			if(moveLeft()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			};
			break;
		case 38: //up
			if(moveUp()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			};
			break;
		case 39: //right
			if(moveRight()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			};
			break;
		case 40: //down
			if(moveDown()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			};
			break;
		default: //default
			break;
	}
});

document.addEventListener('touchstart',function(event){
	//手指划动的起始位置
	startx = event.touches[0].pageX;
	starty = event.touches[0].pageY;
});

document.addEventListener('touchmove',function(event){
	event.preventDefault();	//消除BUG
});

document.addEventListener('touchend',function(event){
	//手指划动的结束位置
	endx = event.changedTouches[0].pageX;
	endy = event.changedTouches[0].pageY;

	var deltax = endx - startx;
	var deltay = endy - starty;

	//对过小的划动或点击不响应
	if (Math.abs(deltax) < 0.2 * documentWidth && Math.abs(deltay) < 0.2 * documentWidth) {
		return;	//后续代码不再运行
	}

	//触摸在x轴方向上进行
	if (Math.abs(deltax) >= Math.abs(deltay)) {
		if (deltax > 0) {
			//move right
			if(moveRight()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			}
		}else{
			//move left
			if(moveLeft()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			}
		}
	}
	//触摸在y轴方向上进行(向下为y轴正方向)
	else{
		if (deltay > 0) {
			//move down
			if(moveDown()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			}
		}else{
			//move up
			if(moveUp()){
				setTimeout("generateOneNumber()",110);
				setTimeout("isgameover()",200);
			}
		}
	}
});

function isgameover(){
	if (nospace(board) && nomove(board)) {
		gameover();
	}
}

function gameover(){
	alert("Game Over!");
}

function moveLeft(){

	if (!canMoveLeft(board)) {
		return false;
	}

	//moveLeft
	for(var i = 0; i < 4; i ++){
		for(var j  = 1; j < 4; j ++){	//第一列无法左移
			if (board[i][j] != 0) {
				for (var k = 0; k < j; k++) {
					if (board[i][k] == 0 && noBlockHorizontal(i,k,j,board)) {
						//move
						showMoveAnimation(i,j,i,k);
						board[i][k] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if(board[i][k] == board[i][j] && noBlockHorizontal(i,k,j,board) && !hasConflicted[i][k]){
						//move
						showMoveAnimation(i,j,i,k);
						//add
						board[i][k] += board[i][j];
						board[i][j] = 0;
						//add score
						score += board[i][k];
						updateScore(score);

						hasConflicted[i][k] = true;

						continue;
					}
				}
			}
		}
	}

	setTimeout("updateBoardView()",100);	//对整体数据进行刷新
	return true;
}

function moveRight(){

	if (!canMoveRight(board)) {
		return false;
	}

	//moveRight
	for(var i = 0; i < 4; i ++){
		for(var j  = 2; j >= 0; j --){
			if (board[i][j] != 0) {
				for (var k = 3; k > j; k--) {
					if (board[i][k] == 0 && noBlockHorizontal(i,j,k,board)) {
						//move
						showMoveAnimation(i,j,i,k);
						board[i][k] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if(board[i][k] == board[i][j] && noBlockHorizontal(i,j,k,board) && !hasConflicted[i][k]){
						//move
						showMoveAnimation(i,j,i,k);
						//add
						board[i][k] += board[i][j];
						board[i][j] = 0;
						//add score
						score += board[i][k];
						updateScore(score);

						hasConflicted[i][k] = true;

						continue;
					}
				}
			}
		}
	}

	setTimeout("updateBoardView()",100);	//对整体数据进行刷新
	return true;
}
function moveUp(){

	if (!canMoveUp(board)) {
		return false;
	}

	//moveUp
	for(var i = 1; i < 4; i ++){
		for(var j  = 0; j < 4; j ++){
			if (board[i][j] != 0) {
				for (var k = 0; k < i; k++) {
					if (board[k][j] == 0 && noBlockVertical(j,i,k,board)) {
						//move
						showMoveAnimation(i,j,k,j);
						board[k][j] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if(board[k][j] == board[i][j] && noBlockVertical(j,i,k,board) && !hasConflicted[k][j]){
						//move
						showMoveAnimation(i,j,k,j);
						//add
						board[k][j] += board[i][j];
						board[i][j] = 0;
						//add score
						score += board[k][j];
						updateScore(score);

						hasConflicted[k][j] = true;

						continue;
					}
				}
			}
		}
	}

	setTimeout("updateBoardView()",100);	//对整体数据进行刷新
	return true;
}
function moveDown(){

	if (!canMoveDown(board)) {
		return false;
	}

	//moveDown
	for(var i = 2; i >= 0; i --){
		for(var j  = 0; j < 4; j ++){
			if (board[i][j] != 0) {
				for (var k = 3; k > i; k--) {
					if (board[k][j] == 0 && noBlockVertical(j,i,k,board)) {
						//move
						showMoveAnimation(i,j,k,j);
						board[k][j] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if(board[k][j] == board[i][j] && noBlockVertical(j,i,k,board) && !hasConflicted[k][j]){
						//move
						showMoveAnimation(i,j,k,j);
						//add
						board[k][j] += board[i][j];
						board[i][j] = 0;
						//add score
						score += board[k][j];
						updateScore(score);

						hasConflicted[k][j] = true;

						continue;
					}
				}
			}
		}
	}

	setTimeout("updateBoardView()",100);	//对整体数据进行刷新
	return true;
}
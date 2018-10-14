
/**
 * @param label
 *            这元素
 * @param superior
 *            这个元素的父级(值的是 j_label 这个对象) 可以未null
 * @param jsons
 *            这个元素的取值范围
 */
function j_template(junjie){
	var label=junjie.LABEL;
	// ---> 取值域
	var field=junjie.JSONS;
	// ---> 改变属性值
	var attr=j.getattr_eval(label,"j-attr");
	// ---> 
	if(attr){
		//---> 是否优先处理
		if(attr.first===true){
			j.attr(label,attr,field);
			j.domain(label,field);
		}else{
			j.domain(label,field);
			j.attr(label,attr,field);
		}
	}else{
		j.domain(label,field);
	}
	// ---> 文本值 设置文本值 
	j.text(label,field);
	// ---> value值
	j.value(label,field);
	// ---> 设置时间
	j.timeStamp(label,field);
	// ---> 设置路径
	j.href(label,field);
	// ---> 设置src 资源路径
	j.src(label,field);
	// ---> 数字
	j.number(label,field);
	// ---> 数组
	j.arrays(label,field);
	// ---> 集合
	j.map(label,field);
	// ---> 下拉选择
	j.select(label,field);
	// ---> 提示
	j.title(label,field);
	// ---> 递归
	j.recursion(label,field);
	// ---> 循环
	j.loop(label,field);
}
/**
 * 工具 
 */
var j={
	container:new Array(),
	containerMap:{},
	/**
	 * 添加元素
	 */
	put:function(key,value){
		key=new String(key).toString();
		if(isE(containerMap[key])){
			container[containerMap[key]]=value;
		}else{
			containerMap[key]=container.length;
			container.push(value);
		}
	},
	get:function(key){
		var i=containerMap[key];
		if(isE(i)){
			return null;
		}
		return container[i];
	},
	/**
	 * 资源不可用路径
	 */
	src_404:"",
	/** 路径参数 */
	getUP:function(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = decodeURIComponent(window.location.search.substr(1)).match(reg);
	     if(r!=null)return  unescape(r[2]); return null;
	},
	/**
	 * 一个选择器ID 的
	 */
	id:function(id){
		return window.document.getElementById(id);
	},
	/**
	 * 若值不可用则返回true<br> "" --> true null --> true undefined --> true .length=0
	 * --> true " " --> false other --> false
	 * 
	 * @param value
	 */
	 isE:function(value){
		if(value== null || value=="" || value.length==0 || typeof value =="undefined"||value==="undefined"){
			return true;
		}
		return false;
	},
	/**
	 * @see j.isE 取反
	 */
	_isE:function(value){
		return !j.isE(value);
	},
	/**
	 * 要么都为真,要么都为假 -> _isE()
	 */
	isEE:function(){
		var truth =arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			if(truth===(!isE(arguments[i]))){
				continue;
			}
			return false;
		}
		return true;
	},
	/**
	 * 获取元素的属性
	 * 
	 * @param label
	 *            元素,这是 document 对象
	 * @param arguments
	 *            键值集
	 * @return 返回键值 有value 值的第一个属性
	 */
	getattr:function(){
		var value="";
		for (var i = 1; i < arguments.length; i++) {
			value=arguments[0].getAttribute(arguments[i]);
			if(j.isE(value)){
				continue;
			}
			return value;
		}
	},
	getattr_eval:function(){
		return eval("("+getattr(arguments)+")");
	},
	/**
	 * @param label 标签
	 */
	src404:function(label){  
		// ---> 有没有默认的地址?
		if(j._isE(j.src_404)){
			label.src=j.src_404;
		}
		// ---> 移除 error 处理事件
		label.setAttribute("onerror",j.getattr(label,"onerror").replace('j.src404(this);', ''));
	},
	/**
	 * 数字格式化 
	 * @param  num 数字
	 * @param format{
	 * 	retain:保留几位;
	 *  rounding:舍入,这是指定位数来舍入,大于就进位;
	 *  hexadecimal: 显示进制 Number.toString(hexadecimal);
	 *  scm:科学计数法,若为二进制那么这个就无效,
	 *  interval:显示格式 
	 *  fill:位数不够0填充				
	 *  栗子>>>
	 *  保留3位,4舍4+1入,->v以16进制显示 |以科学计数法显示
	 *  				 |
	 *  				 ->	interval: 每隔4个加上一个 ' '(空格), 			
	 *  j.number("12355.55666"|12355.55666,{retain:3,rounding:4,hexadecimal:16|scm:true,interval:[4,' '],fill:0});
	 *  栗子 print>>> : 3043.8e978d4fe
	 * }
	 * @return 返回指定个数的数字 "字符串"
	 */
	number_format:function(num,format){
		//是否为整数?
		var int_flo=Math.round(new Number(num).valueOf()) === new Number(num).valueOf();
		num=new Number(num).toString();
		var timeNum;
		var len=num.length;
		var index=num.indexOf(".");
		//---> 舍入和保留
		if(j._isE(format.retain)&&j._isE(format.rounding)||(format.natural===true)){
			if(format.natural){
				//---> 整数保留
				timeNum=parseInt(new Number(num)/Math.pow(10,format.retain))
			}else if(int_flo===false){
				//---> 小数
				timeNum=num.slice(0,index)+"."+num.substr(index+1,format.retain);
			}else{
				timeNum=num;
			}
			//---> 是否满足进位
			if(num.substr(timeNum.length,1)>format.rounding){
				timeNum=new Number(timeNum)+new Number(int_flo?1:Math.pow(10,-format.retain));
				timeNum=timeNum.toString();
			}
		}else if(j._isE(format.retain)&&int_flo==false){
				//---> 小数保留
				timeNum=num.slice(0,index)+"."+num.substr(index+1,format.retain);
		}else if(j._isE(format.rounding)){
			if(num.substr(num.length-1,1)>format.rounding){
				timeNum=new Number(num)+new Number(int_flo?1:Math.pow(10,-format.retain));
				timeNum=timeNum.toString();
			}
		}else {
			timeNum=num;
		}
		if(format.hexadecimal){
			//---> 进制
			timeNum=new Number(timeNum).toString(format.hexadecimal);
		}else if(format.scm===true){
			//---> 科学计数法
			var p = Math.floor(Math.log(timeNum)/Math.LN10);
			timeNum=(timeNum * Math.pow(10, -p))+'e' + p;
		}
		//---> 填充
		if(format.fill&&int_flo===false){
			var f=(timeNum.split(".")[1]+"").toString().length;
			while (f<format.rounding) {
				f++;
				timeNum+="0";
			}
		}
		//---> 格式化
		if(format.interval&& (typeof format.scm !="undefined")){
			var str = timeNum;
			num ="";
			while (str.length > format.interval[0]) {
				num+=str.slice(0,format.interval[0])+format.interval[1];
				str=str.slice(format.interval[0],str.length);
			}
			num+=str;
			timeNum=num;
		}
		return timeNum;
	},
	/**
	 * 设置文本值
	 * @param label 标签
	 * @param field 取值域
	 */
	text:function(){
		var t=getattr(arguments[0],"j-t","j-text","j-k","j-key");
		if(t)arguments[0].innerText=arguments[1][t];
	},
	/**
	 * 设置标签的value值
	 * @param label 标签
	 * @param field 取值域
	 */
	value:function(label,field){
		var v=getattr(label,"j-v","j-value","name");
		if(v){
			switch (label.tagname) {
			case "INPUT":
				//---> 处理按钮类型
				break;
			default:
				label.innerText=field[v];
				break;
			}
		}
	},
	/**
	 * 设置标签文本值的时间 
	 */
	timeStamp:function(){
		//--> 时间戳 j-time-stamp->{time:kye,format:{时间格式}}
		var t=getattr_eval(arguments[0],"j-t-s","j-time-stamp");
		if(t){
			arguments[0].innerText=new Date(arguments[1][t.time]).format(_isE(j.format)?j.format:"yyyy-MM-dd hh:mm:ss");
		}
	},
	/**
	 * 设置超链接
	 */
	href:function(){
		//--> 超链接 j-href->{href:路径键值,top:路径默认的顶部,para:{路径名:取值键值}} ;para 可以使用数组 ["键值","键值"]
		var h=getattr_eval(arguments[0],"j-h","j-href");
		if(h){
			var _href="";
			if(h.top)_href+=h.top;
			if(h.href)_href+=arguments[1][h.href];
			if(h.para){
				//--->判断路径是否已经有过参数? 若没有则加上问号
				if(_href.indexOf()==-1)_href+="?";
				//---> 什么类型
				if(h.para.length){
					//-->数组
				}else if(h.para.length!==0){
					//-->map
				}
			}
		}
		arguments[0].href=_href;
	},
	/**
	 * 设置资源路径
	 */
	src:function(){
		//--> src路径 {buffer:(默认图片地址),top:"默认头部",src:路径kye,suffix:资源后缀'png|.png',format:资源格式"[500*600]"}
		var s=getattr_eval(arguments[0],"j-s","j-src");
		if(s){
			var _src="";
			if(s.top)_src+=s.top;
			if(s.src)_src+=arguments[1][s.src];	
			var last=_src.lastIndexOf(".");
			if(s.format){
				//--> 是否已经有后缀了
				if(last==-1){
					_src+=s.format;
				}else{
					_src=(_src.slice(0,last))+s.format+(_src.slice(last,_src.length));
				}
			}
			if(s.suffix){
				if(last==-1){
					//--> 没有后缀,
					_src+=s.suffix;
				}else {
					_src=_src.slice(0,last)+s.suffix;
				}
			}
			//--->是否有过懒加载
			if(s.lazyload===true){
				arguments[0].setAttribute("j-lazyload",_src);
			}
			//--->缓存压缩图
			if(s.buffer){
				arguments[0].onload=function(){
					if(!(s.lazyload===true)){
						arguments[0].src=_src;
					}
				};
				arguments[0].src=s.buffer;
			}else if(!(s.lazyload===true)){
				arguments[0].src=_src;
			}
		}
	},
	/**
	 * 设置数字
	 */
	number:function(){
		var n=getattr_eval(label,"j-n","j-number");
		//--> 数字 {number:key,format:{retain,rounding,hexadecimal,scm,interval,fill}}
		if(n){
			var num=arguments[1][n.number];
			if(n.format)num=number_format(num,n.format);
			arguments[0].innerText=num;
		}
	},
	/**
	 * 数组
	 */
	arrays:function(){
		//--> 数组 {arr:['数组','数组'],i:(数组下标)key}
		var a=j.getattr_eval(arguments[0],"j-arr");
		if(a&&_isE(a.arr)&&_isE(a.i)){
			arguments[0].innerText=a.arr[arguments[1][a.i]];
		}
	},
	/**
	 * 键值对
	 */
	map:function(){
		//--> 集合 {map:{k:v,k:v},k:key}
		var m=j.getattr_eval(arguments[0],"j-k-v-p","j-key-value-pair");
		if(isEE(true,m,m.map,m.k)){
			arguments[0].innerText=m.map[arguments[1][m.k]];
		}
	},
	/**
	 * 下拉选择
	 */
	select:function(){
		//--> 下拉选择 {select:key,type:map|kv,def(默认选择):d,empty(是否清空):true}
		var s=j.getattr_eval(arguments[0],"j-select");
		if(isEE(true,s,s.select)){
			if(s.empty){
				arguments[0].innerHtml="";
			}
			var options=arguments[1][s.select];
			if(s.type){
				if(s.type=="map"){
					for (var i = 0; i < options.length; i++) {
						var option=document.createElement("option");
						option.innerText=options[i][s.text];
						option.setAttribute("value",options[i][s.value]);
						arguments[0].appendChild(option);
					}
				}else if(s.type=="kv"){
					for (var op in options) {
						var option=document.createElement("option");
						option.innerText=options[op];
						option.setAttribute("value",op);
						arguments[0].appendChild(option);
					}
				}
			}
			//--->选择默认值
			if(s.def){
				var options=arguments[0].children;
				for (var i = 0; i < options.length; i++) {
					if(options.value==s.def){
						options.setAttribute("selected","selected");
						break;
					}
				}
			}
		}
	},
	
	/**
	 * 提示
	 */
	title:function(){
		var t=getattr(label,"j.title");
		if(t)arguments[0].title=arguments[1][t];
	},
	/**
	 * 设置html 值
	 */
	thml:function(){
		//--> 这个替换HTML,直接替换不会进行保留
		var h=getattr(arguments[0],"j-thml");
		if(h){
			var div=document.createElement("div").innerHtml=arguments[1][h];
			document[0].innerHtml=div.innerHtml;
		}
	},
	/**
	 * 循环,这个是重量级的
	 */
	loop:function(){
		//--> 循环 {for:key,mould:(循环模型)在数据模板中的键,empty:(清空)true,class:[i,"className",i++,"className"]}
		var l=getattr_eval(label,"j-f","j-for","j-loop");
		if(isEE(l,l["for"],l.mould)){
			// ---> 限制取值的范围
			var range=document[1][l["for"]];
			if(isE(range)){
				console.warn("en:json Unavailable , Please check the correct key ["+l["for"]+"]. ch: json数据不可用,请检查取值["+l["for"]+"]")
			}
			//---> 获取模型
			var rendering;
			{
				rendering=get(l.mould)
				if(rendering==null){
					rendering=id(l.mould);
				}
			}
			if(isE(rendering)){
				console.warn("en: Can't find ["+l.mould+"]mould \t ch: 找不到["+l.mould+"]这模型");
			}else{
				var timeElement;
				for (var i = 0; i < range.length; i++) {
					timeElement=rendering.cloneNode(true);
					new j_template({LABEL:timeElement,SUPERIOR:document[0],JSONS:range[i]});
					document[0].appendChild(timeElement);
				}
			}
		}
	},
	/**
	 * 递归一级孩子
	 */
	recursion:function(){
		var subset=document[0].children;
		if(!isE(subset)){
			for (var i = 0; i < subset.length; i++) {
				new j_template({LABEL:subset[i],SUPERIOR:document[0],JSONS:document[1]});
			}
		}
	},
	/**
	 * 限制json 取值域
	 */
	domain:function(){
		//--> j-var 改变原有的json 取值 
		var j=j.getattr(document[0],"j-json");
		if(j)document[1]=document[1][j];
	},
	attr:function(label,a,field){
		// ---> 属性 {first:false,attrs:[{label:id,attr:name,arr:{index:k,value:key,split:"?"},map:{key:name,value:v}},{~}]}
		if(a.attrs){
			for (var i = 0; i < a.attrs.length; i++) {
				var _attr  = a.attrs[i];
				// 修改元素
				var element;
				if(_attr.arr.label){
					element=get(_attr.arr.label);
					if(element==null){
						element=id(_attr.arr.label);
					}
					if(isE(element)){
						element=label;
					}
				}else{
					element=label;
				}
				var _newArr;
				if(_attr.arr){
					//---> 全部替换
					_newArr=field[_attr.arr.value];
					if(_attr.arr.index==-1){
						if(_attr.arr.split){
							_newArr=_newArr.split(_attr.arr.split);
						}
					}else{
						var _arr=eval("("+element.getAttribute(_attr.attr)+")");
						_arr[_attr.arr.index]=_newArr;
						_newArr=_arr.toString();
					}
				}else if(_attr.map){
					//--->获取属性并执行
					var _map=eval("("+element.getAttribute(_attr.attr)+")");
					_map[_attr.map.key]=field[_attr.map.value];
					_newArr=JSON.stringify(map);
				}
				element.setAttribute(_attr.attr,_newArr);
			}
		}
	}
};

/**
 * 时间格式化
 * 
 * @param fmt
 *            你期待格式
 */
Date.prototype.format = function(fmt) {
	var o = {
		"M+" : this.getMonth() + 1, // --->月份
		"d+" : this.getDate(), 		// --->日
		"h+" : this.getHours(), 	// --->时
		"m+" : this.getMinutes(), 	// --->分
		"s+" : this.getSeconds(), 	// --->秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), // --->季度
		"S" : this.getMilliseconds() // --->毫秒值
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}
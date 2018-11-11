/**
 * junjie = {element:label,field:json,empty:{tv:true,attr:false}}
 * element :节点元素
 * field   :json 值
 * empty   : {
 *	tv  :是否清除 元素以前的值
 *	attr:是否清除节点属性的值 
 * 			}
 * new j_template({element:?,field:?,empty:{tv:false,attr:false}});
 * 
 */
function j_template(junjie){
	var label=junjie.element;
	// ---> 取值域
	var field=junjie.field;
	var i=0;
	var empty=junjie.empty;
	try {
		if(j.getattr(label,"j-exit")===""){
			 return;
		}
		j.empty(junjie,label);
		//需要移除的属性
		var RemoveAttribute=new Array();
		for (i=0; i < label.attributes.length; i++) {
			var value=label.attributes[i].value;
			if(!j._undefined(value)){
				continue;
			}
			switch (label.attributes[i].name) {
				case "j-attr":j.attr(label,field,value);break;
				case "j-json":j.domain(label,field);break;
	            case "j-t":
	            case "j-text":
	            case "j-k":
	            case "j-key":j.emptytv(label,junjie.empty);j.text(label,field[value]);break;
	            case "j-v":
	            case "j-value":
	            case "name":j.emptytv(label,junjie.empty);j.value(label,field[value]);break;	
	            case "j-name":j.valueName(label,field[value],value);break;
	            case "j-t-s":  
	            case "j-time-stamp":j.emptytv(label,junjie.empty);j.timeStamp(label,field,value);break;
	            case "j-h":
	            case "j-href":j.href(label,field,value);break;
	            case "j-s":
	            case "j-src":j.src(label,field,value);break;
	            case "j-n":
	            case "j-number":j.emptytv(label,junjie.empty);j.number(label,field,value);break;
	            case "j-arr":j.arrays(label,field,value);break;
	            case "j-k-v-p":
	            case "j-map":
	            case "j-key-value-pair":j.map(label,field,value);break;
	            case "j-select":j.select(label,field,value);break;
	            case "j-title":j.title(label,field[value]);break;
	            case "j-thml":j.thml(label,field[value]);break;
	            case "j-switch":j.switchCase(label,field[value]);break;
	            case "j-attr-add":j.attrAdd(label,value,field);break;
	            case "j-attrs":j.attrSArr(label,value,field);break;
	            case "j-if":j.equal(label,value,field);break;
	            case "j-f":
	            case "j-for":
	            case "j-loop":
	            	j.loop(label,field,value);junjie.empty=empty;return;
	            case "j-case":
	            case "j-model":
	            	break;
	            default:
	            	continue;
		    }
			RemoveAttribute.push(label.attributes[i].name);
		}
		if(junjie.empty&&junjie.empty.attr===true){
			for (var k = 0; k < RemoveAttribute.length; k++) {
				j.removeJAttr(label,RemoveAttribute[k]);
			}
		}
		// ---> 放到最后,若是循环,他是不会执行以后的操作的
		j.recursion(label,junjie);
	} catch (e) {
		console.error(label);
		console.error(i);
		console.error(label.attributes[i]);
		console.error("en:Rendering error ;Automatically skips errors and continues to process backwards. zh:渲染错误;自动跳过错误继续向后处理 ;E->");
		console.error(e);
	}
	junjie.empty=empty;
}
/**
 * 工具
 */
var j={
	/** 模板容器 */
	container:new Array(),
	/** 容器坐标 */
	containerMap:{},
	/**
	 * 添加元素,并存放到集合中
	 * 
	 */
	put:function(key,value,del){
		if(typeof(value)=="string"){
			var div=document.createElement("div");
			div.innerHTML=value;
			value=div;
		}
		key=new String(key).toString();
		// --> 存在则替换
		if(del===true){
			value.removeAttribute("id");
		}
		if(typeof (j.containerMap[key]) != 'number'){
			// -->加入
			j.containerMap[key]=j.container.length;
			j.container.push(value.cloneNode(true));
		}else{
			j.container[j.containerMap[key]]=value.cloneNode(true);
		}
		if(del===true){
			value.parentNode.removeChild(value);    
		}
	},
	/**
	 * 提供给用户单独存放 非节点对象
	 */
	putObject:function(obj){
		if(obj){
			key=new String(obj.key).toString();
			// --> 存在则替换
			if(typeof (j.containerMap[obj.key]) != 'number'){
				// -->加入
				j.containerMap[key]=j.container.length;
				j.container.push(obj.value);
			}else{
				j.container[j.containerMap[obj.key]]=obj.value;
			}
		}
	},
	/**
	 * 添加一个是属性
	 */
	attrAdd:function(){
		var s=eval("("+arguments[1]+")");
		if(j.isEE(true,s.name,arguments[2][s.key])){
			arguments[0].setAttribute(s.name,arguments[2][s.key]);
		}
	},
	/**
	 * 键值对 {属性名:json域的key }
	 * [属性名和json域的key 一致]
	 * 不支持混淆
	 * 这是为了 比较多属性二使用,改属性值支持一级,不支持复杂的 数组,或者map,
	 * 
	 */
	attrSArr:function(label,value,field){
		var attrs=eval("("+value+")");
		//---> 是数组还是键值对
		if(attrs instanceof Array){
			//--> 数组
			for (var i = 0; i < attrs.length; i++) {
				if(j._undefined(field[attrs[i]])&&j._undefined(attrs[i])){
					label.setAttribute(attrs[i],field[attrs[i]]);
				}
			}
		}else if(attrs){
			//-->键值对
			for ( var key in attrs) {
				if(j._undefined(field[attrs[key]])&&j._undefined(key)){
					label.setAttribute(key,field[attrs[key]]);
				}
			}
		}
		/*
		 * 混淆代码
		for (var i = 0; i < attrs.length; i++) {
			if(typeof(attrs[i])=="string"){
				attrName=attrs[i];
				attrValue=field[attrs[i]];
			}
			else if(typeof(attrs[i])=="object"){
				attrName=attrs[i].name;
				attrValue=field[attrs[i].key];
			}
			else{
				continue;
			}
			if(j._undefined(attrValue)&&j._undefined(attrName)){
				label.setAttribute(attrName,attrValue);
			}
		}*/
	},
	get:function(key){
		var i=j.containerMap[key];
		if(typeof(i)!= 'number'){
			return null;
		}
		return j.container[i];
	},
	getClone:function(key,is){
		if(!j._undefined(is)){
			is=true;
		}
		if(j.get(key)==null){
			console.warn("容器中没有 ["+key+"]对应的数据");
			return null;
		}
		return j.get(key).cloneNode(is);
	},
	/**
	 * 扫描
	 */
	scanning:function(_j_templates){
		if(_j_templates){
			var model=j.getattr_eval(_j_templates,"j-model");
			if(model){
				j.put(model.model,_j_templates,model.del);
			}else{
				var childrens=_j_templates.children;
				var len=childrens.length;
				for (var i = 0; i < childrens.length;) {
					j.scanning(childrens[i]);
					if(len!=childrens.length){
						len--;
					}else{
						i++;
					}
				}
			}
		}
	},
	/**
	 * 资源不可用路径
	 */
	src_404:"",
	/**
	 * 是否移除属性
	 */
	purgeAttribute:true,
	removeJAttr:function(label,name){
		if(j.purgeAttribute===true){
			if(name.slice(0, 2) === "j-"){
				label.removeAttribute(name);
			}
		}
	},
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
		if(value !=null && typeof (value) =="object"){
			return false;
		}
		if(value== null ||  value=="" || value.length==0 || typeof value =="undefined"||value==="undefined"){
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
			if(truth===(!j.isE(arguments[i]))){
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
		for (var i = 1; i < arguments.length; i++) {
			value=arguments[0].getAttribute(arguments[i]);
			if(j.isE(value)){
				continue;
			}
			return eval("("+value+")");
		}
	},
	/**
	 * @param label
	 *            标签
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
	 * 
	 * @param num
	 *            数字
	 * @param format{
	 *            retain:保留几位; rounding:舍入,这是指定位数来舍入,大于就进位; hexadecimal: 显示进制
	 *            Number.toString(hexadecimal); scm:科学计数法,若为二进制那么这个就无效,
	 *            interval:显示格式 fill:位数不够0填充 栗子>>> 保留3位,4舍4+1入,->v以16进制显示
	 *            |以科学计数法显示 | -> interval: 每隔4个加上一个 ' '(空格),
	 *            j.number("12355.55666"|12355.55666,{retain:3,rounding:4,hexadecimal:16|scm:true,interval:[4,'
	 *            '],fill:0}); 栗子 print>>> : 3043.8e978d4fe }
	 * @return 返回指定个数的数字 "字符串"
	 */
	number_format:function(num,format){
		// 是否为整数?
		var int_flo=Math.round(new Number(num).valueOf()) === new Number(num).valueOf();
		num=new Number(num).toString();
		var timeNum;
		var len=num.length;
		var index=num.indexOf(".");
		// ---> 舍入和保留
		if(j._isE(format.retain)&&j._isE(format.rounding)||(format.natural===true)){
			if(format.natural){
				// ---> 整数保留
				timeNum=parseInt(new Number(num)/Math.pow(10,format.retain))
			}else if(int_flo===false){
				// ---> 小数
				timeNum=num.slice(0,index)+"."+num.substr(index+1,format.retain);
			}else{
				timeNum=num;
			}
			// ---> 是否满足进位
			if(num.substr(timeNum.length,1)>format.rounding){
				timeNum=new Number(timeNum)+new Number(int_flo?1:Math.pow(10,-format.retain));
				timeNum=timeNum.toString();
			}
		}else if(j._isE(format.retain)&&int_flo==false){
				// ---> 小数保留
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
			// ---> 进制
			timeNum=new Number(timeNum).toString(format.hexadecimal);
		}else if(format.scm===true){
			// ---> 科学计数法
			var p = Math.floor(Math.log(timeNum)/Math.LN10);
			timeNum=(timeNum * Math.pow(10, -p))+'e' + p;
		}
		// ---> 填充
		if(format.fill&&int_flo===false){
			var f=(timeNum.split(".")[1]+"").toString().length;
			while (f<format.rounding) {
				f++;
				timeNum+="0";
			}
		}
		// ---> 格式化
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
	 * {tv:true,attr:false}
	 * tv  :是否清除 文本值和value 值,
	 * attr:是否清除 j标签的所有属性值,
	 * 不会影响父级的指定,没有就按照父级的指令进行,
	 * 是互补的关系,没有就继承父元素的
	 */
	empty:function(junjie,label){
		var e=j.getattr_eval(label,"j-empty");
		if(e){
			if(!j._undefined(junjie.empty)){
				junjie.empty=e;
			}else{
				if(j._undefined(e.tv)){
					junjie.empty.tv=e.tv;
				}
				if(j._undefined(e.attr)){
					junjie.empty.attr=e.attr;
				}
			}
		}
	},
	emptytv:function(label,empty){
		if(j._undefined(empty)){
			if(empty.tv===true){
				var b=label.childNodes;
				for(var i=0; i<b.length;i++){
				    if(b[i].nodeName == "#text" && !/\s/.test(b.nodeValue)){
				    	label.removeChild(b[i]);
				    }
				}
			}
		}
	},
	//设置name值
	valueName:function(label,value,name){
		//-->覆盖以前的
		label.setAttribute("name",name);
		j.value(label,value);
	},
	/**
	 * 设置文本值
	 * 
	 * @param label
	 *            标签
	 * @param field
	 *            取值域
	 */
	text:function(){
		if(j._undefined(arguments[1]))arguments[0].innerText=arguments[1];
	},
	/**
	 * 只有结果为 false 是 才会删除
	 */
	equal:function(label,value,field){
		var i=eval("("+value+")");
		if(i){
			var value=field[i.key];
			var del=value;
			if(i.eq){
				//--> 先比较 == ,若不一致,在 域中取值比较
				if(i.eq==value||value==field[i.eq]){del=true;}
				else {del=false;}
			}
			if(i.re===true){
				if(del===true||del=="true"){del=false;}
				else if(del===false||del=="false"){del=true;}
				else if(del){del=!del;}
			}
			if(del===false||del=="false"){
				label.parentNode.removeChild(label);
			}
		}
	},
	/**
	 * 非 未定义
	 */
	_undefined:function(v){
		return typeof(v)!="undefined" && v != "undefined";
	},
	/**
	 * 设置标签的value值
	 * 
	 * @param label
	 *            标签
	 * @param field
	 *            取值域
	 */
	value:function(){
		if(j._undefined(arguments[1])){
			switch (arguments[0].tagName) {
			case "INPUT":
				switch (arguments[0].type) {
				case "text":
				case "butt":
				case "image":
					arguments[0].setAttribute("value",arguments[1]);
				break;
				case "checkbox":
					if(!arguments[1]){
						arguments[0].removeAttribute("checked");
					}else{arguments[0].setAttribute("checked","checked");}
				break;
				
				default:
					break;
				}
				break;
			case "BUTTON":
				arguments[0].value=arguments[1];
				break;
			default:
				arguments[0].innerText=arguments[1];
			break;
			}
		}
	},
	/**
	 * 设置标签文本值的时间
	 */
	timeStamp:function(){
		// --> 时间戳 j-time-stamp->{time:kye,format:{时间格式},today:{???}}
		var t=eval("("+arguments[2]+")");
		if(j.isEE(true,t,arguments[1][t.time])){
			arguments[0].innerText=j.theNearFuture(arguments[1][t.time],t);
		}
	},
	/**
	 * @param timeStamp
	 *            时间戳
	 * @param 显示的格式
	 *            {time:kye,format:{时间格式}, second:需要检测时间间隔(在多少秒直接), lately:{
	 *            today:表示今天的字 tomorrow:表示明天的字 yesterday:表示昨天的字 thisMonth:表示今月的字
	 *            thisYear:表示今年的字 now:表示(现在|刚刚)的字 minute:表示分钟的字 hour:表示小时的字
	 *            day:表示日期的单位 zh:(天) month:表示月的词 year:表示年的词 front:在这个时间之前的字
	 *            behind:在这个时间之后的字 am:表示午前的字 pm:表示午后的字 A: 语气词 ,zh:的
	 *            branch:分,不是分钟 time:时,不是小时 } } 有一些变量未使用,可能会在不久后使用
	 */
	theNearFuture:function(timeStamp,t){
		var nowTime=new Date();  
		var when=new Date(timeStamp);
		var time_difference=nowTime.getTime()-when.getTime();
		if(( typeof(t.lately) !="undefined")&&(time_difference<0?(-time_difference)/1000:time_difference/1000)<=((!t.second)?(2*24*60*60):(t.second))){
			var today,tomorrow,yesterday,thisMonth,thisYear;// 今天,明天,昨天,本月,今年
			var now,minute,hour,branch,time;// 现在,分钟,小时,分,时
			var day,month,year;// 天,月,年
			var front,behind;// 前面,后面
			var am,pm;// 上午,下午
			var A;
			if(t.lately===true){
				// -->国际化,获取html5 上的语言标记,请遵从w3c 的 lang 网页的语言 规定,这需要我们一起完成
				var lang=j.getattr(window.document.getElementsByTagName("html")[0],"lang");
				switch (lang) {
				case "zh":
					t.lately={today:"今天",tomorrow:"明天",yesterday:"昨天",thisMonth:"本月",thisYear:"今年",now:"刚刚",minute:"分钟",hour:"小时",day:"天",month:"月",year:"年",front:"前",behind:"后",am:"上午",pm:"下午",A:"的",time:"点",branch:"分"};
					break;
				default:
					// ---> 这是作者用翻译制成的,若你的语言结构很好,那么请麻烦你更改一下这些单词
					t.lately={today:"today",tomorrow:"tomorrow",yesterday:"yesterday",thisMonth:"thisMonth",thisYear:"thisYear",now:"now",minute:"minute",hour:"hour",day:"day",month:"month",year:"year",front:"front",behind:"behind",am:"AM",pm:"PM",A:" a ",time:"time",branch:"branch"};
					break;
				}
			}
			{
				{
					today=t.lately.today;
					tomorrow=t.lately.tomorrow;
					yesterday=t.lately.yesterday;
					thisYear=t.lately.thisYear;
					thisMonth=t.lately.thisMonth;
				}
				{
					now=t.lately.now;
					minute=t.lately.minute;
					hour=t.lately.hour;
					branch=t.lately.branch;
					time=t.lately.time;
				}
				{
					day=t.lately.day;
					month=t.lately.month;
					year=t.lately.year;
				}
				{
					front=t.lately.front;
					behind=t.lately.behind;
				}
				{
					am=t.lately.am;
					pm=t.lately.pm;
				}
				{
					A=t.lately.A;
				}
			}
			// -->那天 -上下 午 -多久 前后
			var thatDay,ampm ,howLong,around;
			
			if(time_difference>=0){
				if(time_difference<=60000){
					return now;
				}
				else{
					around=front;
				}
			}
			else{
				around=behind;
				time_difference=-time_difference;
			}
			// 上午还是下午
			ampm=(when.getHours()>12?pm:am)+(when.getHours()>12?when.getHours()-12:when.getHours())+time+when.getMinutes()+branch;
			// ---> 年?
			if(nowTime.getFullYear()!=when.getFullYear()){
				// --> 不是同一年
				return front+year+A+(when.getMonth()+1)+month+when.getDate()+day+ampm;
			}
			else if(nowTime.getMonth()!=when.getMonth()) {
				// -->当前的月大于指定时间的月
				return thisYear+(when.getMonth()+1) +A+ when.getDate()+day+ampm;
			}
			else if(nowTime.getDate()!=when.getDate()){
				// --->是否是昨天和明天
				var _day=nowTime.getDate()-when.getDate();
				if(_day==1||_day==-1){
					return (_day==1?yesterday:tomorrow)+ampm;
				}
				// -->本月
				return (_day<0?-_day:_day)+day+A+around+ampm;
			}
			else {
				// -->今天
				if(time_difference<=4*3600*1000){
					// --->4小时内
					var _timeDate=new Date(time_difference)
					if(time_difference<60*60*1000){
						// ---> 59分钟内
						return _timeDate.getMinutes()+minute+around;
					}
					// --> +-3
					var _timeDate=new Date(time_difference)
					return (_timeDate.getUTCHours())+hour+_timeDate.getMinutes()+minute+around;
				}else{
					return today+ampm;
				}
			}
		}
		return new Date(timeStamp).format(j._isE(t.format)?t.format:"yyyy-MM-dd hh:mm:ss");
	},
	/**
	 * 设置超链接
	 * {top:'?',href:'?',para:{name:'key'},defPara:'?'}
	 * top:开头的地址
	 * href:主要的中间内容
	 * para:参数,键值对,已key 做为参数的name,value 做为json 中的取值key
	 * defPara:默认加上的参数,不能包含? 号
	 */
	href:function(){
		// --> 超链接 j-href->{href:路径键值,top:路径默认的顶部,para:{路径名:取值键值}} ;para 可以使用数组
		// ["键值","键值"]
		var h=eval("("+arguments[2]+")");
		if(h){
			var _href="";
			//--->默认值
			if(h.top)_href+=h.top;
			if(h.href){
				//--> 中间数据,若中间数据指定了,但不可用则抛出异常
				var _h=arguments[1][h.href];
				if(_h){
					_href+=_h;
				}else{
					throw "没有在 json数据中找到 ["+h.href+"] 的value值";
				}
			}
			//-->是否有参数
			if(h.para){
				if(_href.indexOf('?')==-1)_href+="?";// --->判断路径是否已经有过参数? 若没有则加上问号
				//是否为数组
				var _para ="";
				var v="";
				if(h.para instanceof Array){
					for (var i = 0; i < h.para.length;i++) {
						v=arguments[1][h.para[i]];
						if(v){
							_para+=(h.para+"="+v+"&");	
						}
					}
				}else{
					for (var key in h.para) {
						v=arguments[1][h.para[key]];
						if(v){
							_para+=(key+"="+v+"&");
						}
					}
				}
				//--> 问号是否在最后,或者有& 符号
				if(_para.length){
					if(_href.lastIndexOf("?")==_href.length-1){
			            _href+=_para.slice(0,_para.length-1);
			          }else if(_href.lastIndexOf("&")==_href.length-1){
			            _href+=_para.slice(0,_para.length-1);
			          }else{
			            _href+="&"+_para.slice(0,_para.length-1);
			         }
				}
			}
			if(h.defPara){
				_href+=(_href.charAt(_href.length-1)=="&")?h.defPara:"&"+h.defPara;
			}
		}
		arguments[0].href=_href;
	},
	/**
	 * 设置资源路径 {buffer:(压缩图地址),top:(http/s
	 * 开头的地址),src:(资源路径的key值),suffix:(图片后缀),format:(图像格式),lazyload:(是否启动懒加载,j-lazyload)}
	 */
	src:function(){
		// --> src路径
		// {buffer:(默认图片地址),top:"默认头部",src:路径kye,suffix:资源后缀'png|.png',format:资源格式"[500*600]"}
		var s=eval("("+arguments[2]+")")
		if(s){
			var _src="";
			if(s.top)_src+=s.top;
			if(s.src)_src+=arguments[1][s.src];	
			var last=_src.lastIndexOf(".");
			if(s.format){
				// --> 是否已经有后缀了
				if(last==-1){
					_src+=s.format;
				}else{
					_src=(_src.slice(0,last))+s.format+(_src.slice(last,_src.length));
				}
			}
			if(s.suffix){
				if(last==-1){
					// --> 没有后缀,
					_src+=s.suffix;
				}else {
					_src=_src.slice(0,last)+s.suffix;
				}
			}
			// --->是否有过懒加载
			if(s.lazyload===true){
				arguments[0].setAttribute("j-lazyload",_src);
			}
			// --->缓存压缩图
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
		var n=eval("("+arguments[2]+")")
		// --> 数字
		// {number:key,format:{retain,rounding,hexadecimal,scm,interval,fill}}
		if(n){
			var num=arguments[1][n.number];
			if(n.format)num=number_format(num,n.format);
			if(!num)num=0;
			arguments[0].innerText=num;
		}
	},
	/**
	 * 数组
	 */
	arrays:function(){
		// --> 数组 {arr:['数组','数组'],i:(数组下标)key}
		var a=eval("("+arguments[2]+")")
		if(a&&j._isE(a.arr)&&j._isE(a.i)){
			arguments[0].innerText=a.arr[arguments[1][a.i]];
		}
	},
	/**
	 * 键值对
	 */
	map:function(){
		// --> 集合 {map:{k:v,k:v},k:key}
		var m=eval("("+arguments[2]+")");
		if(j.isEE(true,m,m.map,m.k)){
			arguments[0].innerText=m.map[arguments[1][m.k]];
		}
	},
	/**
	 * 下拉选择
	 */
	select:function(){
		// --> 下拉选择 {select:key,type:map|kv,def(默认选择):d,empty(是否清空):true}
		var s=eval("("+arguments[2]+")");
		if(j.isEE(true,s,s.select)){
			if(s.empty){
				arguments[0].innerHTML="";
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
			// --->选择默认值
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
		if(j._undefined(arguments[1]))arguments[0].title=arguments[1];
	},
	/**
	 * 设置html 值 这个替换HTML,直接替换不会进行保留
	 */
	thml:function(){
		if(j._undefined(arguments[1])){
			var div=document.createElement("div").innerHTML=arguments[1];
			arguments[0].innerHTML=div.innerHTML;
		}
	},
	/**
	 * 循环,这个是重量级的
	 */
	loop:function(){
		// --> 循环
		// {for:key,mould:(循环模型)在数据模板中的键,empty:(清空)true,class:[i,"className",i++,"className"]}
		var l=eval("("+arguments[2]+")");
		if(l){
			// ---> 限制取值的范围
			var range;
			if(l["for"]){
				range=arguments[1][l["for"]];
			}else{
				range=arguments[1];
			}
			if(j.isE(range)){
				console.warn("en:json Unavailable , Please check the correct key ["+l["for"]+"]. zh: json数据不可用,请检查取值["+l["for"]+"]")
				return;
			}
			if(l.empty===true){
				arguments[0].innerHTML="";
			}
			// ---> 获取模型
			var rendering;
			var subset=false;
			{
				rendering=j.get(l.mould)
				if(rendering==null){
					rendering=j.id(l.mould);
				}
				if(range instanceof Array && range.length==0){
					return;
				}
				if(rendering==null){
					rendering=j.get(j.auxiliaryLoop(range,l.mould,0));
					subset=true;
				}
			}
			if(j.isE(rendering)){
				console.warn("en: Can't find ["+l.mould+"]mould \t zh: 找不到["+l.mould+"]这模型");
			}else{
				var timeElement;
				var CyclicValue;
				for (var i = 0; i < range.length; ) {
					timeElement=rendering.cloneNode(true);
					if(range[i] instanceof Set){
						CyclicValue=range[i].get(0);
					}else{
						CyclicValue=range[i];
					}
					new j_template({element:timeElement,field:CyclicValue,empty:{valeu:true,attr:true}});
					arguments[0].appendChild(timeElement);
					if(++i< range.length&&subset===true){
						rendering=j.get(j.auxiliaryLoop(range,l.mould,i));
					}
				}
			}
		}
	},
	auxiliaryLoop:function(field,key,index){
		var val="";
		if(key.indexOf(',')!=-1){
			var arr=key.split(',');
			for (var a = 0; a < arr.length; a++) {
				val+=field[index][arr[a]];
			}
		}else{return field[index][key];}
		return val;
	},
	/**
	 * 递归一级孩子
	 */
	recursion:function(label,junjie){
		var subset=label.children;
		if(!j.isE(subset)){
			var length=subset.length;
			for (var i = 0; i < length; i++) {
				new j_template({element:subset[i],field:junjie.field,empty:junjie.empty});
				while (length>subset.length) {
					i--;
					length--;
				}
			}
		}
	},
	/**
	 * 限制json 取值域
	 */
	domain:function(){
		// --> j-var 改变原有的json 取值
		var j=j.getattr(arguments[0],"j-json");
		if(j)arguments[1]=arguments[1][j];
	},
	/**
	 * 
	 */
	switchCase:function(label,value){
		var _cases=label.children;
		var retain=new Array();
		for (var i = 0; i < _cases.length; i++) {
			var _cas=j.getattr_eval(_cases[i],"j-c","j-case");
			if(_cas){
				// -> 相等,或者是默认值
				if(value==_cas["case"]||(_cas["default"]===true)){
					retain.push(_cases[i]);
					// ->是否继续循环
					if(_cas["break"]){
						continue;
					}
					break;
				}
			}
		}
		label.innerHTML = "";
		for (var i = 0; i < retain.length; i++) {
			label.appendChild(retain[i]);
		}
	},
	/**
	 * {attrs:[{attrName:'',type:'arr|map|attr',format:{attrK:''}}]}
	 * attrs : 数组
	 * {
	 * 	attrName: 本标签的那个属性?
	 * 	type:标签值存放的事什么类型
	 * 	format:解析格式
	 * 	{
	 * 	  type:arr
	 * 		key:在json中取值替换的key
	 * 		i: 替换那个值, 若为负数则是全部替换
	 * 		split: 若key值是否需要拆分为数组
	 * 	  type:map (只支持单个或者一起替换)
	 * 		key:从json取值的数据
	 * 		replace:需要替换那个键的value值,若是未定义或者为null,则是全部替换
	 * 	  type:attr
	 * 		key:从json取值的key
	 * 	}
	 * }
	 * 
	 */
	attr:function(label,field,value){
		var a=eval("("+value+")");
		// ---> 属性
		if(a.attrs){
			//element.setAttribute(_attr.name,_newArr);
			//---> 判断是什么?
			var attrValue;
			var _attr;
			for (var i = 0; i < a.attrs.length; i++) {
				_attr=a.attrs[i];
				switch (a.attrs[i].type) {
				case "arr":
					//--> 从json 中获取value 值
					var arr=field[_attr.format.key];
					//--> 哪一个下标
					if(_attr.format.i>-1){
						//-->以前的数据
						var _arr=j.getattr_eval(label,_attr.attrName);
						_arr[_attr.format.i]=arr;
						attrValue=_arr.toString();
					}
					else if(_attr.format.split){
						attrValue=arr.split(_attr.format.split);
					}
					else{
						attrValue=arr;
					}
					break;
				case "map":
					// --->获取属性并执行
					var _map=j.getattr_eval(label,_attr.attrName);
					_map[_attr.format.key]=field[_attr.format.replace];
					attrValue=JSON.stringify(_map);
					break;
				case "attr":
					attrValue=field[_attr.format.key];
					break;
				}
				if(j._undefined(attrValue)){
					label.setAttribute(_attr.attrName,attrValue);
				}
			}
		}
	},
	template:function(label,jsonData){
		j.scanning(j.id("j_models"));
		new j_template({element:label,field:jsonData,empty:{tv:false,attr:false}});
	},
	oneTemplate:function(label,jsonData){
		new j_template({element:label,field:jsonData,empty:{tv:false,attr:false}});
	},
	
};

/**
 * 时间格式化
 * 
 * @param fmt
 *            你期待格式
 */
if(typeof Date.prototype.format != 'function'){
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
}

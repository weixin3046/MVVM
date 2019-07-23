class Compile{
	constructor(el,vm) {
		this.el = this.isElementNode(el)?el:document.querySelector(el);//querySelector() 方法返回文档中匹配指定 CSS 选择器的一个元素。
		this.vm = vm; //实列 this
		if(this.el) {
			//如果有el才开始编译
			//1. 先把真实的DOM移入到内存中 fragment
			let fragment = this.node2fragment(this.el);
			//2. 提取想要的元素节点v-model和文本节点{{}}
			this.compile(fragment);
			//把编译好的fragment在赛会到页面里去
			this.el.appendChild(fragment);
		}
	}
	/*专门写一些辅助的方法*/
	// nodeType 属性返回以数字值返回指定节点的节点类型。

	// 如果节点是元素节点，则 nodeType 属性将返回 1。

	// 如果节点是属性节点，则 nodeType 属性将返回 2
	isElementNode(node) {
		return node.nodeType === 1;
	}
	//判断是不是指令
	isDirective(name) {
		return name.includes('v-');
	}
	// 核心方法
	compieElement(node) {
		let attrs = node.attributes;//获取当前节点的属性 v-
		Array.from(attrs).forEach(attr=>{ //Array.from()方法就是将一个类数组对象或者可遍历对象转换成一个真正的数组。
			let attrName = attr.name
			if(this.isDirective(attrName)) {
				let expr = attr.value;
				// let type = attrName.slice(2);
				let [,type] = attrName.split('-');//结构赋值
				CompileUtil[type](node, this.vm, expr);
			}
		})

	}
	compileText(node) {
		let expr = node.textContent; //取文本中的内容
		let reg = /\{\{([^}]+)\}\}/g;
		if(reg.test(expr)){
			CompileUtil['text'](node, this.vm, expr)
		}
	}
	
	compile(fragment) {
		let childNodes = fragment.childNodes;
		Array.from(childNodes).forEach(node=>{
			if(this.isElementNode(node)){
				// 元素节点
				this.compieElement(node);
				this.compile(node);
			}else{
				//文本节点
				this.compileText(node);
			}
		});
	}
	node2fragment(el) { //需要把所有的元素放到内存中
		let fragment = document.createDocumentFragment();//创建一个新的空白的文档片段
		let firstChild;
		while (firstChild = el.firstChild){
			fragment.appendChild(firstChild); //appendChild() 方法可向节点的子节点列表的末尾添加新的子节点。如果文档树中已经存在了 firstChild，它将从文档树中删除，然后重新插入它的新位置。
		}
		return fragment;//内存中的节点
	}
}
CompileUtil = {
	getVal(vm, expr) {//获取实例上对应的数据
		expr = expr.split('.');
		return expr.reduce((prev, next) =>{//reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
			return prev[next];
		}, vm.$data);
	},
	getTextVal(vm, expr) {//获取编译文本后的结果
		return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
			return this.getVal(vm, arguments[1]);
		})
	},
	text(node, vm, expr) {//文本处理
		let uptateFn = this.undater['textUptater'];

		let value = this.getTextVal(vm, expr);

		expr.replace(/\{\{([^}]+)\}\}/g,(...arguments) => {
			new Watcher(vm, arguments[1], (newValue)=>{
				//如果数据变化了 文本节点需要重新获取依赖的属性更新文本中的内容；
				uptateFn && uptateFn(node, this.getTextVal(vm, expr));
			});
		})
		uptateFn && uptateFn(node, value)
	},
	setVal(vm, expr, value) {
		expr = expr.split('.');
		//收敛
		return expr.reduce((prev, next, currentIndex)=> {
			if(currentIndex === expr.length-1){
				return prev[next] = value;
			}
			return prev[next];
		}, vm.$data)
	},
	model(node, vm, expr) {//输入框处理
		let uptateFn = this.undater['modelUptater'];
		new Watcher(vm, expr, (newValue)=>{
			//当值变化后会调用cb 将新的值传递过来（）
			uptateFn && uptateFn(node, this.getVal(vm, expr));
		})
		node.addEventListener('input',(e)=>{
			let newValue = e.target.value;
			this.setVal(vm, expr, newValue)
		})
		uptateFn && uptateFn(node, this.getVal(vm, expr));
	},
	undater: {
		//文本更新
		textUptater(node, value) {
			node.textContent = value;
		},
		//输入框更新
		modelUptater(node, value) {
			node.value = value;
		}
	}
}






//观察者
class Watcher{
	constructor(vm, expr, cb){
		this.vm = vm;
		this.expr = expr;
		this.cb = cb;
		//先获取一下老的值
		this.value = this.get();
	}
	getVal(vm, expr) {//获取实例上对应的数据
		expr = expr.split('.');
		return expr.reduce((prev, next) =>{//reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
			return prev[next];
		}, vm.$data);
	}
	get() {
		Dep.target = this;
		let value = this.getVal(this.vm, this.expr);
		Dep.target = null;
		return value;
	}
	//对外暴露的方法
	update() {
		let newValue = this.getVal(this.vm, this.expr);
		let oldValue = this.value;
		if(newValue != oldValue) {
			this.cb(newValue);
		}

	}
}

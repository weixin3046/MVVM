class Observer{
	constructor(data) {
		this.observer(data);
	}
	observer(data) {

		if(!data || typeof data !=='object') {
			return;
		}

		Object.keys(data).forEach(key=>{
			//劫持
			this.defineReactive(data,key,data[key]);
			this.observer(data[key]);//深度递归劫持
		})
	}
	//定义响应式
	defineReactive(obj, key, value) {
		//在获取数据的时候，想弹个框
		let that = this;
		let dep = new Dep();//每个变化的数据 都会对应一个数组，这个数组是存放所有更新的操作
		Object.defineProperty(obj, key, {
			enumerable: true,//是否能在for-in循环中遍历出来或在Object.keys中列举出来
			configurable: true,//如果为false删除目标属性或修改属性的行为将被无效化
			get() {
				Dep.target && dep.addSub(Dep.target);
				return value;
			},
			set(newValue) {//判断新值和老值是否一样
				if(newValue != value) {
					that.observer(newValue);//如果是对象继续劫持
					value = newValue;
					dep.notify();//通知所有人数据已经更新
				}
			}
		})
	}
}
class Dep{
	constructor() {
		//订阅的数组
		this.subs = [];
	}
	addSub(watcher) {
		this.subs.push(watcher);
	}
	notify() {
		console.log(this.subs)
		this.subs.forEach(watcher=>watcher.update());
	}
}
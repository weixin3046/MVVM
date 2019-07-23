class MVVM{
	constructor(options) {
		//先把可用的东西挂载在实例上
		this.$el = options.el;
		this.$data = options.data;

		//如果有要编译的模板我就开始编译
		if(this.$el) {
			//数据劫持，把对象所有属性 改成get和set方法；
			new Observer(this.$data);
			this.proxyData(this.$data);
			//用数据和元素进行编译
			new Compile(this.$el, this)
		}
	}
	proxyData(data) {//代理
		Object.keys(data).forEach((key)=>{
			Object.defineProperty(this,key, {
				get() {
					return data[key]
				},
				set(newValue) {
					data[key] == newValue
				}
			})
		})
	}
}
// Object.defineProperty(obj, prop, desc)
// obj 需要定义属性的当前对象
// prop 当前需要定义的属性名
// desc 属性描述符
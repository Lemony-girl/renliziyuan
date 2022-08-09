// 发布/订阅者模式
class EventBus {
  // 事件池
  listeners=[]
  $on(eventName, cb) {
    this.listeners.push({
      eventName, cb
    })
  }
  $emit(eventName, ...args) {
    this.listeners.forEach(item => {
      if (item.eventName === eventName) {
        item.cb(...args)
      }
    })
    console.log(this.listeners)
  }
}
export const eventBus = new EventBus()

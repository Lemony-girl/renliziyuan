// 定义自定义指令
// 解决图片报错问题
export const imgError = {
  inserted(el, options) { // el：指令所绑定的dom元素，可以用来直接操作
    // console.log(el)
    // console.log(options)
    el.onerror = function() {
      el.src = options.value
    }
  }
}

//
export const focus = {
  inserted: function(el) { // 当被绑定的元素插入到DOM中时
    el.focus() // 聚焦元素
  }
}

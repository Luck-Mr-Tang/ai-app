// @ts-ignore
export default (
    function () {
        if (!window) return {}
        // 消息前缀, 建议使用自己的项目名, 避免多项目之间的冲突
        // !注意 消息前缀应使用字符串类型
        const prefix = 'koolearn',
            supportPostMessage = 'postMessage' in window
        let lastHash = document.location.hash
        let intervalId: any
        let cacheId = 1
        const extend = function () {
            // eslint-disable-next-line prefer-rest-params
            const args = arguments,
                o = args[0],
                len = args.length
            let curr
            for (let j = 1; j < len; j++) {
                curr = args[j]
                for (const i in curr) {
                    Object.keys(curr).includes(i) && (o[i] = curr[i])
                }
            }
            return o
        }

        /**
         * [Target description]
         * @param {object} target Target 类, 消息对象
         * @param {string} name   名字,iframe的id
         * @param {string} prefix 前缀
         */
        function Target(this: any, target, name, prefix) {
            let errMsg = ''
            if (arguments.length < 2) {
                errMsg = 'target error - target and name are both required'
            } else if (typeof target != 'object') {
                errMsg = 'target error - target itself must be window object'
            } else if (typeof name != 'string') {
                errMsg = 'target error - target name must be string type'
            }
            if (errMsg) {
                throw new Error(errMsg)
            }

            this.target = target
            this.name = name
            this.prefix = prefix
        }

        /**
         * 消息拼接
         * @param  {[string]} msg
         * @return {[string]}
         */
        Target.prototype.handleMsg = function (msg) {
            //prefix|name__Messenger__msg
            return this.prefix + '|' + this.name + '__Messenger__' + msg
        }

        /**
         * 往 target 发送消息, 出于安全考虑, 发送消息会带上前缀
         * @type {[type]}
         */
        Target.prototype.send = supportPostMessage
            ? // IE8+ 以及现代浏览器支持
              function (msg) {
                  // @ts-expect-error
                  this.target.postMessage(this.handleMsg(msg), '*')
              }
            : // 兼容IE 6/7
              function (msg, targetUrl) {
                  // @ts-expect-error
                  targetUrl = (targetUrl || this.target.location || parent.location.href) + ''
                  //修改hash
                  // @ts-expect-error
                  this.target.location =
                      // @ts-expect-error
                      targetUrl.replace(/#.*$/, '') + '#' + +new Date() + cacheId++ + '&' + this.handleMsg(msg)
              }

        /**
         * 默认配置项，目前就一个
         * @type {Object}
         */
        const defaultOpts = {
            delay: 200
        }

        // 信使类
        // 创建Messenger实例时指定, 必须指定Messenger的名字, (可选)指定项目名, 以避免Mashup类应用中的冲突
        // !注意: 父子页面中projectName必须保持一致, 否则无法匹配
        function Messenger(messengerName, projectName) {
            // @ts-expect-error
            this.targets = {} as any
            // @ts-expect-error
            this.name = messengerName
            // @ts-expect-error
            this.listenFunc = []
            // @ts-expect-error
            this.prefix = projectName || prefix
            // @ts-expect-error
            this.opts = extend({}, defaultOpts)
            // @ts-expect-error
            this.initListen()
        }

        /**
         * set opts
         * @param {object} opts
         */
        Messenger.prototype.setOpts = function (opts) {
            // @ts-ignore
            this.opts = extend(this.opts, opts || {})
        }

        /**
         * 添加一个消息对象
         * @param {object} target
         * @param {string} name
         */
        Messenger.prototype.addTarget = function (target, name) {
            this.targets[name] = new Target(target, name, this.prefix)
        }

        /**
         * 移除一个消息对象
         * @param  {string} name
         * @return {}
         */
        Messenger.prototype.removeTarget = function (name) {
            delete this.targets[name]
        }

        /**
         * 初始化消息监听
         * @return {null}
         */
        Messenger.prototype.initListen = function () {
            const self = this
            /**
             * [generalCallback description]
             * @param  {string} msg prefix|name__Messenger__msg
             * @return {[type]}     [description]
             */
            const generalCallback = function (msg: any) {
                if (typeof msg == 'object' && msg.data) {
                    msg = msg.data
                }
                if (typeof msg !== 'string') return
                const msgPairs = msg.split('__Messenger__')
                const _msg = msgPairs[1]
                const pairs = msgPairs[0].split('|')
                const prefix = pairs[0]
                const name = pairs[1]

                if (prefix + name !== self.prefix + self.name) {
                    console.warn('error ')
                    return
                }

                for (let i = 0, len = self.listenFunc.length; i < len; i++) {
                    self.listenFunc[i](_msg)
                }
            }

            //高级浏览器
            if (supportPostMessage) {
                if ('addEventListener' in document) {
                    window.addEventListener('message', generalCallback, false)
                } else if ('attachEvent' in document) {
                    // @ts-ignore
                    window.attachEvent('onmessage', generalCallback)
                }
                return
            }

            // 兼容IE 6/7
            intervalId && clearInterval(intervalId)
            intervalId = null
            intervalId = setInterval(function () {
                const hash = document.location.hash,
                    re = /^#?\d+&/
                if (hash !== lastHash && re.test(hash)) {
                    lastHash = hash
                    generalCallback(hash.replace(re, ''))
                }
            }, self.opts.delay)
        }

        /**
         * 监听消息
         * @param  {Function} callback
         * @return {[type]}
         */
        Messenger.prototype.listen = function (callback) {
            let i = 0
            const len = this.listenFunc.length
            let cbIsExist = false
            for (; i < len; i++) {
                if (this.listenFunc[i] == callback) {
                    cbIsExist = true
                    break
                }
            }
            if (!cbIsExist) {
                this.listenFunc.push(callback)
            }
        }

        /**
         * 注销监听
         * @return {[type]} [description]
         */
        Messenger.prototype.clear = function () {
            this.listenFunc.length = 0
        }

        /**
         * 广播消息,给所有的消息对象发送消息
         * @param  {[type]} msg [description]
         * @return {[type]}     [description]
         */
        //低版本浏览器要求提供url 这里不行
        Messenger.prototype.send = function (msg) {
            const targets = this.targets
            let target: any
            for (target in targets) {
                if (Object.keys(targets).includes(target)) {
                    targets[target].send(msg)
                }
            }
        }
        return Messenger
    } as any
)()

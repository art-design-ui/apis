import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  ApisMap,
  ServerMap,
  ApisInstance,
  ApisConfig,
  ResolvedFn,
  RejectedFn,
  Middleware,
  Rest
} from './types'

class Apis {
  base: string
  serverMap: ServerMap
  apiMap: ApisMap
  instance: ApisInstance
  axiosInstance: AxiosInstance
  static reqMiddleware: Middleware[] = []
  static resMiddleware: Middleware[] = []
  constructor(serverMap: ServerMap, apiMap: ApisMap, common?: AxiosRequestConfig) {
    /**
     * 支持公共配置
     */
    this.axiosInstance = axios.create(common)
    this.serverMap = serverMap
    this.apiMap = apiMap
    this.instance = {}
    this.base = this.getDefault()
    this.formatConfigUrl()
    this.middleware()
    this.combine2Request()
  }
  /**
   * 获取默认的配置
   */
  getDefault(): string {
    let base = ''
    for (const key of Object.keys(this.serverMap)) {
      /**
       * 找到默认的配置值
       */
      if (this.serverMap[key].default) {
        base = key
      }
    }
    if (!base) {
      console.error('apis: 找不到默认服务器配置')
    }
    return base
  }

  /**
   * 给个请求
   * 配置正确的baseURL
   * 如果没有baseURL就读默认的
   */
  formatConfigUrl(): void {
    for (const key of Object.keys(this.apiMap)) {
      const item = this.apiMap[key]
      if (!item.server) {
        item.server = this.base
      }
      this.apiMap[key] = { ...this.serverMap[item.server], ...item }
    }
  }
  middleware() {
    /**
     * 加入传了undefined axios内部会做这种边界处理的
     */
    Apis.reqMiddleware.map((middleware: Middleware) => {
      return this.axiosInstance.interceptors.request.use(
        middleware.onFulfilled,
        middleware.onRejected
      )
    })

    Apis.resMiddleware.map((middleware: Middleware) => {
      return this.axiosInstance.interceptors.response.use(
        middleware.onFulfilled,
        middleware.onRejected
      )
    })
  }

  /**
   * 替换restful请求中的url
   */
  restful(url: string, rest: Rest): string {
    /**
     * [xyz]一个字符集合。匹配方括号中的任意字符
     * 比如正则表达式是[abcd]==>匹配brisket"中的‘b’
     */
    const regex = /\:[^/]*/g
    /**
     * 一个用来创建新子字符串的函数，该函数的返回值将替换掉第一个参数匹配到的结果。参考下面的指定一个函数作为参数。
     * 另外要注意的是，如果第一个参数是正则表达式，并且其为全局匹配模式，那么这个方法将被多次调用，每次匹配都会被调用。
     * 匹配模式是这样的\:[^/]* 为一个整体 全局g下多次匹配 也就是多次调用fn
     * [^/]匹配得到的是一个字符 只要匹配的url出现的一个字符在 [^/]中出现就匹配成功 但是是单个的 所以要多次匹配
     */

    return url.replace(regex, p => {
      console.log(p)
      /**
       * :id ===>返回id
       */
      const key = p.slice(1)
      if (rest[key]) {
        return rest[key]
      }
      return p
    })
  }
  /**
   * config1来自于apis文件的基本配置信息
   * config2来自于用户传入的配置信息
   */
  rest2Combine(config1: ApisConfig, config2: ApisConfig): ApisConfig {
    if (config2.rest) {
      config2.url = this.restful(config1.url!, config2.rest)
    }
    return { ...config1, ...config2 }
  }
  /**
   * 合并配置
   * 转化为请求方法
   */
  combine2Request(): void {
    for (const key of Object.keys(this.apiMap)) {
      this.instance[key] = (config?: ApisConfig) => {
        let result: ApisConfig = this.apiMap[key]
        if (config) {
          result = this.rest2Combine(this.apiMap[key], config)
        }
        return this.axiosInstance.request(result)
      }
    }
  }
}

function createInstance(
  serverMap: ServerMap,
  apiMap: ApisMap,
  common?: AxiosRequestConfig
): ApisInstance {
  const apis = new Apis(serverMap, apiMap, common)
  /**
   * new过后清空以前的拦截器队列
   * 因为new完一个实例过后，拦截器信息可以作废
   * 所以要确保你实例化之前先注册拦截器
   */
  Apis.reqMiddleware = []
  Apis.resMiddleware = []
  return apis.instance
}

createInstance.useReq = function(
  onFulfilled?: ResolvedFn<AxiosRequestConfig>,
  onRejected?: RejectedFn
) {
  Apis.reqMiddleware.push({ onFulfilled, onRejected })
}
createInstance.useRes = function(onFulfilled?: ResolvedFn<AxiosResponse>, onRejected?: RejectedFn) {
  Apis.resMiddleware.push({ onFulfilled, onRejected })
}

export default createInstance

import createInstance from '../../src/apis'
import { ApisMap } from '../../src/types'

const serverMap = {
  baseServer: {
    baseMap: {
      localprod: '',
      prod: 'https://wwww.baidu.com',
      stage: 'https://wwww.baidu.com',
      test: 'https://wwww.baidu.com',
      dev: 'https:/wwww.baidu.com',
      local: 'http://127.0.0.1:4320',
      baseURL: 'https://localhost:8080'
    },
    default: true
  },
  'api-test': {
    baseMap: {
      localprod: '',
      prod: 'https://www.baidu.com',
      stage: 'https://www.baidu.com',
      test: 'https://www.baidu.com',
      dev: 'https:/www.baidu.com',
      local: `http://127.0.0.1:4320`,
      baseURL: 'https://localhost:8080'
    }
  }
}

const apiMap: ApisMap = {
  getBaseInfo: {
    method: 'get',
    url: '/base/get'
  },
  getBaseRestInfo: {
    method: 'get',
    url: '/base/get/:id/kill/:test'
  }
}

/**
 * 测试拦截器
 */
createInstance.useReq(
  function(config) {
    console.log('请求中间拦截器1')
    config.headers.Authorization = 'Bearer'
    return config
  },
  function(error) {
    return Promise.reject(error)
  }
)
createInstance.useReq(
  function(config) {
    console.log('请求中间拦截器2')
    config.headers.Authorization = 'Bearer'
    return config
  },
  function(error) {
    return Promise.reject(error)
  }
)

createInstance.useRes(
  function(result) {
    console.log('响应中间拦截器')
    return result
  },
  function(error) {
    return Promise.reject(error)
  }
)

let apis = createInstance(serverMap, apiMap)

apis.getBaseInfo({ params: { name: 'vnues' } }).then(res => {
  console.log(res)
})

/**
 * 测试restful
 */

apis.getBaseRestInfo({ rest: { id: 9527, test: 250 } }).then(res => {
  console.log(res)
})

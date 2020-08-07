import { AxiosRequestConfig, AxiosPromise } from 'axios'

export interface ApisMap {
  [key: string]: {
    server?: string
    url: string
    method: 'get' | 'post' | 'put' | 'delete'
  }
}
export interface ServerMap {
  [key: string]: Config
}

interface BaseMap {
  localprod: string
  prod: string
  stage: string
  test: string
  dev: string
  local: string
  [key: string]: any
}

interface Config {
  default?: boolean
  baseURL?: string
  baseMap: BaseMap
}

export interface ResolvedFn<T = any> {
  (val: T): T | Promise<T>
}

export interface RejectedFn {
  (err: any): any
}

export interface Middleware {
  onFulfilled?: ResolvedFn
  onRejected?: RejectedFn
}

export interface Rest {
  [key: string]: any
}
export interface ApisConfig extends AxiosRequestConfig {
  rest?: Rest
}
export interface Apis {
  [key: string]: (config?: ApisConfig) => AxiosPromise
}

export interface ApisInstance extends Apis {}

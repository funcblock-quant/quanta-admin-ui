import request from '@/utils/request'

// 查询BusStrategyInstance列表
export function listBusStrategyInstance(query) {
  return request({
    url: '/api/v1/strategy-instance',
    method: 'get',
    params: query
  })
}

// 查询BusStrategyInstance详细
export function getBusStrategyInstance(id) {
  return request({
    url: '/api/v1/strategy-instance/' + id,
    method: 'get'
  })
}

// 新增BusStrategyInstance
export function addBusStrategyInstance(data) {
  return request({
    url: '/api/v1/strategy-instance',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyInstance
export function updateBusStrategyInstance(data) {
  return request({
    url: '/api/v1/strategy-instance/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyInstance
export function delBusStrategyInstance(data) {
  return request({
    url: '/api/v1/strategy-instance',
    method: 'delete',
    data: data
  })
}

// 启动BusStrategyInstance
export function startBusStrategyInstance(id) {
  return request({
    url: '/api/v1/startStrategyInstance/' + id,
    method: 'put'
  })
}

// 停用BusStrategyInstance
export function stopBusStrategyInstance(id) {
  return request({
    url: '/api/v1/stopStrategyInstance/' + id,
    method: 'put'
  })
}

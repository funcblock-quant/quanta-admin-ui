import request from '@/utils/request'

// 查询BusStrategyExchange列表
export function listBusStrategyExchange(query) {
  return request({
    url: '/api/v1/exchange',
    method: 'get',
    params: query
  })
}

// 查询BusStrategyExchange详细
export function getBusStrategyExchange(id) {
  return request({
    url: '/api/v1/exchange/' + id,
    method: 'get'
  })
}

// 新增BusStrategyExchange
export function addBusStrategyExchange(data) {
  return request({
    url: '/api/v1/exchange',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyExchange
export function updateBusStrategyExchange(data) {
  return request({
    url: '/api/v1/exchange/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyExchange
export function delBusStrategyExchange(data) {
  return request({
    url: '/api/v1/exchange',
    method: 'delete',
    data: data
  })
}


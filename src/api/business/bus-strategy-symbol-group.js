import request from '@/utils/request'

// 查询BusStrategySymbolGroup列表
export function listBusStrategySymbolGroup(query) {
  return request({
    url: '/api/v1/symbol-group',
    method: 'get',
    params: query
  })
}

// 查询BusStrategySymbolGroup详细
export function getBusStrategySymbolGroup(id) {
  return request({
    url: '/api/v1/symbol-group/' + id,
    method: 'get'
  })
}

// 新增BusStrategySymbolGroup
export function addBusStrategySymbolGroup(data) {
  return request({
    url: '/api/v1/symbol-group',
    method: 'post',
    data: data
  })
}

// 修改BusStrategySymbolGroup
export function updateBusStrategySymbolGroup(data) {
  return request({
    url: '/api/v1/symbol-group/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategySymbolGroup
export function delBusStrategySymbolGroup(data) {
  return request({
    url: '/api/v1/symbol-group',
    method: 'delete',
    data: data
  })
}


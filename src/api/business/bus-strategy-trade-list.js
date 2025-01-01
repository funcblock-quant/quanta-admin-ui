import request from '@/utils/request'

// 查询BusStrategyTradeList列表
export function listBusStrategyTradeList(query) {
  return request({
    url: '/api/v1/trade-list',
    method: 'get',
    params: query
  })
}

// 查询BusStrategyTradeList详细
export function getBusStrategyTradeList(id) {
  return request({
    url: '/api/v1/trade-list/' + id,
    method: 'get'
  })
}

// 新增BusStrategyTradeList
export function addBusStrategyTradeList(data) {
  return request({
    url: '/api/v1/trade-list',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyTradeList
export function updateBusStrategyTradeList(data) {
  return request({
    url: '/api/v1/trade-list/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyTradeList
export function delBusStrategyTradeList(data) {
  return request({
    url: '/api/v1/trade-list',
    method: 'delete',
    data: data
  })
}


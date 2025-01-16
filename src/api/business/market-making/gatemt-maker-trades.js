import request from '@/utils/request'

// 查询GatemtMakerTrades列表
export function listGatemtMakerTrades(query) {
  return request({
    url: '/api/v1/market-making-trades',
    method: 'get',
    params: query
  })
}

// 查询GatemtMakerTrades详细
export function getGatemtMakerTrades(id) {
  return request({
    url: '/api/v1/market-making-trades/' + id,
    method: 'get'
  })
}

// 新增GatemtMakerTrades
export function addGatemtMakerTrades(data) {
  return request({
    url: '/api/v1/market-making-trades',
    method: 'post',
    data: data
  })
}

// 修改GatemtMakerTrades
export function updateGatemtMakerTrades(data) {
  return request({
    url: '/api/v1/market-making-trades/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除GatemtMakerTrades
export function delGatemtMakerTrades(data) {
  return request({
    url: '/api/v1/market-making-trades',
    method: 'delete',
    data: data
  })
}

// 查询GatemtMakerTrades详细
export function getGatemtMakerTradesByOrderId(id) {
  return request({
    url: '/api/v1/queryMarketMakingTradesByOrderId/' + id,
    method: 'get'
  })
}

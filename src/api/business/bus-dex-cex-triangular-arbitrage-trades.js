import request from '@/utils/request'

// 查询StrategyDexCexTriangularArbitrageTrades列表
export function listStrategyDexCexTriangularArbitrageTrades(query) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-trades',
    method: 'get',
    params: query
  })
}

// 查询StrategyDexCexTriangularArbitrageTrades详细
export function getStrategyDexCexTriangularArbitrageTrades(id) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-trades/' + id,
    method: 'get'
  })
}

// 新增StrategyDexCexTriangularArbitrageTrades
export function addStrategyDexCexTriangularArbitrageTrades(data) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-trades',
    method: 'post',
    data: data
  })
}

// 修改StrategyDexCexTriangularArbitrageTrades
export function updateStrategyDexCexTriangularArbitrageTrades(data) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-trades/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除StrategyDexCexTriangularArbitrageTrades
export function delStrategyDexCexTriangularArbitrageTrades(data) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-trades',
    method: 'delete',
    data: data
  })
}


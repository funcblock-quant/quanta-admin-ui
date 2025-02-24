import request from '@/utils/request'

// 查询StrategyDexCexTriangularArbitrageOpportunities列表
export function listStrategyDexCexTriangularArbitrageOpportunities(query) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-opportunities',
    method: 'get',
    params: query
  })
}

// 查询StrategyDexCexTriangularArbitrageOpportunities详细
export function getStrategyDexCexTriangularArbitrageOpportunities(id) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-opportunities/' + id,
    method: 'get'
  })
}

// 新增StrategyDexCexTriangularArbitrageOpportunities
export function addStrategyDexCexTriangularArbitrageOpportunities(data) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-opportunities',
    method: 'post',
    data: data
  })
}

// 修改StrategyDexCexTriangularArbitrageOpportunities
export function updateStrategyDexCexTriangularArbitrageOpportunities(data) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-opportunities/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除StrategyDexCexTriangularArbitrageOpportunities
export function delStrategyDexCexTriangularArbitrageOpportunities(data) {
  return request({
    url: '/api/v1/bus-dex-cex-triangular-arbitrage-opportunities',
    method: 'delete',
    data: data
  })
}


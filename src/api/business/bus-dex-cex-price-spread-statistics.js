import request from '@/utils/request'

// 查询BusDexCexPriceSpreadStatistics列表
export function listBusDexCexPriceSpreadStatistics(query) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-statistics',
    method: 'get',
    params: query
  })
}

// 查询BusDexCexPriceSpreadStatistics详细
export function getBusDexCexPriceSpreadStatistics(id) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-statistics/' + id,
    method: 'get'
  })
}

// 新增BusDexCexPriceSpreadStatistics
export function addBusDexCexPriceSpreadStatistics(data) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-statistics',
    method: 'post',
    data: data
  })
}

// 修改BusDexCexPriceSpreadStatistics
export function updateBusDexCexPriceSpreadStatistics(data) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-statistics/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusDexCexPriceSpreadStatistics
export function delBusDexCexPriceSpreadStatistics(data) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-statistics',
    method: 'delete',
    data: data
  })
}


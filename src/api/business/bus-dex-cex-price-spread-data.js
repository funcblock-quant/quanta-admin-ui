import request from '@/utils/request'

// 查询BusDexCexPriceSpreadData列表
export function listBusDexCexPriceSpreadData(query) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-data',
    method: 'get',
    params: query
  })
}

// 查询BusDexCexPriceSpreadData详细
export function getBusDexCexPriceSpreadData(id) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-data/' + id,
    method: 'get'
  })
}

// 查询BusDexCexPriceSpreadData详细
export function getDexCexHistoryChart(data) {
  return request({
    url: '/api/v1/getDexCexHistoryChart',
    method: 'post',
    data: data
  })
}

// 新增BusDexCexPriceSpreadData
export function addBusDexCexPriceSpreadData(data) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-data',
    method: 'post',
    data: data
  })
}

// 修改BusDexCexPriceSpreadData
export function updateBusDexCexPriceSpreadData(data) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-data/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusDexCexPriceSpreadData
export function delBusDexCexPriceSpreadData(data) {
  return request({
    url: '/api/v1/bus-dex-cex-price-spread-data',
    method: 'delete',
    data: data
  })
}


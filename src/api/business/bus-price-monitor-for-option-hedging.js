import request from '@/utils/request'

// 查询BusPriceMonitorForOptionHedging列表
export function listBusPriceMonitorForOptionHedging(query) {
  return request({
    url: '/api/v1/bus-price-monitor',
    method: 'get',
    params: query
  })
}

// 查询BusPriceMonitorForOptionHedging详细
export function getBusPriceMonitorForOptionHedging(id) {
  return request({
    url: '/api/v1/bus-price-monitor/' + id,
    method: 'get'
  })
}

// 新增BusPriceMonitorForOptionHedging
export function addBusPriceMonitorForOptionHedging(data) {
  return request({
    url: '/api/v1/bus-price-monitor',
    method: 'post',
    data: data
  })
}

// 修改BusPriceMonitorForOptionHedging
export function updateBusPriceMonitorForOptionHedging(data) {
  return request({
    url: '/api/v1/bus-price-monitor/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusPriceMonitorForOptionHedging
export function delBusPriceMonitorForOptionHedging(data) {
  return request({
    url: '/api/v1/bus-price-monitor',
    method: 'delete',
    data: data
  })
}


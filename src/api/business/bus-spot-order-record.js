import request from '@/utils/request'

// 查询BusSpotOrderRecord列表
export function listBusSpotOrderRecord(query) {
  return request({
    url: '/api/v1/spot-order',
    method: 'get',
    params: query
  })
}

// 查询BusSpotOrderRecord详细
export function getBusSpotOrderRecord(id) {
  return request({
    url: '/api/v1/spot-order/' + id,
    method: 'get'
  })
}

// 新增BusSpotOrderRecord
export function addBusSpotOrderRecord(data) {
  return request({
    url: '/api/v1/spot-order',
    method: 'post',
    data: data
  })
}

// 修改BusSpotOrderRecord
export function updateBusSpotOrderRecord(data) {
  return request({
    url: '/api/v1/spot-order/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusSpotOrderRecord
export function delBusSpotOrderRecord(data) {
  return request({
    url: '/api/v1/spot-order',
    method: 'delete',
    data: data
  })
}


import request from '@/utils/request'

// 查询BusTriangleOrdersRecord列表
export function listBusTriangleOrdersRecord(query) {
  return request({
    url: '/api/v1/bus-triangle-orders-record',
    method: 'get',
    params: query
  })
}

// 查询BusTriangleOrdersRecord详细
export function getBusTriangleOrdersRecord(id) {
  return request({
    url: '/api/v1/bus-triangle-orders-record/' + id,
    method: 'get'
  })
}

// 新增BusTriangleOrdersRecord
export function addBusTriangleOrdersRecord(data) {
  return request({
    url: '/api/v1/bus-triangle-orders-record',
    method: 'post',
    data: data
  })
}

// 修改BusTriangleOrdersRecord
export function updateBusTriangleOrdersRecord(data) {
  return request({
    url: '/api/v1/bus-triangle-orders-record/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusTriangleOrdersRecord
export function delBusTriangleOrdersRecord(data) {
  return request({
    url: '/api/v1/bus-triangle-orders-record',
    method: 'delete',
    data: data
  })
}


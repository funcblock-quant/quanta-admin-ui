import request from '@/utils/request'

// 查询BusRiskEvent列表
export function listBusRiskEvent(query) {
  return request({
    url: '/api/v1/bus-risk-event',
    method: 'get',
    params: query
  })
}

// 查询BusRiskEvent详细
export function getBusRiskEvent(id) {
  return request({
    url: '/api/v1/bus-risk-event/' + id,
    method: 'get'
  })
}

// 新增BusRiskEvent
export function addBusRiskEvent(data) {
  return request({
    url: '/api/v1/bus-risk-event',
    method: 'post',
    data: data
  })
}

// 修改BusRiskEvent
export function updateBusRiskEvent(data) {
  return request({
    url: '/api/v1/bus-risk-event/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusRiskEvent
export function delBusRiskEvent(data) {
  return request({
    url: '/api/v1/bus-risk-event',
    method: 'delete',
    data: data
  })
}


import request from '@/utils/request'

// 查询BusFuturePositionRecord列表
export function listBusFuturePositionRecord(query) {
  return request({
    url: '/api/v1/future-order',
    method: 'get',
    params: query
  })
}

// 查询BusFuturePositionRecord详细
export function getBusFuturePositionRecord(id) {
  return request({
    url: '/api/v1/future-order/' + id,
    method: 'get'
  })
}

// 新增BusFuturePositionRecord
export function addBusFuturePositionRecord(data) {
  return request({
    url: '/api/v1/future-order',
    method: 'post',
    data: data
  })
}

// 修改BusFuturePositionRecord
export function updateBusFuturePositionRecord(data) {
  return request({
    url: '/api/v1/future-order/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusFuturePositionRecord
export function delBusFuturePositionRecord(data) {
  return request({
    url: '/api/v1/future-order',
    method: 'delete',
    data: data
  })
}


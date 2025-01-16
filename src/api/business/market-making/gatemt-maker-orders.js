import request from '@/utils/request'

// 查询GatemtMakerOrders列表
export function listGatemtMakerOrders(query) {
  return request({
    url: '/api/v1/market-making-record',
    method: 'get',
    params: query
  })
}

// 查询GatemtMakerOrders详细
export function getGatemtMakerOrders(id) {
  return request({
    url: '/api/v1/market-making-record/' + id,
    method: 'get'
  })
}

// 新增GatemtMakerOrders
export function addGatemtMakerOrders(data) {
  return request({
    url: '/api/v1/market-making-record',
    method: 'post',
    data: data
  })
}

// 修改GatemtMakerOrders
export function updateGatemtMakerOrders(data) {
  return request({
    url: '/api/v1/market-making-record/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除GatemtMakerOrders
export function delGatemtMakerOrders(data) {
  return request({
    url: '/api/v1/market-making-record',
    method: 'delete',
    data: data
  })
}


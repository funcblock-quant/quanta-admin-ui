import request from '@/utils/request'

// 查询BusExchangeAccountGroup列表
export function listBusExchangeAccountGroup(query) {
  return request({
    url: '/api/v1/account-group',
    method: 'get',
    params: query
  })
}

// 查询BusExchangeAccountGroup详细
export function getBusExchangeAccountGroup(id) {
  return request({
    url: '/api/v1/account-group/' + id,
    method: 'get'
  })
}

// 新增BusExchangeAccountGroup
export function addBusExchangeAccountGroup(data) {
  return request({
    url: '/api/v1/account-group',
    method: 'post',
    data: data
  })
}

// 修改BusExchangeAccountGroup
export function updateBusExchangeAccountGroup(data) {
  return request({
    url: '/api/v1/account-group/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusExchangeAccountGroup
export function delBusExchangeAccountGroup(data) {
  return request({
    url: '/api/v1/account-group',
    method: 'delete',
    data: data
  })
}


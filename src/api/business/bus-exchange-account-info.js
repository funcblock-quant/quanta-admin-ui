import request from '@/utils/request'

// 查询BusExchangeAccountInfo列表
export function listBusExchangeAccountInfo(query) {
  return request({
    url: '/api/v1/exchange-account',
    method: 'get',
    params: query
  })
}

// 查询BusExchangeAccountInfo详细
export function getBusExchangeAccountInfo(id) {
  return request({
    url: '/api/v1/exchange-account/' + id,
    method: 'get'
  })
}

// 新增BusExchangeAccountInfo
export function addBusExchangeAccountInfo(data) {
  return request({
    url: '/api/v1/exchange-account',
    method: 'post',
    data: data
  })
}

// 修改BusExchangeAccountInfo
export function updateBusExchangeAccountInfo(data) {
  return request({
    url: '/api/v1/exchange-account/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusExchangeAccountInfo
export function delBusExchangeAccountInfo(data) {
  return request({
    url: '/api/v1/exchange-account',
    method: 'delete',
    data: data
  })
}

export function listBusExchangeAccountInfoByGroupId(groupId) {
  return request({
    url: '/api/v1/queryAccountByGroupId/' + groupId,
    method: 'get'
  })
}

export function queryExchangeListInUse() {
  return request({
    url: '/api/v1/queryExchangeListInUse',
    method: 'get'
  })
}

export function getPortfolioUnwindingInfo(data) {
  return request({
    url: '/api/v1/getPortfolioUnwindingInfo',
    method: 'post',
    data: data
  })
}

export function portfolioUnwinding(data) {
  return request({
    url: '/api/v1/portfolioUnwinding',
    method: 'post',
    data: data
  })
}


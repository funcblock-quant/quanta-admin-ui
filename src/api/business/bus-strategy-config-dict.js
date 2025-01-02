import request from '@/utils/request'

// 根据strategy Id 查询BusStrategyConfigDict列表
export function listBusStrategyConfigDictByStrategyId(strategyId) {
  return request({
    url: '/api/v1/strategy-config?strategyId=' + strategyId,
    method: 'get'
  })
}

// 查询BusStrategyConfigDict详细
export function getBusStrategyConfigDict(id) {
  return request({
    url: '/api/v1/strategy-config/' + id,
    method: 'get'
  })
}

// 新增BusStrategyConfigDict
export function addBusStrategyConfigDict(data) {
  return request({
    url: '/api/v1/strategy-config',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyConfigDict
export function updateBusStrategyConfigDict(data) {
  return request({
    url: '/api/v1/strategy-config/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyConfigDict
export function delBusStrategyConfigDict(data) {
  return request({
    url: '/api/v1/strategy-config',
    method: 'delete',
    data: data
  })
}


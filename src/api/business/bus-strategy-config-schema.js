import request from '@/utils/request'

// 查询BusStrategyConfigSchema列表
export function listBusStrategyConfigSchemaByInstanceId(strategyId) {
  return request({
    url: '/api/v1/strategy-config-schema?strategyId=' + strategyId,
    method: 'get'
  })
}

// 查询BusStrategyConfigSchema详细
export function getBusStrategyConfigSchema(id) {
  return request({
    url: '/api/v1/strategy-config-schema/' + id,
    method: 'get'
  })
}

// 新增BusStrategyConfigSchema
export function addBusStrategyConfigSchema(data) {
  return request({
    url: '/api/v1/strategy-config-schema',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyConfigSchema
export function updateBusStrategyConfigSchema(data) {
  return request({
    url: '/api/v1/strategy-config-schema/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyConfigSchema
export function delBusStrategyConfigSchema(data) {
  return request({
    url: '/api/v1/strategy-config-schema',
    method: 'delete',
    data: data
  })
}


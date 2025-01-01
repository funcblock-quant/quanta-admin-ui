import request from '@/utils/request'

// 查询BusStrategyInstanceConfig列表
export function listBusStrategyInstanceConfig(query) {
  return request({
    url: '/api/v1/instance-config',
    method: 'get',
    params: query
  })
}

// 查询BusStrategyInstanceConfig详细
export function getBusStrategyInstanceConfig(id) {
  return request({
    url: '/api/v1/instance-config/' + id,
    method: 'get'
  })
}

// 新增BusStrategyInstanceConfig
export function addBusStrategyInstanceConfig(data) {
  return request({
    url: '/api/v1/instance-config',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyInstanceConfig
export function updateBusStrategyInstanceConfig(data) {
  return request({
    url: '/api/v1/instance-config/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyInstanceConfig
export function delBusStrategyInstanceConfig(data) {
  return request({
    url: '/api/v1/instance-config',
    method: 'delete',
    data: data
  })
}


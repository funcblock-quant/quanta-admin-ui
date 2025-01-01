import request from '@/utils/request'

// 查询BusStrategyBaseInfo列表
export function listBusStrategyBaseInfo(query) {
  return request({
    url: '/api/v1/stragegy-base',
    method: 'get',
    params: query
  })
}

// 查询BusStrategyBaseInfo详细
export function getBusStrategyBaseInfo(id) {
  return request({
    url: '/api/v1/stragegy-base/' + id,
    method: 'get'
  })
}

// 新增BusStrategyBaseInfo
export function addBusStrategyBaseInfo(data) {
  return request({
    url: '/api/v1/stragegy-base',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyBaseInfo
export function updateBusStrategyBaseInfo(data) {
  return request({
    url: '/api/v1/stragegy-base/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyBaseInfo
export function delBusStrategyBaseInfo(data) {
  return request({
    url: '/api/v1/stragegy-base',
    method: 'delete',
    data: data
  })
}


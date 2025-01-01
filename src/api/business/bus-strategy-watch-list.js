import request from '@/utils/request'

// 查询BusStrategyWatchList列表
export function listBusStrategyWatchList(query) {
  return request({
    url: '/api/v1/watch-list',
    method: 'get',
    params: query
  })
}

// 查询BusStrategyWatchList详细
export function getBusStrategyWatchList(id) {
  return request({
    url: '/api/v1/watch-list/' + id,
    method: 'get'
  })
}

// 新增BusStrategyWatchList
export function addBusStrategyWatchList(data) {
  return request({
    url: '/api/v1/watch-list',
    method: 'post',
    data: data
  })
}

// 修改BusStrategyWatchList
export function updateBusStrategyWatchList(data) {
  return request({
    url: '/api/v1/watch-list/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusStrategyWatchList
export function delBusStrategyWatchList(data) {
  return request({
    url: '/api/v1/watch-list',
    method: 'delete',
    data: data
  })
}


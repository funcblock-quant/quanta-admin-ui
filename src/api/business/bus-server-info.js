import request from '@/utils/request'

// 查询BusServerInfo列表
export function listBusServerInfo(query) {
  return request({
    url: '/api/v1/server-info',
    method: 'get',
    params: query
  })
}

// 查询BusServerInfo详细
export function getBusServerInfo(id) {
  return request({
    url: '/api/v1/server-info/' + id,
    method: 'get'
  })
}

// 新增BusServerInfo
export function addBusServerInfo(data) {
  return request({
    url: '/api/v1/server-info',
    method: 'post',
    data: data
  })
}

// 修改BusServerInfo
export function updateBusServerInfo(data) {
  return request({
    url: '/api/v1/server-info/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusServerInfo
export function delBusServerInfo(data) {
  return request({
    url: '/api/v1/server-info',
    method: 'delete',
    data: data
  })
}

// 启用BusServerInfo
export function startBusServerInfo(id) {
  return request({
    url: '/api/v1/startServer/' + id,
    method: 'put'
  })
}

// 暂停BusServerInfo
export function stopBusServerInfo(id) {
  return request({
    url: '/api/v1/stopServer/' + id,
    method: 'put'
  })
}

import request from '@/utils/request'

// 查询BusDexCexTriangularObserver列表
export function listBusDexCexTriangularObserver(query) {
  return request({
    url: '/api/v1/dex-cex-triangular-observer',
    method: 'get',
    params: query
  })
}

// 查询BusDexCexTriangularObserver详细
export function getBusDexCexTriangularObserver(id) {
  return request({
    url: '/api/v1/dex-cex-triangular-observer/' + id,
    method: 'get'
  })
}

// 新增BusDexCexTriangularObserver
export function addBusDexCexTriangularObserver(data) {
  return request({
    url: '/api/v1/dex-cex-triangular-observer',
    method: 'post',
    data: data
  })
}

// 修改BusDexCexTriangularObserver
export function updateBusDexCexTriangularObserver(data) {
  return request({
    url: '/api/v1/dex-cex-triangular-observer/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusDexCexTriangularObserver
export function delBusDexCexTriangularObserver(data) {
  return request({
    url: '/api/v1/dex-cex-triangular-observer',
    method: 'delete',
    data: data
  })
}

// 批量新增BusDexCexTriangularObserver
export function batchAddBusDexCexTriangularObserver(data) {
  return request({
    url: '/api/v1/batchAddBusDexCexTriangularObserver',
    method: 'post',
    data: data
  })
}

// 查询BusDexCexTriangularObserver所有的观察币种
export function listBusDexCexTriangularSymbolList() {
  return request({
    url: '/api/v1/busDexCexTriangularSymbolList',
    method: 'get'
  })
}

import request from '@/utils/request'

// 查询BusDexWallet列表
export function listBusDexWallet(query) {
  return request({
    url: '/api/v1/bus-dex-wallet',
    method: 'get',
    params: query
  })
}

// 查询BusDexWallet详细
export function getBusDexWallet(id) {
  return request({
    url: '/api/v1/bus-dex-wallet/' + id,
    method: 'get'
  })
}

// 新增BusDexWallet
export function addBusDexWallet(data) {
  return request({
    url: '/api/v1/bus-dex-wallet',
    method: 'post',
    data: data
  })
}

// 修改BusDexWallet
export function updateBusDexWallet(data) {
  return request({
    url: '/api/v1/bus-dex-wallet/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusDexWallet
export function delBusDexWallet(data) {
  return request({
    url: '/api/v1/bus-dex-wallet',
    method: 'delete',
    data: data
  })
}


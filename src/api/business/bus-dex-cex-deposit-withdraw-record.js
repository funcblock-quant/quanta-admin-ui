import request from '@/utils/request'

// 查询BusDexCexDepositWithdrawRecord列表
export function listBusDexCexDepositWithdrawRecord(query) {
  return request({
    url: '/api/v1/bus-dex-cex-deposit-withdraw-record',
    method: 'get',
    params: query
  })
}

// 查询BusDexCexDepositWithdrawRecord详细
export function getBusDexCexDepositWithdrawRecord(id) {
  return request({
    url: '/api/v1/bus-dex-cex-deposit-withdraw-record/' + id,
    method: 'get'
  })
}

// 新增BusDexCexDepositWithdrawRecord
export function addBusDexCexDepositWithdrawRecord(data) {
  return request({
    url: '/api/v1/bus-dex-cex-deposit-withdraw-record',
    method: 'post',
    data: data
  })
}

// 修改BusDexCexDepositWithdrawRecord
export function updateBusDexCexDepositWithdrawRecord(data) {
  return request({
    url: '/api/v1/bus-dex-cex-deposit-withdraw-record/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusDexCexDepositWithdrawRecord
export function delBusDexCexDepositWithdrawRecord(data) {
  return request({
    url: '/api/v1/bus-dex-cex-deposit-withdraw-record',
    method: 'delete',
    data: data
  })
}


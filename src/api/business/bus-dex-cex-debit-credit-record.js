import request from '@/utils/request'

// 查询BusDexCexDebitCreditRecord列表
export function listBusDexCexDebitCreditRecord(query) {
  return request({
    url: '/api/v1/bus-dex-cex-debit-credit-record',
    method: 'get',
    params: query
  })
}

// 查询BusDexCexDebitCreditRecord详细
export function getBusDexCexDebitCreditRecord(id) {
  return request({
    url: '/api/v1/bus-dex-cex-debit-credit-record/' + id,
    method: 'get'
  })
}

// 新增BusDexCexDebitCreditRecord
export function addBusDexCexDebitCreditRecord(data) {
  return request({
    url: '/api/v1/bus-dex-cex-debit-credit-record',
    method: 'post',
    data: data
  })
}

// 修改BusDexCexDebitCreditRecord
export function updateBusDexCexDebitCreditRecord(data) {
  return request({
    url: '/api/v1/bus-dex-cex-debit-credit-record/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusDexCexDebitCreditRecord
export function delBusDexCexDebitCreditRecord(data) {
  return request({
    url: '/api/v1/bus-dex-cex-debit-credit-record',
    method: 'delete',
    data: data
  })
}


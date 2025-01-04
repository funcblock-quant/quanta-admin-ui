import request from '@/utils/request'

// 查询BusDexCexTriangularArbitrageRecord列表
export function listBusDexCexTriangularArbitrageRecord(query) {
  return request({
    url: '/api/v1/dex-cex-triangular',
    method: 'get',
    params: query
  })
}

// 查询BusDexCexTriangularArbitrageRecord详细
export function getBusDexCexTriangularArbitrageRecord(id) {
  return request({
    url: '/api/v1/dex-cex-triangular/' + id,
    method: 'get'
  })
}
//
// // 新增BusDexCexTriangularArbitrageRecord
// export function addBusDexCexTriangularArbitrageRecord(data) {
//   return request({
//     url: '/api/v1/dex-cex-triangular',
//     method: 'post',
//     data: data
//   })
// }
//
// // 修改BusDexCexTriangularArbitrageRecord
// export function updateBusDexCexTriangularArbitrageRecord(data) {
//   return request({
//     url: '/api/v1/dex-cex-triangular/' + data.id,
//     method: 'put',
//     data: data
//   })
// }
//
// // 删除BusDexCexTriangularArbitrageRecord
// export function delBusDexCexTriangularArbitrageRecord(data) {
//   return request({
//     url: '/api/v1/dex-cex-triangular',
//     method: 'delete',
//     data: data
//   })
// }

export function listDexCexArbitrageChance(data) {
  return request({
    url: '/api/v1/market/dex-cex-arbitrage-chance',
    method: 'post',
    data: data
  })
}

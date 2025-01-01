import request from '@/utils/request'

// 查询BusArbitrageRecord列表
export function listBusArbitrageRecord(query) {
  return request({
    url: '/api/v1/arbitrage',
    method: 'get',
    params: query
  })
}

// 查询BusArbitrageRecord详细
export function getBusArbitrageRecord(id) {
  return request({
    url: '/api/v1/arbitrage/' + id,
    method: 'get'
  })
}

// // 修改BusArbitrageRecord
// export function updateBusArbitrageRecord(data) {
//   return request({
//     url: '/api/v1/arbitrage/' + data.id,
//     method: 'put',
//     data: data
//   })
// }

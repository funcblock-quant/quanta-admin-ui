import request from '@/utils/request'

// 查询BusPriceTriggerStrategyInstance列表
export function listBusPriceTriggerStrategyInstance(query) {
  return request({
    url: '/api/v1/bus-price-trigger-strategy',
    method: 'get',
    params: query
  })
}

// 查询BusPriceTriggerStrategyInstance详细
export function getBusPriceTriggerStrategyInstance(id) {
  return request({
    url: '/api/v1/bus-price-trigger-strategy/' + id,
    method: 'get'
  })
}

// 新增BusPriceTriggerStrategyInstance
export function addBusPriceTriggerStrategyInstance(data) {
  return request({
    url: '/api/v1/bus-price-trigger-strategy',
    method: 'post',
    data: data
  })
}

// 修改BusPriceTriggerStrategyInstance
export function updateBusPriceTriggerStrategyInstance(data) {
  return request({
    url: '/api/v1/bus-price-trigger-strategy/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusPriceTriggerStrategyInstance
export function delBusPriceTriggerStrategyInstance(data) {
  return request({
    url: '/api/v1/bus-price-trigger-strategy',
    method: 'delete',
    data: data
  })
}

// 暂停BusPriceTriggerStrategyInstance
export function stopBusPriceTriggerStrategyInstance(data) {
  return request({
    url: '/api/v1/stopTriggerInstance',
    method: 'post',
    data: data
  })
}

export function getTriggerUserList() {
  return request({
    url: '/api/v1/getTriggerUserList',
    method: 'get'
  })
}

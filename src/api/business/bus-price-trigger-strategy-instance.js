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

// 修改BusPriceTriggerStrategyInstance止盈参数
export function updateBusPriceTriggerStrategyProfitTarget(data) {
  return request({
    url: '/api/v1/updateProfitTarget',
    method: 'put',
    data: data
  })
}

// 修改BusPriceTriggerStrategyInstance执行参数
export function updateBusPriceTriggerStrategyExecuteConfig(data) {
  return request({
    url: '/api/v1/updateExecuteConfig',
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

// 获取BusPriceTriggerStrategyInstance币种列表
export function getSymbolList() {
  return request({
    url: '/api/v1/getSymbolList',
    method: 'get'
  })
}

// 获取BusPriceTriggerStrategyInstance交易所userId列表
export function getExchangeUserIdList() {
  return request({
    url: '/api/v1/getExchangeUserIdList',
    method: 'get'
  })
}

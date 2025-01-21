import request from '@/utils/request'

// 查询BusPriceTriggerStrategyApikeyConfig列表
export function listBusPriceTriggerStrategyApikeyConfig(query) {
  return request({
    url: '/api/v1/bus-price-trigger-apikey-config',
    method: 'get',
    params: query
  })
}

// 查询BusPriceTriggerStrategyApikeyConfig详细
export function getBusPriceTriggerStrategyApikeyConfig(id) {
  return request({
    url: '/api/v1/bus-price-trigger-apikey-config/' + id,
    method: 'get'
  })
}

// 新增BusPriceTriggerStrategyApikeyConfig
export function addBusPriceTriggerStrategyApikeyConfig(data) {
  return request({
    url: '/api/v1/bus-price-trigger-apikey-config',
    method: 'post',
    data: data
  })
}

// 修改BusPriceTriggerStrategyApikeyConfig
export function updateBusPriceTriggerStrategyApikeyConfig(data) {
  return request({
    url: '/api/v1/bus-price-trigger-apikey-config/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除BusPriceTriggerStrategyApikeyConfig
export function delBusPriceTriggerStrategyApikeyConfig(data) {
  return request({
    url: '/api/v1/bus-price-trigger-apikey-config',
    method: 'delete',
    data: data
  })
}


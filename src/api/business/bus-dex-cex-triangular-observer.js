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

// 获取某个币种的最新一次的配置信息，主要是链上信息
export function getLatestObserverConfigByTargetToken(token) {
  return request({
    url: '/api/v1/getLatestObserverConfigByTargetToken/' + token,
    method: 'get'
  })
}

// 查询BusDexCexTriangularObserver所有的观察币种配置的交易所列表
export function listBusDexCexTriangularExchangeList() {
  return request({
    url: '/api/v1/busDexCexTriangularExchangeList',
    method: 'get'
  })
}

// 查询BusDexCexTriangularObserver所有的dex钱包列表
export function listBusDexCexTriangularDexWalletlList() {
  return request({
    url: '/api/v1/busDexCexTriangularDexWalletList',
    method: 'get'
  })
}

// 查询BusDexCexTriangularObserver所有的cex钱包列表
export function listBusDexCexTriangularCexAccountList(exchange) {
  return request({
    url: '/api/v1/busDexCexTriangularCexAccountList/' + exchange,
    method: 'get'
  })
}

// 启动交易
export function busDexCexTriangularStartTrader(data) {
  return request({
    url: '/api/v1/busDexCexTriangularStartTrader',
    method: 'post',
    data: data
  })
}

// 停止交易
export function busDexCexTriangularStopTrader(data) {
  return request({
    url: '/api/v1/busDexCexTriangularStopTrader',
    method: 'post',
    data: data
  })
}

// 更新observer
export function busDexCexTriangularUpdateObserver(data) {
  return request({
    url: '/api/v1/busDexCexTriangularUpdateObserver',
    method: 'put',
    data: data
  })
}

// 查看水位调节中的进度
export function busDexCexTriangularGetWaterLevelDetail(data) {
  return request({
    url: '/api/v1/busDexCexTriangularGetWaterLevelDetail',
    method: 'post',
    data: data
  })
}

// 更新trader
export function busDexCexTriangularUpdateTrader(data) {
  return request({
    url: '/api/v1/busDexCexTriangularUpdateTrader',
    method: 'put',
    data: data
  })
}

// 更新waterlevel
export function busDexCexTriangularUpdateWaterLevel(data) {
  return request({
    url: '/api/v1/busDexCexTriangularUpdateWaterLevel',
    method: 'put',
    data: data
  })
}

// 暂停全部trader
export function busDexCexTriangularStopAllTraders(data) {
  return request({
    url: '/api/v1/busDexCexTriangularStopAllTrades',
    method: 'put',
    data: data
  })
}

// 获取全局水位参数
export function busDexCexTriangularGetGlobalWaterLevel(exchange) {
  return request({
    url: '/api/v1/busDexCexTriangularGetGlobalWaterLevel/' + exchange,
    method: 'get'
  })
}

// 更新全局水位参数
export function busDexCexTriangularUpdateGlobalWaterLevel(data) {
  return request({
    url: '/api/v1/busDexCexTriangularUpdateGlobalWaterLevel',
    method: 'post',
    data: data
  })
}

// 获取全局风控参数
export function busDexCexTriangularGetGlobalRiskConfig() {
  return request({
    url: '/api/v1/busDexCexTriangularGetRiskConfig',
    method: 'get'
  })
}

// 更新全局风控参数
export function busDexCexTriangularUpdateGlobalRiskConfig(data) {
  return request({
    url: '/api/v1/busDexCexTriangularUpdateRiskConfig',
    method: 'post',
    data: data
  })
}

// 根据某一侧的账户信息获取绑定的另一侧的账户列表
export function getBoundAccountList(data) {
  return request({
    url: '/api/v1/getRelatedAccounts',
    method: 'post',
    data: data
  })
}

// 根据某一侧的账户信息获取可以绑定的另一侧的账户列表
export function getCanBoundAccountList(data) {
  return request({
    url: '/api/v1/getCanBoundAccounts',
    method: 'post',
    data: data
  })
}

// 获取dex-cex套利的所有交易中的账户对的全局水位配置列表
export function getActiveAccountPairs() {
  return request({
    url: '/api/v1/getActiveAccountPairs',
    method: 'get'
  })
}

// 获取dex-cex套利的账户组的实时借贷利率
export function getRealtimeInterestRate(data) {
  return request({
    url: '/api/v1/getRealtimeInterestRate',
    method: 'post',
    data: data
  })
}


<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="交易对" prop="symbols">
            <el-select
              v-model="queryParams.symbol"
              placeholder="请选择交易对"
              clearable
              size="small"
              style="width: 400px;"
            >
              <el-option
                v-for="symbol in symbolWatchList"
                :key="symbol.symbol"
                :value="symbol.symbol"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busDexCexMonitor:list']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleBatchAdd"
            >新增
            </el-button>
          </el-col>
          <el-col :span="19">
            <el-button
              v-permisaction="['business:busDexCexMonitor:list']"
              type="primary"
              size="mini"
              @click="handleShowGlobalConfig"
            >全局水位参数调节
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busDexCexMonitor:list']"
              type="danger"
              size="mini"
              @click="handleEditGlobalRiskConfig"
            >风控参数配置
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <!-- 一键暂停按钮 -->
            <el-button
              v-permisaction="['business:busDexCexMonitor:list']"
              type="danger"
              size="mini"
              @click="handleStopAllTrades"
            >
              一键暂停
            </el-button>

          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="busDexCexTriangularObserverList" class="table-container" style="width: 100%;">
          <el-table-column
            label="TargetToken"
            width="120"
            align="center"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <router-link :to="{name:'BusDexCexMonitorDetail', params: {id:scope.row.id}}" class="link-type">
                <span>{{ scope.row.targetToken }}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            label="QuoteToken"
            width="120"
            align="center"
            prop="quoteToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="CEX"
            align="center"
            width="150"
            prop="exchangeType"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="DEX"
            width="250"
            align="center"
            prop="dexType"
            :show-overflow-tooltip="true"
            :formatter="formatDexType"
          />
          <el-table-column
            label="交易金额"
            width="200"
            align="center"
            prop="volume"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              {{ scope.row.minQuoteAmount }} - {{ scope.row.maxQuoteAmount }} {{ scope.row.quoteToken }}
            </template>
          </el-table-column>
          <el-table-column label="DEX买入CEX卖出" align="center">
            <!-- <el-table-column
              label="CEX卖价"
              width="150"
              align="center"
              prop="cexSellPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="DEX买价"
              width="150"
              align="center"
              prop="dexBuyPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="价差"
              width="150"
              align="center"
              prop="dexBuyDiffPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            /> -->
            <el-table-column
              label="预期利润"
              width="150"
              align="center"
              prop="profitOfBuyOnDex"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
          </el-table-column>

          <el-table-column label="DEX卖出CEX买入" align="center">
            <!-- <el-table-column
              label="CEX买价"
              width="150"
              align="center"
              prop="cexBuyPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="DEX卖价"
              width="150"
              align="center"
              prop="dexSellPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="价差"
              width="150"
              align="center"
              prop="dexSellDiffPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            /> -->
            <el-table-column
              label="预期利润"
              align="center"
              width="150"
              prop="profitOfSellOnDex"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
          </el-table-column>

          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="260">
            <template slot-scope="scope">
              <div class="action-buttons">
                <!-- 交易已开启，显示暂停交易和修改交易参数 -->
                <template v-if="scope.row.isTrading">
                  <el-popconfirm
                    title="确认暂停交易吗？"
                    confirm-button-text="暂停"
                    @confirm="pauseTrader(scope.row)"
                  >
                    <el-button
                      slot="reference"
                      size="mini"
                      type="danger"
                      icon="el-icon-video-pause"
                    >暂停交易</el-button>
                  </el-popconfirm>
                </template>
                <!-- 交易未开启，并且 status = 2（水位调节中），显示一个禁用的按钮 -->
                <el-button
                  v-else-if="scope.row.status === '2'"
                  size="mini"
                  type="info"
                  style="color: #606266; background-color: #f5f7fa; border-color: #dcdfe6;"
                  @click="showWaterLevelState(scope.row)"
                >
                  ⏳ 水位调节中
                </el-button>

                <!-- 交易未开启，并且 status = 1（可启动交易），显示启动交易按钮 -->
                <el-button
                  v-else-if="scope.row.status === '1'"
                  size="mini"
                  type="primary"
                  icon="el-icon-caret-right"
                  @click="openStartTradeDialog(scope.row)"
                >启动交易</el-button>

                <el-popconfirm
                  class="delete-popconfirm"
                  title="确认要删除吗?"
                  confirm-button-text="删除"
                  @confirm="handleDelete(scope.row)"
                >
                  <el-button
                    slot="reference"
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                  >删除
                  </el-button>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 确认暂停的弹框 -->
        <el-dialog
          title="确认暂停"
          :visible.sync="stopAllDialogVisible"
          width="400px"
          center
        >
          <span>确定要暂停所有交易吗？</span>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="cancelStopAllTrades">取消</el-button>
              <el-button type="primary" @click="confirmStopAllTrades">确定</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 启动交易表单弹窗 -->
        <el-dialog title="启动交易参数设置" :visible.sync="showStartDialog" width="600px">
          <!-- 说明区域 -->
          <el-alert type="success" :closable="false" style="margin-bottom: 16px;">
            交易启动流程：
            <ul>
              <li>先启动水位调节，确保资金池中的水位达到设定要求。</li>
              <li>当水位达到交易条件后，才会正式开启交易功能。</li>
              <li>交易过程中当资金超出预警水位阈值，可能触发告警和交易功能暂停</li>
            </ul>
          </el-alert>
          <el-descriptions border column="2">
            <el-descriptions-item label="币对">{{ startTradingDialogData.symbol }}</el-descriptions-item>
            <el-descriptions-item v-if="loanRate" label="实时借贷利率">
              {{ loanRate }}
            </el-descriptions-item>

            <!--            <el-descriptions-item label="当前币价">{{ currentPrice }}</el-descriptions-item>-->
            <!--            <el-descriptions-item label="借贷利率 (BTC)">-->
            <!--              {{ loanRateBTC }}%-->
            <!--            </el-descriptions-item>-->
          </el-descriptions>
          <el-form :model="startTraderFormData" label-width="150px">
            <!-- 水位调节参数 -->
            <h3 style="margin-top: 50px; margin-bottom: 20px;">水位调节参数</h3>
            <!-- <el-switch
              v-model="isQuickMode"
              active-text="快速设置"
              inactive-text="自定义设置"
              :disabled="startTradingDialogData.targetTokenQuotePrice === 0"
              @change="handleModeChange(startTradingDialogData.maxQuoteAmount, startTradingDialogData.targetTokenQuotePrice)"
            /> -->
            <!-- <el-form-item v-if="isQuickMode" label="调节倍数">
              <el-input-number v-model="waterLevelMultiplier" :min="0" @change="calculateWaterLevels(startTradingDialogData.maxQuoteAmount, startTradingDialogData.targetTokenQuotePrice)" />
              <el-tooltip content="最低预警余额 = (最大交易额/币价) * 倍数；低水位触发余额 = (最大交易额/币价) * 4 * 倍数；高水位触发余额 = (最大交易额/币价) * 6 * 倍数" placement="top">
                <i class="el-icon-question" style="margin-left: 5px;" />
              </el-tooltip>
            </el-form-item> -->
            <!-- <el-form-item label="最低预警余额(U)" class="mb16">
              <el-input v-model="startTraderFormData.alertThreshold" :disabled="isQuickMode" />
            </el-form-item>
            <el-form-item label="低水位触发余额(U)" class="mb16">
              <el-input v-model="startTraderFormData.buyTriggerThreshold" :disabled="isQuickMode" />
            </el-form-item>
            <el-form-item label="高水位触发余额(U)" class="mb16">
              <el-input v-model="startTraderFormData.sellTriggerThreshold" :disabled="isQuickMode" />
            </el-form-item>
            <el-form-item label="最小充值金额阈值(U)" class="mb16">
              <el-input v-model="startTraderFormData.minDepositAmountThreshold" placeholder="请输入最小充值金额阈值" />
            </el-form-item>
            <el-form-item label="最小提现金额阈值(U)" class="mb16">
              <el-input v-model="startTraderFormData.minWithdrawAmountThreshold" placeholder="请输入最小提现金额阈值" />
            </el-form-item> -->

            <el-form-item label="最低预警余额(U)" class="mb16">
              <el-input v-model="startTraderFormData.alertThreshold" />
            </el-form-item>
            <el-form-item label="低水位触发余额(U)" class="mb16">
              <el-input v-model="startTraderFormData.buyTriggerThreshold" />
            </el-form-item>
            <el-form-item label="高水位触发余额(U)" class="mb16">
              <el-input v-model="startTraderFormData.sellTriggerThreshold" />
            </el-form-item>
            <el-form-item label="最小充值金额阈值(U)" class="mb16">
              <el-input v-model="startTraderFormData.minDepositAmountThreshold" placeholder="请输入最小充值金额阈值" />
            </el-form-item>
            <el-form-item label="最小提现金额阈值(U)" class="mb16">
              <el-input v-model="startTraderFormData.minWithdrawAmountThreshold" placeholder="请输入最小提现金额阈值" />
            </el-form-item>

            <!-- 交易参数 -->
            <h3 style="margin-top: 30px; margin-bottom: 10px;">交易参数</h3>
            <el-form-item label="Prefer Jito">
              <el-switch v-model="startTraderFormData.preferJito" />
            </el-form-item>
            <el-form-item label="Priority Fee(SOL)" prop="priorityFee">
              <el-input v-model="startTraderFormData.priorityFee" placeholder="请指定优先费" />
            </el-form-item>
            <el-form-item label="指定滑点BPS" prop="slippageBpsRate" class="mb16">
              <el-slider
                v-model="startTraderFormData.slippageBpsRate"
                show-input
                step="0.1"
                :precision="1"
                :max="100"
              >
                <template slot="append">%</template>
              </el-slider>
            </el-form-item>
            <!-- <el-form-item label="Priority Fee Rate" prop="priorityFeeRate" class="mb16">
              <el-slider
                v-model="startTraderFormData.priorityFeeRate"
                show-input
                step="0.01"
                :precision="2"
                :max="10"
              >
                <template slot="append">%</template>
              </el-slider>
            </el-form-item> -->

            <el-form-item label="Jito Fee Rate" prop="jitoFeeRate" class="mb16">
              <el-slider
                v-model="startTraderFormData.jitoFeeRate"
                show-input
                step="0.1"
                :precision="1"
                :max="50"
              >
                <template slot="append">%</template>
              </el-slider>
            </el-form-item>
            <h3 style="margin-top: 30px; margin-bottom: 10px;">账户配置</h3>
            <el-form-item label="DEX地址" prop="dexWallet">
              <el-select
                v-model="startTraderFormData.dexWallet"
                placeholder="请选择dex交易的地址"
                clearable
                size="small"
                style="width: 400px;"
                @change="handleDexChange"
              >
                <el-option
                  v-for="wallet in dexWalletList"
                  :key="wallet.id"
                  :value="wallet.id"
                  :label="wallet.walletName + '-' + wallet.walletAddress"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="CEX账户" prop="cexAccount">
              <el-select
                v-model="startTraderFormData.cexAccount"
                placeholder="请选择cex交易账户"
                clearable
                size="small"
                style="width: 400px;"
                @change="handleCexChange"
              >
                <el-option
                  v-for="account in cexAccountList"
                  :key="account.id"
                  :value="account.id"
                  :label="account.accountName + '-' + account.amberAccountName"
                />
              </el-select>
            </el-form-item>

          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="showStartDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmStartTrade">确定</el-button>
          </div>
        </el-dialog>

        <el-dialog title="全局参数调整" :visible.sync="editGlobalConfig" width="800px">
          <!-- <el-select
            v-model="updateGlobalWaterLevelFormData.exchangeType"
            placeholder="请选择交易所"
            style="margin-bottom: 20px;"
            @change="getExchangeConfig"
          >
            <el-option
              v-for="item in exchangeOptions"
              :key="item.exchange"
              :label="item.exchange"
              :value="item.exchange"
            />
          </el-select> -->
          <el-descriptions border style="margin-bottom: 20px;">
            <el-descriptions-item label="Cex 账户名称">{{ updateGlobalWaterLevelFormData.cexAccountName }}</el-descriptions-item>
            <el-descriptions-item label="Dex 钱包名称">{{ updateGlobalWaterLevelFormData.dexWalletName }}</el-descriptions-item>
          </el-descriptions>
          <!-- <div v-if="updateGlobalWaterLevelFormData.exchangeType"> -->
          <el-form :model="updateGlobalWaterLevelFormData" label-width="150px">
            <h3 style="margin-top: 50px; margin-bottom: 10px;">SOL水位调节参数</h3>
            <el-form-item label="最低预警余额(U)" class="mb16">
              <el-input v-model="updateGlobalWaterLevelFormData.solWaterLevelConfig.alertThreshold" placeholder="请输入最低预警余额" />
            </el-form-item>
            <el-form-item label="低水位触发余额(U)" class="mb16">
              <el-input v-model="updateGlobalWaterLevelFormData.solWaterLevelConfig.buyTriggerThreshold" placeholder="请输入低水位触发余额" />
            </el-form-item>
            <el-form-item label="高水位触发余额(U)" class="mb16">
              <el-input v-model="updateGlobalWaterLevelFormData.solWaterLevelConfig.sellTriggerThreshold" placeholder="请输入高水位触发余额" />
            </el-form-item>
            <el-form-item label="最小充值金额阈值(U)" class="mb16">
              <el-input v-model="updateGlobalWaterLevelFormData.solWaterLevelConfig.minDepositAmountThreshold" placeholder="请输入最小充值金额阈值" />
            </el-form-item>
            <el-form-item label="最小提现金额阈值(U)" class="mb16">
              <el-input v-model="updateGlobalWaterLevelFormData.solWaterLevelConfig.minWithdrawAmountThreshold" placeholder="请输入最小提现金额阈值" />
            </el-form-item>

            <h3 style="margin-top: 30px; margin-bottom: 10px;">稳定币水位调节参数</h3>
            <el-form-item label="最低预警余额(U)" class="mb16">
              <el-input v-model="updateGlobalWaterLevelFormData.stableCoinWaterLevelConfig.alertThreshold" placeholder="请输入最低预警余额" />
            </el-form-item>
          </el-form>
          <!-- </div> -->
          <div slot="footer" class="dialog-footer">
            <el-button @click="cancelEditGlobalSolConfig">取消</el-button>
            <el-button type="primary" @click="submitUpdateGlobalSolConfig">确定</el-button>
          </div>
        </el-dialog>

        <el-dialog title="全局水位参数配置列表" :visible.sync="showGlobalConfig" width="1000px">
          <!-- <el-select
            v-model="updateGlobalWaterLevelFormData.exchangeType"
            placeholder="请选择交易所"
            style="margin-bottom: 20px;"
            @change="getExchangeConfig"
          >
            <el-option
              v-for="item in exchangeOptions"
              :key="item.exchange"
              :label="item.exchange"
              :value="item.exchange"
            />
          </el-select> -->
          <!-- <div v-if="updateGlobalWaterLevelFormData.exchangeType"> -->
          <el-table :data="accountPairList" border style="width: 100%">
            <el-table-column prop="cexAccountId" label="Cex Account ID" />
            <el-table-column prop="cexAccountName" label="Cex Account Name" />
            <el-table-column prop="dexWalletId" label="Dex Wallet ID" />
            <el-table-column prop="dexWalletName" label="Dex Wallet Name" />
            <el-table-column prop="hasGlobalConfig" label="参数是否配置">
              <template slot-scope="scope">
                <span>{{ scope.row.hasGlobalConfig ? '是' : '否' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="" @click="handleGlobalConfigEdit(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- </div> -->
          <div slot="footer" class="dialog-footer">
            <el-button @click="cancelShowGlobalSolConfig">关闭</el-button>
          </div>
        </el-dialog>

        <el-dialog title="全局参数调整" :visible.sync="editGlobalRiskConfig" width="800px">
          <template>
            <div>
              <el-tooltip content="新增风控项" placement="top">
                <el-button type="primary" icon="el-icon-plus" circle @click="addRiskItem" />
              </el-tooltip>
              <div v-for="(item, index) in riskControlItems" :key="index" class="risk-item">
                <el-form :model="item" label-width="160px">
                  <el-divider>
                    风控项{{ index + 1 }}
                    <el-tooltip content="删除风控项" placement="top">
                      <el-button type="danger" icon="el-icon-delete" circle @click="removeRiskItem(index)" />
                    </el-tooltip>
                  </el-divider>

                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="风控类型">
                        <el-select v-model="item.type" @change="handleTypeChange(item)">
                          <el-option v-for="type in riskControlTypes" :key="type.value" :label="type.label" :value="type.value" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item v-if="item.type" label="阈值">
                        <el-input v-model="item.threshold">
                          <template v-if="riskControlTypes.find((t) => t.value === item.type).isPercentage" slot="append">%</template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item v-if="item.type" label="风控等级">
                        <el-select v-model="item.action" @change="handleActionChange(item)">
                          <el-option v-for="opt in actionOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item v-if="item.action >= 2" label="恢复方式">
                        <el-select v-model="item.actionDetail.manualResume">
                          <el-option v-for="opt in resumeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item v-if="item.action >= 2 && item.actionDetail.manualResume === false" label="风控持续时间(s)">
                        <el-select v-model="item.actionDetail.pauseDuration" filterable allow-create placeholder="请输入持续时间">
                          <el-option label="次日零点" :value="-1" />
                          <el-option label="1H" :value="3600" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                </el-form>
              </div>

              <div v-if="riskControlItems.length === 0" style="min-height: 50px;" />

              <div slot="footer" class="dialog-footer">
                <el-button @click="cancelEditGlobalRiskConfig">取消</el-button>
                <el-button type="primary" @click="submitRiskConfig">提交</el-button>
              </div>

            </div>
          </template>

        </el-dialog>

        <el-dialog :title="title" :visible.sync="batchOpen" width="800px">
          <el-form ref="batchForm" :model="batchForm" :rules="rules" label-width="150px">

            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>策略基础信息</h5>
              </div>
              <el-form-item label="Target Token" prop="targetToken">
                <el-select
                  v-model="batchForm.targetToken"
                  placeholder="请选择Target Token"
                  filterable
                  allow-create
                  clearable
                  size="small"
                  style="width: 400px;"
                  @change="handleTargetTokenChange(batchForm.targetToken)"
                >
                  <el-option
                    v-for="token in targetTokenList"
                    :key="token.key"
                    :value="token.key"
                    :label="token.label"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Quote Token" prop="quoteToken">
                <el-input
                  v-model="batchForm.quoteToken"
                  placeholder="请输入Quote Token"
                />
              </el-form-item>
            </el-card>
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>DEX配置</h5>
              </div>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Market地址" prop="ammPool">
                    <el-input
                      v-model="batchForm.ammPool"
                      placeholder="请输入Market地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Token 地址" prop="tokenMint">
                    <el-input
                      v-model="batchForm.tokenMint"
                      placeholder="请输入Base Token地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Dex Type" prop="dexType">
                    <el-select
                      v-model="batchForm.dexType"
                      placeholder="请选择Dex类型"
                      clearable
                      size="small"
                      style="width: 400px;"
                    >
                      <el-option
                        v-for="dex in dexTypeList"
                        :key="dex.key"
                        :value="dex.key"
                        :label="dex.label"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="batchForm.dexType === 'RAY_CLMM'" :gutter="20" class="mb8">
                <el-col :span="8">
                  <el-form-item label="Max Array Size" prop="maxArraySize">
                    <el-input
                      v-model="batchForm.maxArraySize"
                      placeholder="请输入maxArraySize"
                      size="small"
                      style="width: 400px;"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

            </el-card>
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>Observer参数配置</h5>
              </div>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="交易所" prop="exchangeType">
                    <el-select
                      v-model="batchForm.exchangeType"
                      placeholder="请选择交易所"
                      clearable
                      size="small"
                      style="width: 400px;"
                    >
                      <el-option
                        v-for="symbol in exchangeType"
                        :key="symbol.value"
                        :value="symbol.value"
                      />

                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="4" class="mb8">
                <el-form-item label="Min Amount" prop="minQuoteAmount">
                  <el-input
                    v-model="batchForm.minQuoteAmount"
                    placeholder="请输入最小Quote交易量"
                  />
                </el-form-item>
                <el-form-item label="Max Amount" prop="maxQuoteAmount">
                  <el-input
                    v-model="batchForm.maxQuoteAmount"
                    placeholder="请输入最大Quote交易量"
                  />
                </el-form-item>
                <el-form-item label="Bid Depth" prop="bidDepth">
                  <el-input
                    v-model="batchForm.bidDepth"
                    placeholder="请输入bid深度"
                  />
                </el-form-item>
                <el-form-item label="Ask Depth" prop="askDepth">
                  <el-input
                    v-model="batchForm.askDepth"
                    placeholder="请输入ask深度"
                  />
                </el-form-item>

                <!--                <el-form-item label="指定滑点BPS" prop="slippageBpsRate" class="mb16">-->
                <!--                  <el-slider-->
                <!--                    v-model="batchForm.slippageBpsRate"-->
                <!--                    show-input-->
                <!--                    step="0.01"-->
                <!--                    :precision="2"-->
                <!--                    :max="10"-->
                <!--                  >-->
                <!--                    <template slot="append">%</template>-->
                <!--                  </el-slider>-->
                <!--                </el-form-item>-->
                <el-form-item label="触发套利利润比例" prop="profitTriggerRate">
                  <el-slider
                    v-model="batchForm.profitTriggerRate"
                    show-input
                    step="0.01"
                    :precision="2"
                    :max="1"
                  >
                    <template slot="append">%</template>
                  </el-slider>
                </el-form-item>
                <!--                <el-form-item label="价差持续时间" prop="triggerHoldingMs">-->
                <!--                  <el-input v-model="batchForm.triggerHoldingMs" placeholder="请输入触发套利的价差持续时间" />-->
                <!--                </el-form-item>-->
                <!--                <el-form-item label="Priority Fee(SOL)" prop="priorityFee">-->
                <!--                  <el-input v-model="batchForm.priorityFee" placeholder="请指定优先费" />-->
                <!--                </el-form-item>-->
                <!--                <el-form-item label="Jito Fee(SOL)" prop="jitoFee">-->
                <!--                  <el-input v-model="batchForm.jitoFee" placeholder="请指定jito手续费" />-->
                <!--                </el-form-item>-->
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-form-item label="Taker Fee" prop="takerFee">
                  <el-input
                    v-model="batchForm.takerFee"
                    placeholder="请输入交易所taker fee"
                  />
                </el-form-item>
              </el-row>
            </el-card>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitBatchForm">确定</el-button>
            <el-button @click="batchOpen = false">取消</el-button>
          </div>
        </el-dialog>

        <el-dialog title="水位调节状态" :visible.sync="showWaterLevelStateDetail" width="600px">
          <p>当前水位调节状态：</p>
          <p>TaskType: {{ waterLevelTaskState.taskType }}</p>
          <p>TaskStep: {{ waterLevelTaskState.taskStep }}</p>
          <p>TaskStatus: {{ waterLevelTaskState.taskStatus }}</p>
          <p>TaskError: {{ waterLevelTaskState.taskError }}</p>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  batchAddBusDexCexTriangularObserver,
  busDexCexTriangularStartTrader,
  busDexCexTriangularStopTrader, busDexCexTriangularUpdateGlobalWaterLevel,
  delBusDexCexTriangularObserver,
  getBusDexCexTriangularObserver,
  listBusDexCexTriangularObserver,
  listBusDexCexTriangularSymbolList,
  busDexCexTriangularGetGlobalRiskConfig, busDexCexTriangularUpdateGlobalRiskConfig,
  busDexCexTriangularStopAllTraders,
  listBusDexCexTriangularDexWalletlList,
  listBusDexCexTriangularCexAccountList,
  listBusDexCexTriangularExchangeList,
  busDexCexTriangularGetGlobalWaterLevel,
  getBoundAccountList,
  getCanBoundAccountList,
  getActiveAccountPairs,
  getRealtimeInterestRate,
  busDexCexTriangularGetWaterLevelDetail,
  getLatestObserverConfigByTargetToken
} from '@/api/business/bus-dex-cex-triangular-observer'

export default {
  name: 'BusDexCexTriangularObserver',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 批量添加弹出层
      batchOpen: false,
      isEdit: false,
      editGlobalConfig: false, // 全局参数调节编辑开关
      showGlobalConfig: false, // 全局水位参数列表展示弹框开关
      editGlobalRiskConfig: false, // 全局风控参数编辑开关
      stopAllDialogVisible: false, // 暂停全部交易弹框开关
      isQuickMode: true, // 设置水位调节参数是否是快速模式
      waterLevelMultiplier: 0,
      showWaterLevelStateDetail: false, // 显示水位调节状态弹窗
      waterLevelTaskState: {
        taskType: 'Test',
        taskStep: 'Test',
        taskStatus: 'Test',
        taskError: 'Test'
      }, // 水位调节状态详情
      targetTokenList: {}, // 目标Token列表
      // 类型数据字典
      typeOptions: [],
      busDexCexTriangularObserverList: [],
      // 观察币对列表
      symbolWatchList: [],
      // dex钱包列表
      dexWalletList: [],
      // cex账户列表
      cexAccountList: [],
      // 账户组列表
      accountPairList: [],
      // 借贷利率
      loanRate: undefined,

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        symbols: []

      },

      // 表单参数
      form: {
      },
      batchForm: {
        symbols: [],
        targetToken: [],
        quoteToken: undefined,
        ammPool: undefined,
        tokenMint: undefined,
        slippageBpsRate: undefined,
        minQuoteAmount: undefined,
        maxQuoteAmount: undefined,
        bidDepth: 20,
        askDepth: 20,
        exchangeType: undefined,
        dexType: undefined,
        takerFee: undefined,
        maxArraySize: undefined,
        triggerProfitQuoteAmount: undefined
      },
      // 全局水位调节表单数据
      updateGlobalWaterLevelFormData: {
        solWaterLevelConfig: {},
        stableCoinWaterLevelConfig: {}
      },
      exchangeType: [
        { key: 'Binance', value: 'Binance' },
        { key: 'OKX', value: 'OKX' },
        { key: 'GateIO', value: 'GateIO' }
      ],
      dexTypeList: [
        { key: 'RAY_AMM', label: 'Raydium Liquidity Pool V4' },
        { key: 'RAY_CLMM', label: 'Raydium Centralized Liquidity' },
        { key: 'ORCA_WHIRL_POOL', label: 'Orca Whirl Pool' }
      ],

      showStartDialog: false, // 控制启动trader表单弹窗显示
      startTradingDialogData: {}, // 启动交易对话框存储数据
      showEditTraderDialog: false, // 控制编辑trader参数的弹窗显示
      currentRow: null, // 当前选中的行数据
      startTraderFormData: {
        instanceId: undefined,
        alertThreshold: 0,
        buyTriggerThreshold: 0,
        targetBalanceThreshold: undefined,
        sellTriggerThreshold: 0,
        priorityFee: undefined,
        jitoFeeRate: undefined
      },
      originalMinQuoteAmount: {}, // 记录原始值，方便取消恢复
      originalMaxQuoteAmount: {}, // 记录原始值，方便取消恢复

      riskControlItems: [], // 存储风控项的数组
      riskControlTypes: [ // 预设可选风控类型
        { label: '单笔交易亏损金额阈值', value: 'absoluteLossThreshold', isPercentage: false },
        { label: '单笔交易亏损比例阈值', value: 'relativeLossThreshold', isPercentage: true },
        { label: '单币种交易日亏损阈值', value: 'symbolDailyMaxLossThreshold', isPercentage: false }
      ],
      actionOptions: [
        { label: '预警', value: 1 },
        { label: '暂停当前实例交易', value: 2 }
        // { label: '暂停全局交易', value: 3 }
      ],
      resumeOptions: [
        { label: '人工恢复', value: true },
        { label: '自动恢复', value: false }
      ],

      // 表单校验
      rules: {
        targetToken: [{ required: true, message: '至少指定一个Target Token', trigger: 'blur' }],
        quoteToken: [{ required: true, message: '至少指定一个Quote Token', trigger: 'blur' }],
        ammPool: [{ required: true, message: 'ammPool不能为空', trigger: 'blur' }],
        slippageBpsRate: [{ required: true, message: '请设置滑点', trigger: 'blur' }],
        bidDepth: [{ required: true, message: '请设置bid订单深度', trigger: 'blur' }],
        askDepth: [{ required: true, message: '请设置ask订单深度', trigger: 'blur' }],
        minQuoteAmount: [{ required: true, message: '请设置最小交易金额', trigger: 'blur' }],
        maxQuoteAmount: [{ required: true, message: '请设置最大交易金额', trigger: 'blur' }],
        takerFee: [{ required: true, message: '请设置交易所taker手续费', trigger: 'blur' }],
        exchangeType: [{ required: true, message: '请选择交易所', trigger: 'blur' }],
        profitTriggerRate: [{ required: true, message: '请输入触发套利的最小利润', trigger: 'blur' }],
        // triggerHoldingMs: [{ required: true, message: '请输入触发套利的最小持续时间', trigger: 'blur' }],
        priorityFee: [{ required: true, message: '请输入交易优先费', trigger: 'blur' }],
        jitoFeeRate: [{ required: true, message: '请输入jito费比例', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getSymbolWatchList()
    this.getDexWalletList()
    this.startTimer()
  },
  mounted() {
    window.addEventListener('focus', this.handleFocus)
    window.addEventListener('blur', this.handleBlur)
  },
  beforeDestroy() {
    this.clearTimer() // 组件销毁前清除定时器
    window.removeEventListener('focus', this.handleFocus)
    window.removeEventListener('blur', this.handleBlur)
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      console.log('this.queryParams', this.queryParams)
      listBusDexCexTriangularObserver(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        if (response.code === 200) { // 检查响应状态码
          // 正确的做法是替换整个数组，而不是修改数组的引用
          this.busDexCexTriangularObserverList = response.data.list
          this.total = response.data.count
        } else {
          this.msgError(response.msg)
        }
        this.loading = false
      }).catch((error) => { // 添加错误处理
        this.loading = false
        this.msgError('获取列表数据失败：' + error)
      })
    },
    /** 查询观察币种 */
    getSymbolWatchList() {
      this.loading = true
      listBusDexCexTriangularSymbolList().then(response => {
        this.symbolWatchList = [...response.data]
        this.targetTokenList = response.data.map(item => {
          if (typeof item.symbol === 'string') {
            const targetToken = item.symbol.split('/')[0]
            return { key: targetToken, label: targetToken } // 返回 { key, label } 对象
          } else {
            // 如果 symbol 不是字符串，你可能需要根据实际数据结构来决定 key 和 label 的值
            return { key: item.symbol, label: item.symbol } // 假设直接使用 symbol 作为 key 和 label
          }
        })
        this.loading = false
      }
      )
    },
    // targetToken 变化时的处理函数
    handleTargetTokenChange(token) {
      console.log('handleTargetTokenChange', token)
      if (token === undefined || token === null || token === '') {
        this.batchForm = {}
        return
      }
      // 尝试获取最新一次的token配置
      getLatestObserverConfigByTargetToken(token).then(response => {
        if (response.code === 200) {
          this.batchForm = response.data
          this.batchForm.targetToken = token
        }
        console.log('batchForm', this.batchForm)
      }).catch(error => {
        console.error('获取最新配置失败：', error)
      })
    },
    /** 查询dex钱包列表 */
    getDexWalletList() {
      this.loading = true
      listBusDexCexTriangularDexWalletlList().then(response => {
        this.dexWalletList = response.data
        this.loading = false
      }
      )
    },
    /** 查询dex钱包列表 */
    getCexAccountList(exchange) {
      this.loading = true
      listBusDexCexTriangularCexAccountList(exchange).then(response => {
        this.cexAccountList = response.data
        this.loading = false
      }
      )
    },
    handleCexChange() {
      console.log('handleCexChange')
      this.getRelatedDexWalletList()
      this.checkAndFetchLoanRates()
    },
    handleDexChange() {
      this.getRelatedCexAccountList()
    },

    // 新增检查方法
    checkAndFetchLoanRates() {
      console.log('checkAndFetchLoanRates')
      if (this.shouldFetchRates()) {
        console.log('true')
        this.fetchLoanRate()
      } else {
        console.log('false')
        this.clearRates()
      }
    },

    // 判断是否需要获取利率
    shouldFetchRates() {
      return this.startTraderFormData.cexAccount
    },

    // 清空利率显示
    clearRates() {
      this.loanRate = null
      this.loanRatesError = null
    },

    // 获取借贷利率
    fetchLoanRate() {
      console.log('this.startTraderFormData', this.startTraderFormData)
      const params = {
        cexAccount: this.startTraderFormData.cexAccount,
        exchangeType: this.startTradingDialogData.exchangeType,
        currency: this.startTradingDialogData.targetToken
      }
      getRealtimeInterestRate(params).then(response => {
        if (response.code === 200) {
          this.loanRate = response.data.interestRate
        } else {
          this.loanRatesError = response.msg
        }
      }).catch(error => {
        this.loanRatesError = error.message
      })
    },

    getRelatedCexAccountList() {
      const exchangeType = this.startTradingDialogData.exchangeType
      if (this.startTraderFormData.dexWallet === '') {
        // 用户清除了选项
        if (this.startTraderFormData.cexAccount === '' || this.startTraderFormData.dexWallet === undefined) {
          // cex和dex都未选中
          this.getDexWalletList()
          this.getCexAccountList(exchangeType)
        }
      } else {
        // 用户选中了某dex
        if (this.startTraderFormData.cexAccount === '' || this.startTraderFormData.cexAccount === undefined) {
          // 用户只是选中了dex，未选中cex, 获取是否有已绑定的cex账户
          const queryParams = {
            accountType: 'Dex',
            accountId: this.startTraderFormData.dexWallet
          }
          getBoundAccountList(queryParams).then(response => {
            if (response.code === 200) {
              if (response.data.cexAccountList !== null) {
                this.cexAccountList = response.data.cexAccountList
              } else {
                // 获取可以被绑定的账号
                getCanBoundAccountList(queryParams).then(response => {
                  this.cexAccountList = response.data.cexAccountList
                })
              }
            } else {
              this.msgError(response.msg)
            }
          })
        }
      }
    },
    getRelatedDexWalletList() {
      const exchangeType = this.startTradingDialogData.exchangeType
      if (this.startTraderFormData.cexAccount === '') {
        // 用户清除了选项
        if (this.startTraderFormData.dexWallet === '' || this.startTraderFormData.dexWallet === undefined) {
          // cex和dex都未选中
          this.getDexWalletList()
          this.getCexAccountList(exchangeType)
        }
      } else {
        // 用户选中了某cex
        if (this.startTraderFormData.dexWallet === '' || this.startTraderFormData.dexWallet === undefined) {
          // 用户只是选中了cex，未选中dex, 获取是否有已绑定的dex账户
          const queryParams = {
            accountType: 'Cex',
            accountId: this.startTraderFormData.cexAccount
          }
          getBoundAccountList(queryParams).then(response => {
            if (response.code === 200) {
              if (response.data.dexWalletList !== null) {
                this.dexWalletList = response.data.dexWalletList
              } else {
                // 获取可以被绑定的账号
                getCanBoundAccountList(queryParams).then(response => {
                  this.dexWalletList = response.data.dexWalletList
                })
              }
            } else {
              this.msgError(response.msg)
            }
          })
        }
      }
    },
    getExchangeConfig() {
      const selectedExchange = this.updateGlobalWaterLevelFormData.exchangeType
      busDexCexTriangularGetGlobalWaterLevel(this.updateGlobalWaterLevelFormData.exchangeType).then(response => {
        this.updateGlobalWaterLevelFormData = response.data
        this.updateGlobalWaterLevelFormData.exchangeType = selectedExchange //
      })
    },
    startTimer() {
      if (this.timer) {
        clearInterval(this.timer) // 如果定时器已存在，先清除
      }
      this.timer = setInterval(() => {
        this.getList()
      }, 5000) // 每 5 秒刷新一次
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    handleFocus() {
      console.log('页面获取焦点')
      this.startTimer()
    },
    handleBlur() {
      console.log('页面失去焦点')
      this.clearTimer()
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined
      }
      this.batchForm = {
        symbol: [],
        bidDepth: 20,
        askDepth: 20
        // slippageBpsRate: undefined
      }
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    // 关系
    // 文件
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleBatchAdd() {
      this.reset()
      this.batchOpen = true
      this.title = '添加链上链下三角套利观察'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
        row.id || this.ids
      getBusDexCexTriangularObserver(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改链上链下三角套利观察'
        this.isEdit = true
      })
    },
    // 开启编辑全局参数弹窗
    handleEditGlobalConfig() {
      listBusDexCexTriangularExchangeList().then(response => {
        this.editGlobalConfig = true
      })
    },
    handleGlobalConfigEdit(row) {
      console.log('编辑全局水位参数')
      // 初始化 solWaterLevelConfig 和 stableCoinWaterLevelConfig，避免后续访问 null 属性
      if (row.solanaConfig) {
        this.updateGlobalWaterLevelFormData.solWaterLevelConfig = { ...row.solanaConfig }
      } else {
        this.updateGlobalWaterLevelFormData.solWaterLevelConfig = {} // 或设置默认值
      }

      if (row.stableCoinConfig) {
        this.updateGlobalWaterLevelFormData.stableCoinWaterLevelConfig = { ...row.stableCoinConfig }
      } else {
        this.updateGlobalWaterLevelFormData.stableCoinWaterLevelConfig = {} // 或设置默认值
      }
      this.updateGlobalWaterLevelFormData.cexAccountId = row.cexAccountId
      this.updateGlobalWaterLevelFormData.dexWalletId = row.dexWalletId
      this.updateGlobalWaterLevelFormData.cexAccountName = row.cexAccountName
      this.updateGlobalWaterLevelFormData.dexWalletName = row.dexWalletName
      this.showGlobalConfig = false
      this.editGlobalConfig = true
    },
    // 打开全局参数设置弹窗，展示账户组列表
    handleShowGlobalConfig() {
      getActiveAccountPairs().then(response => {
        if (response.code === 200) {
          this.accountPairList = response.data
          this.showGlobalConfig = true
        } else {
          this.msgError(response.msg)
          this.showGlobalConfig = false
        }
      })
    },
    // 取消编辑全局参数弹窗
    cancelEditGlobalSolConfig() {
      this.editGlobalConfig = false
      this.showGlobalConfig = true
    },
    // 取消编辑全局参数弹窗
    cancelShowGlobalSolConfig() {
      this.showGlobalConfig = false
    },
    handleModeChange(maxQuoteAmount, targetTokenQuotePrice) {
      if (this.isQuickMode) {
        this.calculateWaterLevels(maxQuoteAmount, targetTokenQuotePrice)
      }
    },

    calculateWaterLevels(maxQuoteAmount, targetTokenQuotePrice) {
      const baseAmount = Math.ceil(maxQuoteAmount / targetTokenQuotePrice)
      this.startTraderFormData.alertThreshold = baseAmount * this.waterLevelMultiplier
      this.startTraderFormData.buyTriggerThreshold = baseAmount * 4 * this.waterLevelMultiplier
      this.startTraderFormData.sellTriggerThreshold = baseAmount * 6 * this.waterLevelMultiplier
    },

    // 开启编辑全局风控参数弹窗
    handleEditGlobalRiskConfig() {
      this.riskControlItems = []
      // this.updateGlobalRiskControlFormData = {}
      busDexCexTriangularGetGlobalRiskConfig().then(response => {
        const data = response.data || {} // 确保 data 不为空

        this.riskControlItems = [
          ...(data.absoluteLossThreshold || []).map(item => ({
            ...item,
            type: 'absoluteLossThreshold', // 这里加一个类型标识，方便后续回显
            threshold: this.convertThresholdForDisplay('absoluteLossThreshold', item.threshold)
          })),
          ...(data.relativeLossThreshold || []).map(item => ({
            ...item,
            type: 'relativeLossThreshold',
            threshold: this.convertThresholdForDisplay('relativeLossThreshold', item.threshold)
          })),
          ...(data.symbolDailyMaxLossThreshold || []).map(item => ({
            ...item,
            type: 'symbolDailyMaxLossThreshold',
            threshold: this.convertThresholdForDisplay('symbolDailyMaxLossThreshold', item.threshold)
          }))
        ]

        this.editGlobalRiskConfig = true
      })
    },
    // 开启暂停所有交易的确认弹窗
    handleStopAllTrades() {
      this.stopAllDialogVisible = true
    },
    // 关闭暂停所有交易的确认弹窗
    cancelStopAllTrades() {
      this.stopAllDialogVisible = false
    },
    // 阈值回显转换方法
    convertThresholdForDisplay(type, threshold) {
      const typeConfig = this.riskControlTypes.find(t => t.value === type)
      if (typeConfig?.isPercentage) {
        return (parseFloat(threshold) * 100).toFixed(2) // 转换为百分比并保留两位小数
      }
      return threshold
    },
    // 取消编辑全局风控参数弹窗
    cancelEditGlobalRiskConfig() {
      this.editGlobalRiskConfig = false
    },
    addRiskItem() {
      this.riskControlItems.push({
        type: '',
        threshold: '',
        action: null,
        actionDetail: {}
      })
    },
    removeRiskItem(index) {
      this.riskControlItems.splice(index, 1)
    },
    handleTypeChange(item) {
      const selectedType = this.riskControlTypes.find((t) => t.value === item.type)
      item.isPercentage = selectedType?.isPercentage || false
    },
    handleActionChange(item) {
      if (item.action === 1) {
        item.actionDetail = {}
      }
    },
    submitRiskConfig() {
      const formattedData = {}

      this.riskControlItems.forEach((item) => {
        const typeConfig = this.riskControlTypes.find(t => t.value === item.type)
        let threshold = Number(item.threshold)

        if (typeConfig?.isPercentage) {
          threshold = parseFloat(threshold) / 100 // 百分比类型的阈值转换成小数
        }

        if (!formattedData[item.type]) formattedData[item.type] = []
        formattedData[item.type].push({
          threshold: threshold,
          action: item.action,
          actionDetail: item.actionDetail
        })
      })

      busDexCexTriangularUpdateGlobalRiskConfig(formattedData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.editGlobalRiskConfig = false
        } else {
          this.msgError(res.msg)
          this.editGlobalRiskConfig = false
        }
      })
    },

    // 提交批量添加
    submitBatchForm() {
      const targetTokenArray = [this.batchForm.targetToken]

      const requestData = { ...this.batchForm }
      requestData.takerFee = Number(requestData.takerFee)
      requestData.minQuoteAmount = Number(requestData.minQuoteAmount)
      requestData.maxQuoteAmount = Number(requestData.maxQuoteAmount)
      requestData.bidDepth = Number(requestData.bidDepth)
      requestData.askDepth = Number(requestData.askDepth)
      requestData.maxArraySize = Number(requestData.maxArraySize)
      requestData.decimals = Number(requestData.decimals)
      requestData.profitTriggerRate = Number(requestData.profitTriggerRate) / 100
      // requestData.triggerHoldingMs = Number(requestData.triggerHoldingMs)
      // requestData.slippageBpsRate = Number(requestData.slippageBpsRate) / 100
      if (requestData.minQuoteAmount > requestData.maxQuoteAmount) {
        this.$message.error('最大交易金额必须大于最小交易金额')
        return
      }

      requestData.targetToken = targetTokenArray

      // 批量请求
      batchAddBusDexCexTriangularObserver(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.batchOpen = false
          this.batchForm = []
          this.getList()
        } else {
          this.msgError(res.msg)
          this.batchOpen = false
          this.batchForm = []
          this.getList()
        }
      })
    },
    // 提交全局水位参数配置
    submitUpdateGlobalSolConfig() {
      const requestData = { ...this.updateGlobalWaterLevelFormData }
      requestData.solWaterLevelConfig.alertThreshold = Number(requestData.solWaterLevelConfig.alertThreshold)
      requestData.solWaterLevelConfig.buyTriggerThreshold = Number(requestData.solWaterLevelConfig.buyTriggerThreshold)
      requestData.solWaterLevelConfig.sellTriggerThreshold = Number(requestData.solWaterLevelConfig.sellTriggerThreshold)
      requestData.solWaterLevelConfig.minDepositAmountThreshold = Number(requestData.solWaterLevelConfig.minDepositAmountThreshold)
      requestData.solWaterLevelConfig.minWithdrawAmountThreshold = Number(requestData.solWaterLevelConfig.minWithdrawAmountThreshold)
      requestData.stableCoinWaterLevelConfig.alertThreshold = Number(requestData.stableCoinWaterLevelConfig.alertThreshold)
      requestData.exchangeType = this.updateGlobalWaterLevelFormData.exchangeType

      busDexCexTriangularUpdateGlobalWaterLevel(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.editGlobalConfig = false
          this.showGlobalConfig = true
          this.handleShowGlobalConfig()
        } else {
          this.msgError(res.msg)
          this.editGlobalConfig = false
          this.showGlobalConfig = true
          this.handleShowGlobalConfig()
        }
      })
    },
    confirmStopAllTrades() {
      busDexCexTriangularStopAllTraders().then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.stopAllDialogVisible = false
          this.getList()
        } else {
          this.msgError(res.msg)
          this.stopAllDialogVisible = false
          this.getList()
        }
      })
    },

    // 打开启动交易表单
    openStartTradeDialog(row) {
      this.currentRow = row
      this.resetStartTraderFormData()
      this.getCexAccountList(row.exchangeType)
      this.startTradingDialogData.symbol = row.symbol
      this.startTradingDialogData.maxQuoteAmount = row.maxQuoteAmount
      this.startTradingDialogData.targetTokenQuotePrice = row.cexBuyPrice
      this.startTradingDialogData.exchangeType = row.exchangeType
      this.startTradingDialogData.targetToken = row.targetToken
      if (row.cexBuyPrice === 0) {
        this.isQuickMode = false
      }
      this.loanRate = null
      this.showStartDialog = true
    },

    // 重置表单数据
    resetStartTraderFormData() {
      this.startTraderFormData = {
        id: undefined,
        alertThreshold: undefined,
        buyTriggerThreshold: undefined,
        targetBalanceThreshold: undefined,
        sellTriggerThreshold: undefined,
        slippageBpsRate: '',
        priorityFee: '',
        jitoFeeRate: ''
      }
      this.waterLevelMultiplier = 0
    },

    // 确认启动交易
    confirmStartTrade() {
      const requestData = { ...this.startTraderFormData }
      requestData.id = this.currentRow.id
      requestData.alertThreshold = Number(requestData.alertThreshold)
      requestData.buyTriggerThreshold = Number(requestData.buyTriggerThreshold)
      requestData.targetBalanceThreshold = Number(requestData.targetBalanceThreshold)
      requestData.minDepositAmountThreshold = Number(requestData.minDepositAmountThreshold)
      requestData.minWithdrawAmountThreshold = Number(requestData.minWithdrawAmountThreshold)
      requestData.sellTriggerThreshold = Number(requestData.sellTriggerThreshold)
      requestData.slippageBpsRate = Number(requestData.slippageBpsRate) / 100
      requestData.priorityFee = Number(requestData.priorityFee)
      requestData.jitoFeeRate = Number(Number(requestData.jitoFeeRate) / 100)

      busDexCexTriangularStartTrader(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getList()
        } else {
          this.msgError(res.msg)
          this.getList()
        }
        this.showStartDialog = false
        this.loanRate = null
      })
    },

    // 暂停交易
    pauseTrader(row) {
      const requestData = {
        id: row.id
      }
      busDexCexTriangularStopTrader(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getList()
        } else {
          this.msgError(res.msg)
          this.getList()
        }
      })
    },
    // 展示水位调节状态
    showWaterLevelState(row) {
      console.log('showWaterLevelState')
      const requestData = {
        id: row.id
      }
      busDexCexTriangularGetWaterLevelDetail(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.waterLevelTaskState = res.data
          this.showWaterLevelStateDetail = true
        } else {
          this.msgError(res.msg)
          this.getList()
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      var Ids = row.id

      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusDexCexTriangularObserver({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {
      })
    },

    formatProfit(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }
      let numStr = cellValue.toString()

      // 处理科学计数法
      if (numStr.includes('e')) {
        const [base, exponent] = numStr.split('e').map(Number)
        numStr = (base * Math.pow(10, exponent)).toFixed(20)
      }

      const [intPart, rawDecPart] = numStr.split('.')
      const decPart = rawDecPart || ''

      // 如果整数部分不为 0，直接保留 6 位小数
      if (intPart !== '0' && intPart !== '-0') {
        return Number(numStr).toFixed(6) + ' ' + row.quoteToken
      }

      // 计算小数部分前导 0 的个数
      let leadingZeros = 0
      for (const char of decPart) {
        if (char === '0') leadingZeros++
        else break
      }

      // 获取 4 位有效数字
      const significantDigits = decPart.slice(leadingZeros, leadingZeros + 6)
      if (leadingZeros > 3) {
        return `0.0{${leadingZeros - 1}}${significantDigits}` + ' ' + row.quoteToken
      }

      return Number(numStr).toFixed(leadingZeros + 6) + ' ' + row.quoteToken
    },
    formatDexType(row) {
      const match = this.dexTypeList.find(item => item.key === row.dexType)
      return match ? match.label : row.dexType // 如果匹配不到，就显示原始值
    }
  }
}
</script>

<style scoped>
.table-container {
  overflow-x: auto; /* 添加水平滚动条 */
}

/* 表头和内容对齐 */
.table-container th,
.table-container td {
  text-align: center; /* 设置文字居中 */
}
.action-buttons {
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
  white-space: nowrap; /* 防止按钮换行 */
  align-items: center;
}
.vertical-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 按钮之间的间距 */
}
</style>

<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="12">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="策略实例" prop="strategyInstance">
          <el-select
            v-model="queryParams.strategyInstanceId"
            placeholder="请选择策略实例"
            clearable
            filterable
            size="small"
            @change="queryDashBoardByInstanceId(queryParams.strategyInstanceId)"
          >
            <el-option
              v-for="instance in strategyInstanceList"
              :key="instance.key"
              :label="instance.value"
              :value="instance.key"
            />
          </el-select>
        </el-form-item>
      </el-form></el-row>

    <el-row :gutter="12">
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="总资产" total="$ 12111.23">
          <el-tooltip slot="action" class="item" effect="dark" content="统计策略所有账户的总资产" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <trend flag="top" style="margin-right: 16px;" rate="12">
              <span slot="term">已实现收益</span>
            </trend>
            <trend flag="bottom" rate="11">
              <span slot="term">未实现收益</span>
            </trend>
          </div>
          <template slot="footer">当日总收益<span>$ 234.56</span></template>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="资产走势" :total="8846">
          <el-tooltip slot="action" class="item" effect="dark" content="统计策略所有账户的资产走势" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-area />
          </div>
          <template slot="footer">资产走势<span> {{ '1234' }}</span></template>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="总套利次数" :total="6560">
          <el-tooltip slot="action" class="item" effect="dark" content="统计该实例总的套利次数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-bar />
          </div>
          <template slot="footer">胜率 <span>60%</span></template>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="总套利次数" total="78%">
          <el-tooltip slot="action" class="item" effect="dark" content="统计该实例总的套利次数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-progress color="rgb(19, 194, 194)" :target="80" :percentage="78" height="8px" />
          </div>
          <template slot="footer">
            <trend flag="top" style="margin-right: 16px;" rate="12">
              <span slot="term">同周比</span>
            </trend>
            <trend flag="bottom" rate="80">
              <span slot="term">日环比</span>
            </trend>
          </template>
        </chart-card>
      </el-col>
    </el-row>

    <el-card :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <el-tabs>
          <el-tab-pane label="盈亏金额">
            <el-row>
              <el-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar :list="barData" title="销售额排行" />
              </el-col>
              <el-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="门店销售排行榜" :list="rankList" />
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="套利次数">
            <el-row>
              <el-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar :list="barData2" title="销售额趋势" />
              </el-col>
              <el-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="门店销售排行榜" :list="rankList" />
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

  </div>
</template>

<script>
import ChartCard from '@/components/ChartCard'
import Trend from '@/components/Trend'
import MiniArea from '@/components/MiniArea'
import MiniBar from '@/components/MiniBar'
import MiniProgress from '@/components/MiniProgress'
import RankList from '@/components/RankList/index'
import Bar from '@/components/Bar.vue'
import { listBusStrategyInstance } from '@/api/business/bus-strategy-instance'

const barData = []
const barData2 = []
for (let i = 0; i < 12; i += 1) {
  barData.push({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200
  })
  barData2.push({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200
  })
}

const rankList = []
for (let i = 0; i < 7; i++) {
  rankList.push({
    name: '白鹭岛 ' + (i + 1) + ' 号店',
    total: 1234.56 - i * 100
  })
}

export default {
  name: 'DashboardAdmin',
  components: {
    ChartCard,
    Trend,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar
  },
  data() {
    return {
      barData,
      barData2,
      rankList,
      busStrategyDashBoardInfo: undefined, // 返回的dashboard对象数据
      // 查询参数
      queryParams: {
        strategyInstanceId: undefined // 策略实例id
      },
      strategyInstanceList: []
    }
  },
  created() {
    this.getInstanceList()
  },
  methods: {
    // 获取策略实例列表
    getInstanceList() {
      this.getItems(listBusStrategyInstance, undefined).then(res => {
        this.strategyInstanceList = this.setItems(res, 'id', 'strategyName')
      })
    },
    // 根据实例id获取dashboard数据
    queryDashBoardByInstanceId(instanceId) {
      // 获取统计数据，包含总资产，资产变化，总套利次数，套利胜率等数据

      // 获取套利记录列表

    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 12px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

::v-deep .el-tabs__item{
   padding-left: 16px!important;
   height: 50px;
   line-height: 50px;
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

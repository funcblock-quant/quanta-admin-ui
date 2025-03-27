<template>
  <BasicLayout>
    <template #wrapper>
      <div v-if="!bind2FAMode && !unbind2FAMode">
        <el-row :gutter="10">
          <el-col :span="6" :xs="24">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>个人信息</span>
              </div>
              <div>
                <div class="text-center">
                  <userAvatar :user="user" />
                </div>
                <ul class="list-group list-group-striped">
                  <li class="list-group-item">
                    <svg-icon icon-class="user" />用户名称
                    <div class="pull-right">{{ user.username }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon icon-class="phone" />手机号码
                    <div class="pull-right">{{ user.phone }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon icon-class="email" />用户邮箱
                    <div class="pull-right">{{ user.email }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon icon-class="peoples" />所属角色
                    <div class="pull-right">{{ roleName }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon icon-class="date" />创建日期
                    <div class="pull-right">{{ user.createdAt }}</div>
                  </li>
                </ul>
              </div>
            </el-card>
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>安全中心</span>
              </div>
              <div>
                <svg-icon icon-class="user" />2FA认证
                <el-switch
                  v-model="twoFABound"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  class="pull-right"
                  @change="handle2FAUpdate"
                />
              </div>
            </el-card>
          </el-col>
          <el-col :span="18" :xs="24">
            <el-card>
              <div slot="header" class="clearfix">
                <span>基本资料</span>
              </div>
              <el-tabs v-model="activeTab">
                <el-tab-pane label="基本资料" name="userinfo">
                  <userInfo :user="user" />
                </el-tab-pane>
                <el-tab-pane label="修改密码" name="resetPwd">
                  <resetPwd :user="user" />
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div v-else-if="unbind2FAMode && !bind2FAMode">
        <template>
          <el-card class="two-fa-card" shadow="always">
            <template #header>
              <div class="card-header">
                <h2>解除2FA绑定</h2>
              </div>
            </template>
            <div>
              <el-input v-model="verifyRequest.twoFaCode" placeholder="输入 6 位验证码" maxlength="6" />
              <div class="button-group" style="margin: 20px 0">
                <el-button type="primary" :loading="loading" @click="unbind2Fa">解绑</el-button>
                <el-button @click="cancel2FABind">返回</el-button>
              </div>
            </div>
          </el-card>
        </template></div>

      <div v-else>
        <template>
          <el-card class="two-fa-card" shadow="always">
            <template #header>
              <div class="card-header">
                <h2>两步验证 (2FA) 设置</h2>
              </div>
            </template>

            <div>
              <h3>第一步：准备验证器应用</h3>
              <p>在您的手机上下载并安装一个验证器应用，例如 Google Authenticator、Authy 或 Microsoft Authenticator。</p>
              <p>如果您已经安装了验证器应用，请继续下一步。</p>

              <h3>第二步：扫描二维码或输入密钥</h3>
              <p>打开您的验证器应用，并扫描以下二维码：</p>
              <div v-if="qrCodeUrl" class="qr-code-container">
                <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code">
              </div>
              <el-skeleton v-else animated style="margin: 0 auto;" />
              <p v-if="secretKey" class="secret-key">或手动输入密钥：{{ secretKey }}</p>
              <el-skeleton v-else animated style="margin: 10px auto;" />
              <div class="button-group">
                <el-button type="primary" :loading="loading" @click="getQrCode">重新获取二维码</el-button>
              </div>

              <h3>第三步：验证</h3>
              <p>在您的验证器应用中，找到刚刚添加的账户，并输入当前显示的 6 位验证码：</p>
              <el-input v-model="verifyRequest.twoFaCode" placeholder="输入 6 位验证码" maxlength="6" />
              <div class="button-group" style="margin: 20px 0">
                <el-button type="primary" :loading="loading" @click="verifyCode">验证</el-button>
                <el-button @click="cancel2FABind">返回</el-button>
              </div>
            </div>
          </el-card>
        </template>
      </div>
    </template>
  </BasicLayout>
</template>

<script>
import userAvatar from './userAvatar'
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import { get2FaCode, getUserProfile, unbind2FaVerify, verify2FaCode } from '@/api/admin/sys-user'

export default {
  name: 'Profile',
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTab: 'userinfo',
      roleIds: undefined,
      postIds: undefined,
      roleName: undefined,
      postName: undefined,
      bind2FAMode: false, // 绑定2FA模式
      unbind2FAMode: false, // 解绑2FA模式
      twoFABound: false, // 绑定2FA模式
      qrCodeUrl: null,
      secretKey: null,
      verifyRequest: {
        twoFaCode: ''
      },
      loading: false,
      errorMessage: ''
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      getUserProfile().then(response => {
        this.user = response.data.user
        this.roleIds = response.data.user.roleIds
        this.roleGroup = response.data.roles
        this.twoFABound = response.data.user.activeTwoFa

        if (this.roleIds && this.roleIds.length > 0) {
          const roleNames = []
          for (const roleId of this.roleIds) {
            for (const key in this.roleGroup) {
              if (roleId === this.roleGroup[key].roleId) {
                roleNames.push(this.roleGroup[key].roleName)
                break // 找到匹配的角色后跳出内层循环
              }
            }
          }
          this.roleName = roleNames.join(', ') // 使用逗号拼接角色名称
        } else {
          this.roleName = '暂无'
        }
      })
    },
    handle2FAUpdate() {
      console.log('handle2FAUpdate, status:', this.twoFABound)
      if (this.twoFABound) {
        // 开启2fa
        this.bind2FAMode = true
        this.getQrCode()
      } else {
        // 解绑2fa
        this.unbind2FAMode = true
      }
    },
    cancel2FABind() {
      // 关闭2fa
      this.bind2FAMode = false
      this.unbind2FAMode = false
      this.getUser()
    },
    getQrCode() {
      this.loading = true
      try {
        get2FaCode().then(res => {
          console.log('get 2fa code:', res)
          if (res.code === 200) {
            this.qrCodeUrl = res.data.twoFaCodeUrl
            this.secretKey = res.data.twoFaSecret
            console.log('this.qrCodeUrl ', this.qrCodeUrl)
            console.log('this.secretKey ', this.secretKey)
          } else {
            this.errorMessage = res.data.msg
          }
        })
      } catch (error) {
        this.errorMessage = '获取二维码失败，请稍后重试'
      } finally {
        this.loading = false
        console.log('this.loading ', this.loading)
      }
    },
    verifyCode() {
      try {
        verify2FaCode(this.verifyRequest).then(res => {
          if (res.code === 200) {
            this.bind2FAMode = false
            this.twoFABound = true
            this.verifyRequest = {}
            this.msgSuccess(res.msg)
          } else {
            this.errorMessage = res.data.msg
          }
        })
      } catch (error) {
        this.errorMessage = '验证失败，请稍后重试'
      }
    },
    unbind2Fa() {
      unbind2FaVerify(this.verifyRequest).then(res => {
        if (res.code === 200) {
          this.unbind2FAMode = false
          this.twoFABound = false
          this.verifyRequest = {}
          this.msgSuccess(res.msg)
        } else {
          this.errorMessage = res.data.msg
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .list-group-item{
    padding: 18px 0;
  }
  .svg-icon{
    margin-right: 5px;
  }

</style>

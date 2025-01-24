<template>
  <div class="2fa-container">
    <h1>2FA 验证</h1>
    <form @submit.prevent="verify2FA">
      <input v-model="totp" type="text" placeholder="输入 TOTP 验证码">
      <button type="submit">验证</button>
    </form>
  </div>
</template>

<script>
import { verify2fa } from '@/api/login' // 导入 2FA 验证 API

export default {
  data() {
    return {
      totp: '',
      username: this.$route.query.username // 从 query 参数获取用户名
    }
  },
  mounted() {
    console.log('TwoFA component mounted', this.username)
  },
  methods: {
    verify2FA() {
      verify2fa({ username: this.username, totp: this.totp }).then(res => {
        if (res.code === 200) {
          this.$message({
            message: '验证成功',
            type: 'success'
          })
          this.$router.push({ path: '/' })
        } else {
          this.$message.error(res.msg)
        }
        console.log('2fa res', res)
      }).catch(err => {
        this.$message.error('验证失败')
        console.log('2fa err', err)
      })
    }
  }
}
</script>

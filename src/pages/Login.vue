<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>SCBB Admin — Login</h2>
      <el-form :model="form" class="login-form" @submit.prevent="onSubmit">
        <el-form-item>
          <el-input v-model="form.username" placeholder="Username" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" placeholder="Password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">Login</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const form = reactive({ username: '', password: '' })
    const router = useRouter()
    const auth = useAuthStore()

    async function onSubmit() {
      try {
        await auth.login(form.username, form.password)
        router.push('/operators')
      } catch (err) {
        console.error(err)
      }
    }

    return { form, onSubmit }
  },
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 80vh;
  align-items: center;
  justify-content: center;
}
.login-card {
  width: 360px;
  padding: 20px;
}
</style>
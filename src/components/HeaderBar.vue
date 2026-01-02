<template>
  <div class="header-bar">
    <div class="left">SCBB Admin</div>
    <div class="right">
      <span v-if="userName" class="user-name">{{ userName }}</span>
      <el-link @click="logout" v-if="isLoggedIn">Logout</el-link>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const auth = useAuthStore()
    const router = useRouter()
    const isLoggedIn = computed(() => auth.isLoggedIn)
    const userName = computed(() => auth.user?.name || '')
    function logout() {
      auth.logout()
      router.push('/login')
    }
    return { logout, isLoggedIn, userName }
  },
}
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.user-name { margin-right: 12px; color: #333 }
</style>
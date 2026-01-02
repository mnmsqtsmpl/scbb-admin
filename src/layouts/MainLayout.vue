<template>
  <el-container style="min-height: 100vh">
    <el-aside width="72px" class="aside">
      <!-- Avatar + Icon-only vertical menu (avatar dropdown moved to top) -->
      <div class="aside-top">
        <el-dropdown @command="onUserMenuCommand">
          <span class="avatar-btn">
            <el-avatar :size="40" :text="userInitials" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="change_password">Сменить пароль</el-dropdown-item>
              <el-dropdown-item command="logout">Выход</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- Icon-only vertical menu (tooltips show labels) -->
      <el-menu :default-active="active" router class="menu" background-color="#ffffff" text-color="#333" active-text-color="#409EFF" mode="vertical">
        <el-menu-item index="/dashboard">
          <div class="menu-item" title="Dashboard">
            <div class="icon">🏠</div>
          </div>
        </el-menu-item>
        <el-menu-item index="/operators">
          <div class="menu-item" title="Операторы">
            <div class="icon">👷</div>
          </div>
        </el-menu-item>
        <el-menu-item index="/users">
          <div class="menu-item" title="Users">
            <div class="icon">👥</div>
          </div>
        </el-menu-item>
        <el-menu-item index="/settings">
          <div class="menu-item" title="Settings">
            <div class="icon">⚙️</div>
          </div>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-main style="padding: 12px 16px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
export default {
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const active = computed(() => router.currentRoute.value.path)
    const userInitials = computed(() => {
      const name = auth.user?.name || ''
      if (!name) return ''
      return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
    })

    function onUserMenuCommand(command) {
      if (command === 'logout') {
        auth.logout()
        router.push('/login')
      } else if (command === 'change_password') {
        // placeholder — implement actual change-password flow/page
        alert('Сменить пароль — пока заглушка')
      }
    }

    return { active, onUserMenuCommand, userInitials }
  },
}
</script>

<style scoped>
.aside { border-right: 1px solid #eee; background: #fafafa; display:flex; flex-direction:column; }
.aside-top { padding: 12px 8px; display:flex; align-items:center; justify-content:center }
.avatar-btn { cursor:pointer; display:inline-flex }
.menu { height: calc(100% - 72px); }
.menu-item { display: flex; align-items: center; justify-content: center; height: 56px; width: 100% }
.menu-item .icon { font-size: 20px }
</style>
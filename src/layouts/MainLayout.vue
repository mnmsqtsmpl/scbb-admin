<template>
  <el-container style="min-height: 100vh">
    <el-aside width="72px" class="aside">
      <!-- Avatar + Icon-only vertical menu (avatar dropdown moved to top) -->
      <div class="aside-top">
        <el-dropdown trigger="click" @command="onUserMenuCommand">
          <span class="avatar-btn">
            <el-avatar :size="40" :src="userAvatar" :style="avatarStyle" :text="userInitials" />
          </span>
          <template #dropdown>
            <el-dropdown-menu class="aside-user-menu">
              <el-dropdown-item command="change_password">Сменить пароль</el-dropdown-item>
              <el-dropdown-item command="logout">Выход</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- Icon-only vertical menu (tooltips show labels) -->
      <el-menu :default-active="active" router class="menu" background-color="#ffffff" text-color="#333" active-text-color="#409EFF" mode="vertical">
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
    <!-- Change password modal -->
    <change-password-modal v-model:visible="changePwdVisible" @changed="onPasswordChanged" />  </el-container>
</template>

<script>
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
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

    // deterministic gradient generator based on user name/uid
    function hashString(s) {
      let h = 0
      for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i)
        h |= 0
      }
      return Math.abs(h)
    }

    const palette = [
      ['#FF8A80','#FF80AB'],
      ['#FFD180','#FFAB91'],
      ['#FFF59D','#FFE082'],
      ['#C5E1A5','#A5D6A7'],
      ['#80DEEA','#4DD0E1'],
      ['#B39DDB','#9575CD'],
      ['#F48FB1','#F06292']
    ]

    const userAvatar = computed(() => auth.user?.avatar || null)

    const avatarStyle = computed(() => {
      if (auth.user?.avatar) return {}
      const seed = auth.user?.uid || auth.user?.name || 'anon'
      const h = hashString(String(seed))
      const idx = h % palette.length
      const pair = palette[idx]
      return { background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`, color: '#fff' }
    })

    const changePwdVisible = ref(false)

    function onUserMenuCommand(command) {
      if (command === 'logout') {
        auth.logout()
        router.push('/login')
      } else if (command === 'change_password') {
        changePwdVisible.value = true
      }
    }

    function onPasswordChanged() {
      // placeholder for additional reactions (toast is in modal)
    }

    return { active, onUserMenuCommand, userInitials, userAvatar, avatarStyle, changePwdVisible, onPasswordChanged }
  },
  components: {
    ChangePasswordModal: () => import('../components/ChangePasswordModal.vue')
  }
}
</script>

<style scoped>
.aside { border-right: 1px solid #eee; background: #fafafa; display:flex; flex-direction:column; }
.aside-top { padding: 12px 8px; display:flex; align-items:center; justify-content:center }
.avatar-btn { cursor:pointer; display:inline-flex }
.menu { height: calc(100% - 72px); }
.menu-item { display: flex; align-items: center; justify-content: center; height: 56px; width: 100% }
.menu-item .icon { font-size: 20px }

/* dropdown menu style - inherit app font */
.aside-user-menu { font-family: inherit; font-size: 14px }

/* avatar gradient fallback: ensure white text */
.el-avatar { color: #fff }
</style>

<style>
/* Teleported dropdown lives outside component scope - style it globally */
.el-dropdown-menu.aside-user-menu,
.el-dropdown-menu.aside-user-menu li,
.el-dropdown-menu.aside-user-menu .el-dropdown-menu__item,
.aside-user-menu,
.aside-user-menu * {
  font-family: Avenir, Helvetica, Arial, sans-serif !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}
</style>
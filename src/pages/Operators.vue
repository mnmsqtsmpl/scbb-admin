<template>
  <div>
    <el-card>
      <div class="card-top">
        <div class="top-actions" style="display:flex; gap:8px; align-items:center; margin-bottom:12px; overflow-x:auto; padding-bottom:8px;">
          <el-button size="small" type="primary" @click="onTopAction('connect_rbs')">Подключить клиента на РБС</el-button>
          <el-button size="small" type="primary" @click="onTopAction('connect_non_client')">Подключить НЕ КЛИЕНТА банка</el-button>
          <el-button size="small" type="primary" @click="onTopAction('create_fk')">Создать клиента ФК</el-button>
          <el-button size="small" type="primary" @click="onTopAction('limit_restriction')">Ограничение списания по счетам компании</el-button>
          <el-button size="small" type="primary" @click="onTopAction('find_by_inn')">Найти оператора счета по ИНН и паспорт</el-button>
          <el-button size="small" type="primary" @click="onTopAction('login_settings')">Настройки входа ИБ</el-button>
          <el-button size="small" type="primary" @click="onTopAction('unlock_elba')">Разблокировать пользователя Эльба/Мвд</el-button>
          <el-button size="small" type="primary" @click="onTopAction('change_limits')">Изменение лимитов по организации</el-button>
          <el-button size="small" type="primary" @click="onTopAction('employees_list')">Список сотрудников, открывающих счета АУ</el-button>
          <el-button size="small" type="primary" @click="onTopAction('block_registers')">Блокировка реестром</el-button>
        </div>

        <el-tag v-if="showAppliedBadge" type="success" class="filters-badge">Фильтры применены</el-tag>

        <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap" @keydown.enter.prevent="onSearch">
          <el-input v-model="filters.search" placeholder="Поиск" size="small" style="width:240px" @input="onSearchDebounced" @keyup.enter="onSearch" @blur="onSearch" />

        <el-select v-model="filters.rights" placeholder="Права оператора ДБО" size="small" style="width:200px" @change="onSearch">
          <el-option label="Все" value="" />
          <el-option label="Оператор" value="operator" />
          <el-option label="Админ" value="admin" />
          <el-option label="Администратор платежей" value="payments_admin" />
        </el-select>

        <el-input v-model="filters.phone" placeholder="Номер телефона" size="small" style="width:180px" @keyup.enter="onSearch" @blur="onSearch" />
        <el-input v-model="filters.corpPhone" placeholder="Корп. номер телефона" size="small" style="width:180px" @keyup.enter="onSearch" @blur="onSearch" />

        <el-select v-model="filters.sort" placeholder="Сортировка" size="small" style="width:180px" @change="onSearch">
          <el-option label="Сортировка по UID (по возрастанию)" value="uid_asc" />
          <el-option label="Сортировка по UID (по убыванию)" value="uid_desc" />
        </el-select>

        <el-button circle size="small" @click="resetFilters" title="Очистить все фильтры"><el-icon><Close /></el-icon></el-button>

        <div style="margin-left:auto; display:flex; align-items:center; gap:8px">
          <div class="small-muted">Показывать на странице:</div>
          <el-select v-model="perPage" size="small" style="width:80px" @change="onPerPageChange">
            <el-option label="10" :value="10" />
            <el-option label="20" :value="20" />
            <el-option label="50" :value="50" />
          </el-select>
        </div>
      </div>
      </div>

      <el-table :data="operators" style="width: 100%" v-loading="loading" stripe @row-click="onRowClick">
        <el-table-column prop="uid" label="UID" width="100" />
        <el-table-column prop="fullName" label="Фамилия Имя Отчество" />
        <el-table-column prop="dob" label="Дата рождения" width="140" />
        <el-table-column prop="phone" label="Телефон" width="160" />
        <el-table-column prop="email" label="Электронная почта" />
        <el-table-column prop="createdAt" label="Дата создания" width="140" />
        <el-table-column label="Статус" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? 'Активный' : 'Неактивный' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Мигрирован" width="110">
          <template #default="{ row }">
            <el-checkbox v-model="row.migrated" disabled />
          </template>
        </el-table-column>
        <el-table-column label="Права оператора" width="120">
          <template #default="{ row }">
            <el-link underline="never" type="primary" class="op-action">🟢</el-link>
          </template>
        </el-table-column>
      </el-table>

      <div ref="bottomSentinel" style="height:1px"></div>
      <div style="margin-top:8px; text-align:center">
        <i v-if="loadingMore" class="el-icon-loading" style="font-size:20px"></i>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px">
        <div class="small-muted">Показано {{ operators.length }} из {{ total }} записей</div>
        <el-pagination :current-page="page" :page-size="perPage" :total="total" layout="prev, pager, next" @current-change="onPageChange" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { fetchOperators } from '../services/operators'
import { Close } from '@element-plus/icons-vue'

export default {
  name: 'Operators',
  components: { Close },
  setup() {
    const operators = ref([])
    const loading = ref(false)
    const total = ref(0)
    const page = ref(1)
    const perPage = ref(10)
    const filters = ref({ search: '', status: '', rights: '', phone: '', corpPhone: '', sort: '', migrated: '', createdRange: null })

    const startItem = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
    const endItem = computed(() => Math.min(page.value * perPage.value, total.value))

    const loadingMore = ref(false)
    let searchTimer = null
    let badgeTimer = null
    const showAppliedBadge = ref(false)

    async function load({ reset = true } = {}) {
      if (reset) {
        loading.value = true
        page.value = 1
      } else {
        loadingMore.value = true
      }

      const res = await fetchOperators({
        search: filters.value.search,
        phone: filters.value.phone,
        corpPhone: filters.value.corpPhone,
        page: page.value,
        perPage: perPage.value,
        status: filters.value.status,
        rights: filters.value.rights,
        migrated: filters.value.migrated,
        createdFrom: filters.value.createdRange ? filters.value.createdRange[0] : null,
        createdTo: filters.value.createdRange ? filters.value.createdRange[1] : null,
        sort: filters.value.sort,
      })

      if (reset) {
        operators.value = res.items
      } else {
        operators.value = operators.value.concat(res.items)
      }

      total.value = res.total
      loading.value = false
      loadingMore.value = false
    }

    function resetFilters() {
      filters.value = { search: '', status: '', rights: '', phone: '', corpPhone: '', sort: '', migrated: '', createdRange: null }
      page.value = 1
      load({ reset: true })
    }

    async function onSearch() {
      page.value = 1
      await load({ reset: true })

      // show transient badge
      showAppliedBadge.value = true
      if (badgeTimer) clearTimeout(badgeTimer)
      badgeTimer = setTimeout(() => {
        showAppliedBadge.value = false
        badgeTimer = null
      }, 3000)
    }

    function onSearchDebounced() {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        onSearch()
        searchTimer = null
      }, 300)
    }

    function onPageChange(p) {
      page.value = p
      load({ reset: true })
    }

    function onPerPageChange() {
      page.value = 1
      load({ reset: true })
    }

    async function loadMore() {
      if (loading.value || loadingMore.value) return
      if (operators.value.length >= total.value) return
      page.value = page.value + 1
      await load({ reset: false })
    }

    function onEdit(row) {
      alert(`Edit operator ${row.fullName}`)
    }

    function onDelete(row) {
      alert(`Delete operator ${row.fullName}`)
    }

    const router = useRouter()

    function onRowClick(row) {
      // navigate to operator detail view
      if (row && row.uid) {
        router.push(`/operators/${row.uid}`)
      }
    }

    function onTopAction(action) {
      // placeholder handler — replace with real implementations
      alert(`Action: ${action}`)
      console.log('Top action clicked:', action)
    }

    const bottomSentinel = ref(null)
    let observer = null

    onMounted(() => {
      load({ reset: true })

      // intersection observer for infinite scroll
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore()
          }
        })
      }, { root: null, rootMargin: '0px', threshold: 0.1 })

      if (bottomSentinel.value) observer.observe(bottomSentinel.value)
    })

    onBeforeUnmount(() => {
      if (observer && bottomSentinel.value) observer.unobserve(bottomSentinel.value)
      if (searchTimer) {
        clearTimeout(searchTimer)
        searchTimer = null
      }
      if (badgeTimer) {
        clearTimeout(badgeTimer)
        badgeTimer = null
      }
    })

    return { operators, loading, onEdit, onDelete, filters, onSearch, onSearchDebounced, page, perPage, onPageChange, total, startItem, endItem, onPerPageChange, onRowClick, resetFilters, onTopAction, bottomSentinel, loadingMore, showAppliedBadge, Close }
  },
}
</script>

<style scoped>
.small-muted { color: #666; font-size: 12px }
.top-actions { display:flex; gap:12px; align-items:stretch; margin-bottom:12px; flex-wrap:wrap; }
.top-actions .el-button { white-space:normal; max-width:240px; text-align:center; padding:10px 14px; display:flex; align-items:center; justify-content:center; line-height:1.2; word-break:break-word; flex: 0 1 240px; box-sizing:border-box; margin:0; min-height:40px; }
.card-top { position:relative }
.filters-badge { position:absolute; top:8px; right:16px; z-index:5 }

.small-muted { color: #666; font-size: 12px }
.top-actions { display:flex; gap:12px; align-items:stretch; margin-bottom:12px; flex-wrap:wrap; }
.top-actions .el-button { white-space:normal; max-width:240px; text-align:center; padding:10px 14px; display:flex; align-items:center; justify-content:center; line-height:1.2; word-break:break-word; flex: 0 1 240px; box-sizing:border-box; margin:0; min-height:40px; }
</style>
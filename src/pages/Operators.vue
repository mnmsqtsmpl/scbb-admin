<template>
  <div>
    <el-card>
      <div class="top-actions" style="display:flex; gap:8px; align-items:center; margin-bottom:12px; overflow-x:auto; padding-bottom:8px;">
        <el-button size="small" type="primary" @click="onTopAction('connect_rbs')">Подключить клиента на РБС</el-button>
        <el-button size="small" type="primary" @click="onTopAction('connect_non_client')">Подключить не КЛИЕНТА банка</el-button>
        <el-button size="small" type="primary" @click="onTopAction('create_fk')">Создать клиента ФК</el-button>
        <el-button size="small" type="primary" @click="onTopAction('limit_restriction')">Ограничение списания по счетам компании</el-button>
        <el-button size="small" type="primary" @click="onTopAction('find_by_inn')">Найти оператора счета по ИНН и паспорт</el-button>
        <el-button size="small" type="primary" @click="onTopAction('login_settings')">Настройки входа ИБ</el-button>
        <el-button size="small" type="primary" @click="onTopAction('unlock_elba')">Разблокировать пользователя Эльба/Мвд</el-button>
        <el-button size="small" type="primary" @click="onTopAction('change_limits')">Изменение лимитов по организации</el-button>
        <el-button size="small" type="primary" @click="onTopAction('employees_list')">Список сотрудников, открывающих счета АУ</el-button>
        <el-button size="small" type="primary" @click="onTopAction('block_registers')">Блокировка регистров</el-button>
      </div>

      <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px;">
        <el-input v-model="filters.search" placeholder="Поиск по UID, имени, телефону или email" size="small" style="width:360px" @keyup.enter.native="onSearch" />

        <el-select v-model="filters.status" placeholder="Статус" size="small" style="width:140px">
          <el-option label="Все" value="" />
          <el-option label="Активный" value="active" />
          <el-option label="Неактивный" value="inactive" />
        </el-select>

        <el-select v-model="filters.rights" placeholder="Права" size="small" style="width:160px">
          <el-option label="Все" value="" />
          <el-option label="Оператор" value="operator" />
          <el-option label="Админ" value="admin" />
        </el-select>

        <el-select v-model="filters.migrated" placeholder="Мигрирован" size="small" style="width:140px">
          <el-option label="Все" value="" />
          <el-option label="Да" :value="true" />
          <el-option label="Нет" :value="false" />
        </el-select>

        <el-date-picker v-model="filters.createdRange" type="daterange" size="small" unlink-panels range-separator="-" start-placeholder="От" end-placeholder="До" style="width:240px" />

        <el-button size="small" type="primary" @click="onSearch">Применить</el-button>
        <el-button size="small" @click="resetFilters">Сброс</el-button>

        <div style="margin-left:auto; display:flex; align-items:center; gap:8px">
          <div class="small-muted">Показывать на странице:</div>
          <el-select v-model="perPage" size="small" style="width:80px" @change="onPerPageChange">
            <el-option label="10" :value="10" />
            <el-option label="20" :value="20" />
            <el-option label="50" :value="50" />
          </el-select>
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

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px">
        <div class="small-muted">Показано с {{ startItem }} по {{ endItem }} из {{ total }} записей</div>
        <el-pagination :current-page="page" :page-size="perPage" :total="total" layout="prev, pager, next" @current-change="onPageChange" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchOperators } from '../services/operators'

export default {
  name: 'Operators',
  setup() {
    const operators = ref([])
    const loading = ref(false)
    const total = ref(0)
    const page = ref(1)
    const perPage = ref(10)
    const filters = ref({ search: '', status: '', rights: '', migrated: '', createdRange: null })

    const startItem = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
    const endItem = computed(() => Math.min(page.value * perPage.value, total.value))

    async function load() {
      loading.value = true
      const res = await fetchOperators({
        search: filters.value.search,
        page: page.value,
        perPage: perPage.value,
        status: filters.value.status,
        rights: filters.value.rights,
        migrated: filters.value.migrated,
        createdFrom: filters.value.createdRange ? filters.value.createdRange[0] : null,
        createdTo: filters.value.createdRange ? filters.value.createdRange[1] : null,
      })
      operators.value = res.items
      total.value = res.total
      loading.value = false
    }

    function resetFilters() {
      filters.value = { search: '', status: '', rights: '', migrated: '', createdRange: null }
      page.value = 1
      load()
    }

    function onSearch() {
      page.value = 1
      load()
    }

    function onPageChange(p) {
      page.value = p
      load()
    }

    function onPerPageChange() {
      page.value = 1
      load()
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

    onMounted(load)

    return { operators, loading, onEdit, onDelete, filters, onSearch, page, perPage, onPageChange, total, startItem, endItem, onPerPageChange, onRowClick, resetFilters, onTopAction }
  },
}
</script>

<style scoped>
.small-muted { color: #666; font-size: 12px }
.top-actions { display:flex; gap:12px; align-items:stretch; margin-bottom:12px; flex-wrap:wrap; }
.top-actions .el-button { white-space:normal; max-width:240px; text-align:center; padding:10px 14px; display:flex; align-items:center; justify-content:center; line-height:1.2; word-break:break-word; flex: 0 1 240px; box-sizing:border-box; margin:0; min-height:40px; }
</style>
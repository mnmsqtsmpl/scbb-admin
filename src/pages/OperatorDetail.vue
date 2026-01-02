<template>
  <div class="operator-page">
    <el-row>
      <el-col :span="5" class="left-actions">
        <div class="actions">
          <div class="status-row">
            <div class="op-title">{{ operator?.fullName || 'Оператор' }}</div>
            <el-tag v-if="operator" :type="operator.status === 'active' ? 'success' : 'info'">{{ operator.status === 'active' ? 'Активный' : 'Неактивный' }}</el-tag>
          </div>

          <el-divider />

          <el-button block type="primary" size="small">Заблокировать</el-button>
          <el-button block plain size="small">Включить Websocket-чаты</el-button>
          <el-button block plain size="small">Обновить инфо</el-button>
          <el-button block plain size="small">Отправить логин и пароль</el-button>
          <el-button block type="warning" size="small">Сбросить пароль</el-button>
          <el-button block type="danger" size="small">Удалить доступ</el-button>

        </div>
      </el-col>

      <el-col :span="19">
        <el-card>
          <div class="header-compact">
            <div class="headline">{{ operator?.fullName || 'Оператор DBO' }}</div>
            <div class="sub">Id в Совкомбанк: <strong>{{ operator?.uid }}</strong></div>
          </div>

          <el-collapse v-model:active-name="activePanels">
            <el-collapse-item title="Основные данные оператора (ДБО)" name="1">
              <div class="panel-row">ФИО: {{ operator?.fullName }}</div>
              <div class="panel-row">Дата рождения: {{ operator?.dob }}</div>
              <div class="panel-row">Телефон: {{ operator?.phone }}</div>
            </el-collapse-item>

            <el-collapse-item title="Контактные данные оператора" name="2">
              <div class="panel-row">Email: {{ operator?.email || '-' }}</div>
              <div class="panel-row">Доп. телефоны: -</div>
            </el-collapse-item>

            <el-collapse-item title="Блокировки" name="3">
              <div class="panel-row">Нет активных блокировок</div>
            </el-collapse-item>

            <el-collapse-item title="Права доступа" name="4">
              <div class="panel-row">Права оператора: {{ operator?.rights }}</div>
            </el-collapse-item>
          </el-collapse>

          <div style="margin-top:16px">
            <h3>Счета, доступные оператору</h3>
            <el-table :data="accounts" stripe v-loading="loadingAccounts" style="width:100%">
              <el-table-column prop="openedAt" label="Дата открытия" width="140" />
              <el-table-column prop="account" label="Счет" />
              <el-table-column prop="type" label="Тип" width="160" />
              <el-table-column prop="client" label="Клиент" />
              <el-table-column prop="balance" label="Остаток" width="120" />
              <el-table-column prop="status" label="Статус" width="120" />
            </el-table>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px">
              <div class="small-muted">Показано с {{ startItem }} по {{ endItem }} из {{ totalAccounts }} записей</div>
              <el-pagination :current-page="page" :page-size="perPage" :total="totalAccounts" layout="prev, pager, next" @current-change="onPageChange" />
            </div>
          </div>

        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchOperator, fetchOperatorAccounts } from '../services/operators'

export default {
  name: 'OperatorDetail',
  setup() {
    const route = useRoute()
    const uid = route.params.uid
    const operator = ref(null)
    const activePanels = ref(['1'])

    const accounts = ref([])
    const loadingAccounts = ref(false)
    const totalAccounts = ref(0)
    const page = ref(1)
    const perPage = ref(10)

    const startItem = computed(() => (totalAccounts.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
    const endItem = computed(() => Math.min(page.value * perPage.value, totalAccounts.value))

    async function loadOperator() {
      operator.value = await fetchOperator(uid)
    }

    async function loadAccounts() {
      loadingAccounts.value = true
      const res = await fetchOperatorAccounts({ uid, page: page.value, perPage: perPage.value })
      accounts.value = res.items
      totalAccounts.value = res.total
      loadingAccounts.value = false
    }

    function onPageChange(p) {
      page.value = p
      loadAccounts()
    }

    onMounted(() => {
      loadOperator()
      loadAccounts()
    })

    return { operator, activePanels, accounts, loadingAccounts, totalAccounts, page, perPage, onPageChange, startItem, endItem }
  },
}
</script>

<style scoped>
.left-actions { padding: 12px }
.actions .status-row { display:flex; gap:8px; align-items:center; margin-bottom:8px }
.op-title { font-weight:600 }
.headline { font-size:18px; font-weight:600; margin-bottom:6px }
.panel-row { padding: 6px 0 }
.small-muted { color:#666; font-size:12px }

/* Action button layout */
.actions { display:flex; flex-direction:column; gap:8px }
.actions .el-button { display:block; width:100%; box-sizing:border-box; border-radius:6px; padding:8px 14px; min-height:36px; text-align:center; margin:0 !important }
</style>
// Mock operator service with simple filtering and pagination
const MOCK = [
  { uid: 5548, fullName: 'Хуснутдинов Мусяит Сахибгареевич', dob: '1980-01-01', phone: '8 (965) 032-15-46', email: 'nehreth@reth.werg', createdAt: '2025-12-30', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5547, fullName: 'Тулаев Вадим Иванович', dob: '1995-09-03', phone: '8 (924) 343-53-45', email: 'es2@svetvodov-adm.ru', createdAt: '2025-12-30', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5546, fullName: 'Уваров Нифонт Владленович', dob: '1988-01-20', phone: '8 (993) 553-25-96', email: '', createdAt: '2025-12-26', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5545, fullName: 'Клюшин Всеволод Вячеславович', dob: '1982-02-28', phone: '8 (991) 500-20-20', email: '', createdAt: '2025-12-25', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5544, fullName: 'Месропян Арман Робертович', dob: '1985-07-11', phone: '8 (968) 866-66-61', email: '', createdAt: '2025-12-25', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5543, fullName: 'Акапитулова Татьяна Евгеньевна', dob: '1975-07-01', phone: '8 (963) 772-13-83', email: '', createdAt: '2025-12-25', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5542, fullName: 'Легийкина Виктория Владимировна', dob: '1982-04-06', phone: '8 (903) 941-33-56', email: '', createdAt: '2025-12-24', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5541, fullName: 'Колесникова Вера Константиновна', dob: '2000-01-01', phone: '8 (007) 970-07-97', email: '', createdAt: '2025-12-24', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5540, fullName: 'ТочнёноМультик Клиент Тестовый', dob: '1990-12-01', phone: '8 (888) 777-66-55', email: '', createdAt: '2025-12-24', status: 'active', migrated: false, rights: 'operator' },
  { uid: 5539, fullName: 'Русаков Андрей Николаевич', dob: '1991-05-18', phone: '8 (975) 215-19-32', email: 'Duncan14@gmail.com', createdAt: '2025-12-23', status: 'active', migrated: false, rights: 'operator' },
]

export async function fetchOperators({ search = '', page = 1, perPage = 10, status = '', rights = '', migrated = '', createdFrom = null, createdTo = null } = {}) {
  // simulate network
  await new Promise((r) => setTimeout(r, 250))

  let items = MOCK.slice()

  // simple search (uid, name, phone, email)
  const s = String(search || '').trim().toLowerCase()
  if (s) {
    items = items.filter((it) =>
      String(it.uid).includes(s) || it.fullName.toLowerCase().includes(s) || it.phone.toLowerCase().includes(s) || (it.email || '').toLowerCase().includes(s)
    )
  }

  if (status) {
    items = items.filter((it) => it.status === status)
  }

  if (rights) {
    items = items.filter((it) => it.rights === rights)
  }

  if (migrated === true || migrated === false) {
    items = items.filter((it) => Boolean(it.migrated) === Boolean(migrated))
  }

  // createdFrom/createdTo can be Date objects or parsable strings
  const from = createdFrom ? new Date(createdFrom) : null
  const to = createdTo ? new Date(createdTo) : null
  if (from || to) {
    items = items.filter((it) => {
      const d = new Date(it.createdAt)
      if (from && to) return d >= from && d <= to
      if (from) return d >= from
      if (to) return d <= to
      return true
    })
  }

  const total = items.length
  const start = (page - 1) * perPage
  const paged = items.slice(start, start + perPage)
  return { items: paged, total }
}

export async function fetchOperator(uid) {
  await new Promise((r) => setTimeout(r, 200))
  const op = MOCK.find((m) => String(m.uid) === String(uid))
  if (!op) return null
  return op
}

export async function fetchOperatorAccounts({ uid, page = 1, perPage = 10 } = {}) {
  await new Promise((r) => setTimeout(r, 200))
  // simple mock accounts tied to uid
  const all = Array.from({ length: 7 }).map((_, idx) => ({
    id: `${uid}-${idx + 1}`,
    openedAt: '20.05.2021',
    account: `40702${1000 + idx}${uid}`,
    type: 'Текущий/Расчетный',
    client: 'ООО "Клиент"',
    balance: (Math.random() * 10000 - 500).toFixed(2) + ' ₽',
    canCreate: true,
    canPay: true,
    ownerRights: true,
    status: 'Активен',
  }))

  const total = all.length
  const start = (page - 1) * perPage
  const items = all.slice(start, start + perPage)
  return { items, total }
}

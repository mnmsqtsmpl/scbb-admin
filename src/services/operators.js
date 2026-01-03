// Mock operator service with simple filtering and pagination

function randomInt(seed, min, max) {
  // simple LCG for deterministic pseudo-randomness
  let x = (seed * 9301 + 49297) % 233280
  return min + (x % (max - min + 1))
}

function formatPhone(n) {
  const s = String(n).padStart(10, '0')
  return `8 (${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6,8)}-${s.slice(8,10)}`
}

function randomDate(seed, startYear = 2023, endYear = 2025) {
  const year = startYear + (seed % (endYear - startYear + 1))
  const month = 1 + (seed % 12)
  const day = 1 + (seed % 28)
  return `${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}.${year}`
}

const FIRST = ['Алексей','Денис','Андрей','Татьяна','Виктория','Анна','Роман','Сергей','Дмитрий','Анастасия']
const LAST = ['Иванов','Петров','Смирнов','Кузнецов','Соколов','Новиков','Морозов','Васильев','Ковалев','Попов']
const MID = ['Иванович','Петрович','Андреевич','Юрьевич','Владимирович','Сергеевич']

const MOCK = Array.from({ length: 300 }).map((_, idx) => {
  const uid = 4000 + idx
  const f = FIRST[idx % FIRST.length]
  const l = LAST[(idx + 3) % LAST.length]
  const m = MID[idx % MID.length]
  const fullName = `${l} ${f} ${m}`
  const phoneSeed = idx * 7 + 1000
  const corpSeed = idx * 11 + 2000
  const phone = formatPhone(phoneSeed)
  const corpPhone = formatPhone(corpSeed)
  const createdAt = randomDate(idx)
  const rights = idx % 10 === 0 ? 'admin' : (idx % 7 === 0 ? 'payments_admin' : 'operator')
  const migrated = idx % 5 === 0
  const status = idx % 17 === 0 ? 'inactive' : 'active'
  return { uid, fullName, dob: '01.01.1990', phone, corpPhone, email: `user${uid}@example.com`, createdAt, status, migrated, rights }
})

export async function fetchOperators({ search = '', phone = '', corpPhone = '', page = 1, perPage = 10, status = '', rights = '', migrated = '', createdFrom = null, createdTo = null, sort = '' } = {}) {
  // simulate network
  await new Promise((r) => setTimeout(r, 200))

  let items = MOCK.slice()

  // simple search (uid, name, phone, email)
  const s = String(search || '').trim().toLowerCase()
  if (s) {
    items = items.filter((it) =>
      String(it.uid).includes(s) || it.fullName.toLowerCase().includes(s) || it.phone.toLowerCase().includes(s) || (it.email || '').toLowerCase().includes(s)
    )
  }

  if (phone) {
    const p = String(phone).trim().toLowerCase()
    items = items.filter((it) => it.phone.toLowerCase().includes(p))
  }

  if (corpPhone) {
    const p = String(corpPhone).trim().toLowerCase()
    items = items.filter((it) => it.corpPhone.toLowerCase().includes(p))
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
      // createdAt is dd.mm.yyyy
      const parts = it.createdAt.split('.')
      const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      if (from && to) return d >= from && d <= to
      if (from) return d >= from
      if (to) return d <= to
      return true
    })
  }

  // sorting
  if (sort === 'uid_asc') items.sort((a,b) => a.uid - b.uid)
  if (sort === 'uid_desc') items.sort((a,b) => b.uid - a.uid)

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

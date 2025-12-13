<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Laporan Keuangan</div>
        <div class="text-caption text-grey-7">
          Ringkasan bulanan keluarga, per orang, dan per kategori
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          flat
          dense
          round
          icon="refresh"
          @click="reloadAll"
        />
      </div>
    </div>

    <q-card class="rounded-card">
      <q-tabs
        v-model="activeTab"
        dense
        align="justify"
        indicator-color="primary"
        active-color="primary"
      >
        <q-tab name="summary" icon="bar_chart" label="Ringkasan Bulanan" />
        <q-tab name="user" icon="person" label="Per Orang" />
        <q-tab name="category" icon="category" label="Per Kategori" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- TAB RINGKASAN BULANAN -->
        <q-tab-panel name="summary">
          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-sm items-end">
              <div class="col-6 col-md-3">
                <q-input
                  v-model.number="summaryYear"
                  type="number"
                  label="Tahun"
                  outlined
                  dense
                />
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model.number="summaryMonth"
                  :options="monthOptions"
                  label="Bulan"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-3">
                <q-btn
                  unelevated
                  color="primary"
                  label="Terapkan"
                  :loading="summaryLoading"
                  @click="loadSummary"
                />
              </div>
            </div>

            <div v-if="summaryData" class="q-mt-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-caption text-grey-7">
                      Total Pemasukan
                    </div>
                    <div class="text-h6 text-positive">
                      {{ formatCurrency(summaryData.totals.income) }}
                    </div>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-caption text-grey-7">
                      Total Pengeluaran
                    </div>
                    <div class="text-h6 text-negative">
                      {{ formatCurrency(summaryData.totals.expense) }}
                    </div>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-caption text-grey-7">
                      Net (Income - Expense)
                    </div>
                    <div
                      class="text-h6"
                      :class="summaryData.totals.net >= 0 ? 'text-positive' : 'text-negative'"
                    >
                      {{ formatCurrency(summaryData.totals.net) }}
                    </div>
                  </q-card>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">
                    Pemasukan per kategori besar
                  </div>
                  <q-list v-if="summaryData.income_by_parent.length" separator bordered>
                    <q-item
                      v-for="item in summaryData.income_by_parent"
                      :key="item.name"
                    >
                      <q-item-section>
                        <q-item-label>
                          {{ item.name }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold text-positive">
                          {{ formatCurrency(item.amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-grey text-caption q-mt-sm">
                    Belum ada pemasukan di periode ini.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">
                    Pengeluaran per kategori besar
                  </div>
                  <q-list v-if="summaryData.expense_by_parent.length" separator bordered>
                    <q-item
                      v-for="item in summaryData.expense_by_parent"
                      :key="item.name"
                    >
                      <q-item-section>
                        <q-item-label>
                          {{ item.name }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold text-negative">
                          {{ formatCurrency(item.amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-grey text-caption q-mt-sm">
                    Belum ada pengeluaran di periode ini.
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="summaryLoading" class="q-mt-md text-grey">
              Memuat ringkasan...
            </div>
          </q-card-section>
        </q-tab-panel>

        <!-- TAB LAPORAN PER ORANG -->
        <q-tab-panel name="user">
          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-sm items-end">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="userId"
                  :options="userOptions"
                  label="Pilih pengguna"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6 col-md-3">
                <q-input
                  v-model.number="userYear"
                  type="number"
                  label="Tahun"
                  outlined
                  dense
                />
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model.number="userMonth"
                  :options="monthOptions"
                  label="Bulan"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-2">
                <q-btn
                  unelevated
                  color="primary"
                  label="Terapkan"
                  :loading="userLoading"
                  @click="loadUserReport"
                />
              </div>
            </div>

            <div v-if="userReport" class="q-mt-md">
              <div class="text-subtitle1 q-mb-xs">
                Laporan {{ userReport.user.name }} –
                {{ monthLabel(userMonth) }} {{ userYear }}
              </div>

              <div class="row q-col-gutter-md q-mt-xs">
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-caption text-grey-7">
                      Total Pemasukan
                    </div>
                    <div class="text-h6 text-positive">
                      {{ formatCurrency(userReport.totals.income) }}
                    </div>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-caption text-grey-7">
                      Total Pengeluaran
                    </div>
                    <div class="text-h6 text-negative">
                      {{ formatCurrency(userReport.totals.expense) }}
                    </div>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-caption text-grey-7">
                      Net
                    </div>
                    <div
                      class="text-h6"
                      :class="userReport.totals.net >= 0 ? 'text-positive' : 'text-negative'"
                    >
                      {{ formatCurrency(userReport.totals.net) }}
                    </div>
                  </q-card>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">
                    Pemasukan per kategori
                  </div>
                  <q-list
                    v-if="userReport.income_by_category.length"
                    separator
                    bordered
                  >
                    <q-item
                      v-for="item in userReport.income_by_category"
                      :key="item.name"
                    >
                      <q-item-section>
                        <q-item-label>{{ item.name }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold text-positive">
                          {{ formatCurrency(item.amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-caption text-grey q-mt-xs">
                    Tidak ada pemasukan di periode ini.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">
                    Pengeluaran per kategori
                  </div>
                  <q-list
                    v-if="userReport.expense_by_category.length"
                    separator
                    bordered
                  >
                    <q-item
                      v-for="item in userReport.expense_by_category"
                      :key="item.name"
                    >
                      <q-item-section>
                        <q-item-label>{{ item.name }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold text-negative">
                          {{ formatCurrency(item.amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-caption text-grey q-mt-xs">
                    Tidak ada pengeluaran di periode ini.
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="userLoading" class="q-mt-md text-grey">
              Memuat laporan per orang...
            </div>
          </q-card-section>
        </q-tab-panel>

        <!-- TAB LAPORAN PER KATEGORI -->
        <q-tab-panel name="category">
          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-sm items-end">
              <div class="col-6 col-md-3">
                <q-select
                  v-model="categoryType"
                  :options="[
                    { label: 'Kategori Pengeluaran', value: 'expense' },
                    { label: 'Kategori Penghasilan', value: 'income' }
                  ]"
                  label="Jenis kategori"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6 col-md-4">
                <q-select
                  v-model="categoryId"
                  :options="categoryOptions"
                  label="Pilih kategori"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6 col-md-2">
                <q-input
                  v-model.number="categoryYear"
                  type="number"
                  label="Tahun"
                  outlined
                  dense
                />
              </div>
              <div class="col-6 col-md-2">
                <q-select
                  v-model.number="categoryMonth"
                  :options="monthOptions"
                  label="Bulan"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-1">
                <q-btn
                  unelevated
                  color="primary"
                  label="OK"
                  :loading="categoryLoading"
                  @click="loadCategoryReport"
                />
              </div>
            </div>

            <div v-if="categoryReport" class="q-mt-md">
              <div class="text-subtitle1 q-mb-xs">
                {{ categoryReport.category.name }} –
                {{ monthLabel(categoryMonth) }} {{ categoryYear }}
              </div>

              <q-card flat bordered class="q-pa-md q-mb-md">
                <div class="text-caption text-grey-7">
                  Total
                  {{ categoryReport.category.type === 'income' ? 'pemasukan' : 'pengeluaran' }}
                  kategori ini (termasuk sub-kategori)
                </div>
                <div
                  class="text-h6"
                  :class="categoryReport.category.type === 'income' ? 'text-positive' : 'text-negative'"
                >
                  {{ formatCurrency(categoryReport.total_amount) }}
                </div>
              </q-card>

              <div>
                <div class="text-subtitle2 q-mb-xs">
                  Daftar transaksi kategori ini
                </div>
                <q-list
                  v-if="categoryReport.transactions.length"
                  bordered
                  separator
                >
                  <q-item
                    v-for="tx in categoryReport.transactions"
                    :key="tx.id"
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ tx.description || '(tanpa catatan)' }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ formatDate(tx.transacted_at) }} •
                        {{ accountName(tx.account_id) }} •
                        {{ scopeLabel(tx.scope) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <div
                        class="text-weight-bold"
                        :class="tx.direction === 'income' ? 'text-positive' : 'text-negative'"
                      >
                        {{ formatCurrency(tx.amount) }}
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-caption text-grey q-mt-xs">
                  Tidak ada transaksi untuk kategori ini di periode yang dipilih.
                </div>
              </div>
            </div>

            <div v-else-if="categoryLoading" class="q-mt-md text-grey">
              Memuat laporan kategori...
            </div>
          </q-card-section>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  name: 'ReportsPage',
  data () {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1

    return {
      activeTab: 'summary',

      // summary
      summaryYear: y,
      summaryMonth: m,
      summaryLoading: false,
      summaryData: null,

      // per user
      userYear: y,
      userMonth: m,
      userId: null,
      userLoading: false,
      userReport: null,
      members: [],

      // per category
      categoryYear: y,
      categoryMonth: m,
      categoryType: 'expense',
      categoryId: null,
      categoryLoading: false,
      categoryReport: null,
      categoriesIncome: [],
      categoriesExpense: [],

      // accounts for name mapping
      accounts: [],
      accountsById: {},

      monthOptions: [
        { label: 'Jan', value: 1 },
        { label: 'Feb', value: 2 },
        { label: 'Mar', value: 3 },
        { label: 'Apr', value: 4 },
        { label: 'Mei', value: 5 },
        { label: 'Jun', value: 6 },
        { label: 'Jul', value: 7 },
        { label: 'Agu', value: 8 },
        { label: 'Sep', value: 9 },
        { label: 'Okt', value: 10 },
        { label: 'Nov', value: 11 },
        { label: 'Des', value: 12 }
      ]
    }
  },
  computed: {
    userOptions () {
      return this.members.map(m => ({
        label: `${m.name} (${this.roleLabel(m.role)})`,
        value: m.id
      }))
    },
    categoryOptions () {
      const list = this.categoryType === 'income'
        ? this.categoriesIncome
        : this.categoriesExpense

      return list.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
    }
  },
  created () {
    this.loadAccounts()
    this.loadMembers()
    this.loadCategories()
    this.loadSummary()
  },
  methods: {
    reloadAll () {
      if (this.activeTab === 'summary') {
        this.loadSummary()
      } else if (this.activeTab === 'user') {
        this.loadUserReport()
      } else if (this.activeTab === 'category') {
        this.loadCategoryReport()
      }
    },

    // ==== LOAD MASTER DATA ====

    async loadAccounts () {
      try {
        const { data } = await api.get('/accounts')
        const accounts = data.data || data || []
        this.accounts = accounts
        this.accountsById = {}
        accounts.forEach(acc => {
          this.accountsById[acc.id] = acc
        })
      } catch (err) {
        console.error(err)
        // bukan error fatal, jadi cukup log
      }
    },

    async loadMembers () {
      try {
        const { data } = await api.get('/family-users')
        this.members = data.data || data || []
        if (!this.userId && this.members.length) {
          this.userId = this.members[0].id
          this.loadUserReport()
        }
      } catch (err) {
        console.error(err)
        // kalau 403 (bukan owner), abaikan
      }
    },

    async loadCategories () {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          api.get('/categories', { params: { type: 'income' } }),
          api.get('/categories', { params: { type: 'expense' } })
        ])

        this.categoriesIncome = incomeRes.data.data || incomeRes.data || []
        this.categoriesExpense = expenseRes.data.data || expenseRes.data || []

        if (!this.categoryId) {
          const list = this.categoryType === 'income'
            ? this.categoriesIncome
            : this.categoriesExpense
          if (list.length) {
            this.categoryId = list[0].id
          }
        }
      } catch (err) {
        console.error(err)
      }
    },

    // ==== API CALLS LAPORAN ====

    async loadSummary () {
      this.summaryLoading = true
      this.summaryData = null
      try {
        const params = {
          year: this.summaryYear,
          month: this.summaryMonth
        }
        const { data } = await api.get('/reports/monthly-summary', { params })
        this.summaryData = data
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat ringkasan bulanan')
      } finally {
        this.summaryLoading = false
      }
    },

    async loadUserReport () {
      if (!this.userId) return

      this.userLoading = true
      this.userReport = null
      try {
        const params = {
          year: this.userYear,
          month: this.userMonth,
          user_id: this.userId
        }
        const { data } = await api.get('/reports/user-summary', { params })
        this.userReport = data
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat laporan per orang')
      } finally {
        this.userLoading = false
      }
    },

    async loadCategoryReport () {
      if (!this.categoryId) {
        Notify.create({
          type: 'warning',
          message: 'Pilih kategori terlebih dahulu'
        })
        return
      }

      this.categoryLoading = true
      this.categoryReport = null
      try {
        const params = {
          year: this.categoryYear,
          month: this.categoryMonth,
          category_id: this.categoryId
        }
        const { data } = await api.get('/reports/category-summary', { params })
        this.categoryReport = data
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat laporan kategori')
      } finally {
        this.categoryLoading = false
      }
    },

    // ==== UTIL ====

    handleError (err, fallbackMessage) {
      const status = err?.response?.status

      if (status === 401) {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
        Notify.create({
          type: 'negative',
          message: 'Sesi habis, silakan login lagi'
        })
        this.$router.push({ name: 'login' })
        return
      }

      const msg = err?.response?.data?.message || fallbackMessage
      Notify.create({
        type: 'negative',
        message: msg
      })
    },

    formatCurrency (value) {
      const number = Number(value || 0)
      return number.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      })
    },

    formatDate (value) {
      if (!value) return '-'
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return value
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },

    monthLabel (m) {
      const found = this.monthOptions.find(x => x.value === m)
      return found ? found.label : m
    },

    accountName (accountId) {
      const acc = this.accountsById[accountId]
      return acc ? acc.name : `Akun #${accountId}`
    },

    scopeLabel (scope) {
      if (scope === 'family') return 'Keluarga'
      if (scope === 'personal') return 'Pribadi'
      return 'Tidak ditentukan'
    },

    roleLabel (role) {
      if (role === 'owner') return 'Owner'
      if (role === 'member') return 'Member'
      return role || '-'
    }
  }
}
</script>

<style scoped>
.rounded-card {
  border-radius: 20px;
}
</style>

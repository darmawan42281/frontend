<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Transaksi</div>
        <div class="text-caption text-grey-7">
          Catat pemasukan, pengeluaran, dan transfer antar akun
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          flat
          dense
          round
          icon="refresh"
          @click="refreshAll"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Form card -->
    <q-card class="rounded-card q-mb-md">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7"
        align="justify"
        indicator-color="primary"
        active-color="primary"
      >
        <q-tab name="transaction" icon="edit" label="Transaksi" />
        <q-tab name="transfer" icon="swap_horiz" label="Transfer" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Tab Transaksi normal -->
        <q-tab-panel name="transaction">
          <q-form @submit.prevent="submitTransaction" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.account_id"
                  :options="accountOptions"
                  label="Akun"
                  dense
                  filled
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.direction"
                  :options="directionOptions"
                  label="Jenis"
                  dense
                  filled
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.scope"
                  :options="scopeOptions"
                  label="Scope"
                  dense
                  filled
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.category_id"
                  :options="categoryOptionsByDirection"
                  label="Kategori"
                  dense
                  filled
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.amount"
                  type="number"
                  label="Nominal"
                  dense
                  filled
                  :disable="loading"
                  min="0"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.transacted_at"
                  type="datetime-local"
                  label="Tanggal & Jam"
                  dense
                  filled
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.description"
                  label="Catatan (opsional)"
                  dense
                  filled
                  :disable="loading"
                />
              </div>
            </div>

            <div class="row justify-end">
              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Simpan"
                unelevated
                :loading="loading"
              />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- Tab Transfer -->
        <q-tab-panel name="transfer">
          <q-form @submit.prevent="submitTransfer" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="transferForm.from_account_id"
                  :options="accountOptions"
                  label="Dari Akun"
                  dense
                  filled
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="transferForm.to_account_id"
                  :options="accountOptions"
                  label="Ke Akun"
                  dense
                  filled
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="transferForm.scope"
                  :options="scopeOptions"
                  label="Scope"
                  dense
                  filled
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="transferForm.amount"
                  type="number"
                  label="Nominal Transfer"
                  dense
                  filled
                  :disable="loading"
                  min="0"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="transferForm.transacted_at"
                  type="datetime-local"
                  label="Tanggal & Jam"
                  dense
                  filled
                  :disable="loading"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="transferForm.description"
                  label="Catatan (opsional)"
                  dense
                  filled
                  :disable="loading"
                />
              </div>
            </div>

            <div class="row justify-end">
              <q-btn
                type="submit"
                color="primary"
                icon="swap_horiz"
                label="Transfer"
                unelevated
                :loading="loading"
              />
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Filter & list -->
    <q-card class="rounded-card">
      <q-card-section class="q-pb-sm">
        <div class="text-subtitle1 text-weight-medium">Riwayat Transaksi</div>
        <div class="text-caption text-grey-7">
          Filter transaksi berdasarkan akun, tipe, scope, dan tanggal
        </div>

        <!-- Filters (mobile-first, seperti contoh gambar) -->
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-12">
            <q-select
              v-model="filters.account_id"
              :options="accountFilterOptionsAll"
              label="Akun"
              dense
              outlined
              emit-value
              map-options
              clearable
              :disable="loadingList"
              class="tx-filter-field"
            />
          </div>

          <div class="col-6">
            <q-select
              v-model="filters.direction"
              :options="directionFilterOptionsAll"
              label="Tipe"
              dense
              outlined
              emit-value
              map-options
              clearable
              :disable="loadingList"
              class="tx-filter-field"
            />
          </div>

          <div class="col-6">
            <q-select
              v-model="filters.scope"
              :options="scopeFilterOptionsAll"
              label="Scope"
              dense
              outlined
              emit-value
              map-options
              clearable
              :disable="loadingList"
              class="tx-filter-field"
            />
          </div>

          <div class="col-6">
            <q-input
              v-model="filters.date_from"
              type="date"
              label="Dari tanggal"
              dense
              outlined
              :disable="loadingList"
              class="tx-filter-field"
            />
          </div>

          <div class="col-6">
            <q-input
              v-model="filters.date_to"
              type="date"
              label="Sampai tanggal"
              dense
              outlined
              :disable="loadingList"
              class="tx-filter-field"
            />
          </div>

          <div class="col-9">
            <q-select
              v-model="filters.category_id"
              :options="categoryFilterOptionsAll"
              label="Kategori"
              dense
              outlined
              emit-value
              map-options
              clearable
              :disable="loadingList"
              class="tx-filter-field"
            />
          </div>

          <div class="col-3 flex items-center justify-end">
            <q-btn
              flat
              dense
              no-caps
              icon="restart_alt"
              label="RESET"
              class="tx-reset-btn"
              :disable="loadingList"
              @click="resetFilters"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- List (gaya seperti contoh gambar) -->
      <q-card-section class="q-pt-sm">
        <q-list separator>
          <q-item
            v-for="tx in transactions"
            :key="tx.id"
            class="tx-item"
          >
            <q-item-section avatar top>
              <q-avatar
                size="42px"
                text-color="white"
                :class="txAvatarClass(tx)"
              >
                <q-icon :name="txIconName(tx)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium tx-title">
                {{ txTitle(tx) }}
              </q-item-label>
              <q-item-label caption class="tx-sub">
                {{ txAccountAndCategory(tx) }}
              </q-item-label>
              <q-item-label caption class="tx-sub">
                {{ txOwnerAndDate(tx) }}
              </q-item-label>
              <q-item-label caption class="tx-sub text-grey-7">
                {{ directionLabel(tx.direction, tx.transaction_type) }} • {{ scopeLabel(tx.scope) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top class="tx-right">
              <div class="text-weight-bold" :class="txAmountClass(tx)">
                {{ formatCurrency(tx.amount) }}
              </div>

              <div
                v-if="tx.transaction_type !== 'transfer'"
                class="row no-wrap items-center justify-end q-mt-xs"
              >
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  size="sm"
                  @click.stop="openEdit(tx)"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click.stop="deleteTransaction(tx)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="!loadingList && !transactions.length" class="text-caption text-grey-7 text-center q-my-md">
          Tidak ada transaksi yang cocok dengan filter.
        </div>

        <div v-if="totalPages > 1" class="row justify-center q-mt-md">
          <q-pagination
            v-model="pagination.page"
            :max="totalPages"
            max-pages="6"
            boundary-numbers
            direction-links
            @update:model-value="loadTransactions"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Edit dialog -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 320px; max-width: 520px;">
        <q-card-section>
          <div class="text-h6">Edit Transaksi</div>
          <div class="text-caption text-grey-7">
            Perbarui data transaksi (tidak untuk transfer)
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="editForm.account_id"
            :options="accountOptions"
            label="Akun"
            dense
            filled
            emit-value
            map-options
          />

          <q-select
            v-model="editForm.direction"
            :options="directionOptions"
            label="Jenis"
            dense
            filled
            emit-value
            map-options
          />

          <q-select
            v-model="editForm.scope"
            :options="scopeOptions"
            label="Scope"
            dense
            filled
            emit-value
            map-options
          />

          <q-select
            v-model="editForm.category_id"
            :options="editCategoryOptionsByDirection"
            label="Kategori"
            dense
            filled
            emit-value
            map-options
          />

          <q-input
            v-model.number="editForm.amount"
            type="number"
            label="Nominal"
            dense
            filled
            min="0"
          />

          <q-input
            v-model="editForm.transacted_at"
            type="datetime-local"
            label="Tanggal & Jam"
            dense
            filled
          />

          <q-input
            v-model="editForm.description"
            label="Catatan (opsional)"
            dense
            filled
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn
            color="primary"
            label="Simpan"
            unelevated
            :loading="loading"
            @click="submitEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { Notify, debounce } from 'quasar'

export default {
  name: 'TransactionsPage',
  data () {
    return {
      activeTab: 'transaction',
      loading: false,
      loadingList: false,
      transactions: [],
      accounts: [],
      accountsById: {},
      balancesById: {},
      accountOptions: [],
      categoriesIncome: [],
      categoriesExpense: [],
      categoriesById: {},
      form: {
        account_id: null,
        direction: 'expense',
        scope: 'family',
        category_id: null,
        amount: null,
        transacted_at: '',
        description: ''
      },
      transferForm: {
        from_account_id: null,
        to_account_id: null,
        scope: 'family',
        amount: null,
        transacted_at: '',
        description: ''
      },
      filters: {
        account_id: null,
        direction: null,
        scope: null,
        category_id: null,
        date_from: '',
        date_to: ''
      },
      debouncedApplyFilters: null,
      pagination: {
        sortBy: 'transacted_at',
        descending: true,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      columns: [
        { name: 'transacted_at', label: 'Tanggal', field: 'transacted_at', align: 'left', sortable: true },
        { name: 'account', label: 'Akun', field: row => row.account_name || '-', align: 'left' },
        { name: 'type', label: 'Jenis', field: row => this.directionLabel(row.direction, row.transaction_type), align: 'left' },
        { name: 'scope', label: 'Scope', field: row => this.scopeLabel(row.scope), align: 'left' },
        { name: 'category', label: 'Kategori', field: row => row.category_name || '-', align: 'left' },
        { name: 'amount', label: 'Nominal', field: 'amount', align: 'right', sortable: true },
        { name: 'description', label: 'Catatan', field: row => row.description || this.defaultDescription(row), align: 'left' },
        { name: 'actions', label: '', field: 'actions', align: 'right' }
      ],
      editDialog: false,
      editId: null,
      editForm: {
        account_id: null,
        direction: 'expense',
        scope: 'family',
        category_id: null,
        amount: null,
        transacted_at: '',
        description: ''
      }
    }
  },

  computed: {
    directionOptions () {
      return [
        { label: 'Pengeluaran', value: 'expense' },
        { label: 'Pemasukan', value: 'income' }
      ]
    },
    directionFilterOptions () {
      return [
        { label: 'Pemasukan', value: 'income' },
        { label: 'Pengeluaran', value: 'expense' },
        { label: 'Transfer', value: 'transfer' }
      ]
    },
    scopeOptions () {
      return [
        { label: 'Keluarga', value: 'family' },
        { label: 'Pribadi', value: 'personal' }
      ]
    },
    categoryOptionsByDirection () {
      if (this.form.direction === 'income') {
        return this.categoriesIncome.map(cat => ({ label: cat.name, value: cat.id }))
      }
      return this.categoriesExpense.map(cat => ({ label: cat.name, value: cat.id }))
    },
    editCategoryOptionsByDirection () {
      if (this.editForm.direction === 'income') {
        return this.categoriesIncome.map(cat => ({ label: cat.name, value: cat.id }))
      }
      return this.categoriesExpense.map(cat => ({ label: cat.name, value: cat.id }))
    },
    accountFilterOptions () {
      return this.accounts.map(acc => ({
        label: acc.name,
        value: acc.id
      }))
    },
    accountFilterOptionsAll () {
      return [{ label: 'Semua akun', value: null }, ...this.accountFilterOptions]
    },
    categoryFilterOptions () {
      const list = [
        ...this.categoriesIncome,
        ...this.categoriesExpense
      ]
      return list.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
    },
    categoryFilterOptionsAll () {
      return [{ label: 'Semua kategori', value: null }, ...this.categoryFilterOptions]
    },
    directionFilterOptionsAll () {
      return [{ label: 'Semua', value: null }, ...this.directionFilterOptions]
    },
    scopeFilterOptionsAll () {
      return [{ label: 'Semua', value: null }, ...this.scopeOptions]
    },
    totalPages () {
      const total = Number(this.pagination.rowsNumber || 0)
      const per = Number(this.pagination.rowsPerPage || 10)
      if (!total || !per) return 1
      return Math.max(1, Math.ceil(total / per))
    }
  },

  created () {
    this.debouncedApplyFilters = debounce(() => {
      this.applyFilters()
    }, 250)
    this.loadMasterData()
    this.loadTransactions()
  },

  watch: {
    filters: {
      deep: true,
      handler () {
        // auto apply seperti contoh UI (tanpa tombol "Terapkan")
        if (this.debouncedApplyFilters) this.debouncedApplyFilters()
      }
    }
  },

  methods: {
    // ===== UI helpers untuk list transaksi (gaya mobile) =====
    txTitle (tx) {
      if (!tx) return '-'
      return (tx.description && String(tx.description).trim()) ? tx.description : (this.defaultDescription(tx) || '-')
    },
    txAccountAndCategory (tx) {
      if (!tx) return ''
      const acc = tx.account_name || this.accountsById?.[tx.account_id]?.name || '-'
      let cat = tx.category_name || ''
      if (tx.transaction_type === 'transfer' || tx.direction === 'transfer') cat = 'Transfer'
      if (!cat) cat = '-'
      return `${acc} • ${cat}`
    },
    txOwnerAndDate (tx) {
      if (!tx) return ''
      const owner = tx.owner_name || tx.account_owner_name || this.accountsById?.[tx.account_id]?.owner_name || ''
      const date = this.formatDateOnly(tx.transacted_at)
      if (owner && date) return `${owner} • ${date}`
      return owner || date || ''
    },
    formatDateOnly (val) {
      if (!val) return ''
      const d = new Date(val)
      if (Number.isNaN(d.getTime())) {
        // fallback: coba ambil YYYY-MM-DD dari string
        return String(val).slice(0, 10)
      }
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    txIconName (tx) {
      if (!tx) return 'receipt_long'
      if (tx.transaction_type === 'transfer' || tx.direction === 'transfer') return 'swap_horiz'
      if (tx.direction === 'income') return 'south'
      if (tx.direction === 'expense') return 'north'
      return 'receipt_long'
    },
    txAvatarClass (tx) {
      if (!tx) return 'bg-grey-6'
      if (tx.transaction_type === 'transfer' || tx.direction === 'transfer') return 'bg-primary'
      if (tx.direction === 'income') return 'bg-positive'
      if (tx.direction === 'expense') return 'bg-negative'
      return 'bg-grey-6'
    },
    txAmountClass (tx) {
      if (!tx) return 'text-grey-8'
      if (tx.transaction_type === 'transfer' || tx.direction === 'transfer') return 'text-primary'
      if (tx.direction === 'income') return 'text-positive'
      if (tx.direction === 'expense') return 'text-negative'
      return 'text-grey-8'
    },

    async loadMasterData () {
      this.loading = true
      try {
        const [accRes, incomeRes, expenseRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/categories', { params: { type: 'income' } }),
          api.get('/categories', { params: { type: 'expense' } })
        ])

        const accounts = accRes.data.data || accRes.data || []
        this.accounts = accounts
        this.accountsById = {}
        this.accountOptions = accounts.map(acc => {
          this.accountsById[acc.id] = acc
          return {
            label: acc.name,
            value: acc.id
          }
        })

        const incomeCategories = incomeRes.data.data || incomeRes.data || []
        const expenseCategories = expenseRes.data.data || expenseRes.data || []
        this.categoriesIncome = incomeCategories
        this.categoriesExpense = expenseCategories

        this.categoriesById = {}
        for (const cat of [...incomeCategories, ...expenseCategories]) {
          this.categoriesById[cat.id] = cat
        }

        await this.refreshBalances()

        if (!this.form.account_id && this.accountOptions.length > 0) {
          this.form.account_id = this.accountOptions[0].value
        }
        if (!this.transferForm.from_account_id && this.accountOptions.length > 0) {
          this.transferForm.from_account_id = this.accountOptions[0].value
        }
        if (!this.transferForm.to_account_id && this.accountOptions.length > 1) {
          this.transferForm.to_account_id = this.accountOptions[1].value
        }
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat data master (akun & kategori)')
      } finally {
        this.loading = false
      }
    },

    async loadTransactions () {
      this.loadingList = true
      try {
        const params = {}

        if (this.filters.account_id) params.account_id = this.filters.account_id
        if (this.filters.direction) params.direction = this.filters.direction
        if (this.filters.scope) params.scope = this.filters.scope
        if (this.filters.category_id) params.category_id = this.filters.category_id
        if (this.filters.date_from) params.date_from = this.filters.date_from
        if (this.filters.date_to) params.date_to = this.filters.date_to

        params.page = this.pagination.page
        params.per_page = this.pagination.rowsPerPage
        params.sort_by = this.pagination.sortBy
        params.sort_dir = this.pagination.descending ? 'desc' : 'asc'

        const res = await api.get('/transactions', { params })
        const payload = res.data.data || res.data || {}

        this.transactions = payload.data || payload || []
        this.pagination.rowsNumber = payload.total || payload.meta?.total || this.transactions.length
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat daftar transaksi')
      } finally {
        this.loadingList = false
      }
    },

    onTableRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.loadTransactions()
    },

    applyFilters () {
      this.pagination.page = 1
      this.loadTransactions()
    },

    resetFilters () {
      this.filters = {
        account_id: null,
        direction: null,
        scope: null,
        category_id: null,
        date_from: '',
        date_to: ''
      }
      this.loadTransactions()
    },

    async refreshBalances () {
      try {
        const res = await api.get('/dashboard/summary')
        const payload = res?.data?.data ?? res?.data ?? {}
        const accounts = payload.accounts || []
        const map = {}
        accounts.forEach(a => {
          map[a.id] = a.balance
        })
        this.balancesById = map
      } catch (err) {
        // kalau gagal ambil saldo, jangan matikan halaman
        console.error(err)
      }
    },

    async validateSaldoSumber (accountId, amount, actionLabel = 'transaksi') {
      const acc = this.accountsById[accountId]
      if (!acc) return true

      // Validasi hanya untuk Rekening (bank) & Cash
      const restricted = acc.type === 'bank' || acc.type === 'cash'
      if (!restricted) return true

      // Pastikan saldo tersedia (kalau belum ada, coba ambil dari dashboard summary)
      if (!this.balancesById || this.balancesById[accountId] === undefined) {
        await this.refreshBalances()
      }

      // fallback: kalau endpoint summary tidak tersedia, pakai balance dari /accounts
      const balance = Number((this.balancesById && this.balancesById[accountId] !== undefined)
        ? this.balancesById[accountId]
        : (acc.balance ?? 0))

      // Syarat: saldo "kosong" = 0 / tidak valid
      if (!Number.isFinite(balance) || balance === 0) {
        Notify.create({
          type: 'warning',
          message: `Saldo akun Rekening/Cash masih kosong (Rp 0). Isi saldo dulu di menu Akun sebelum melakukan ${actionLabel}.`
        })
        return false
      }

      return true
    },

    async submitTransaction () {
      if (!this.form.account_id || !this.form.amount || !this.form.category_id) {
        Notify.create({
          type: 'warning',
          message: 'Akun, kategori, dan nominal wajib diisi'
        })
        return
      }

      const amt = Number(this.form.amount || 0)
      if (amt <= 0) {
        Notify.create({
          type: 'warning',
          message: 'Nominal harus lebih dari 0'
        })
        return
      }

      // VALIDASI: hanya untuk pengeluaran dari rekening/cash dengan saldo 0
      if (this.form.direction === 'expense') {
        const ok = await this.validateSaldoSumber(this.form.account_id, amt, 'pengeluaran')
        if (!ok) return
      }

      this.loading = true
      try {
        const payload = {
          account_id: this.form.account_id,
          direction: this.form.direction,
          scope: this.form.scope,
          category_id: this.form.category_id,
          amount: amt,
          transacted_at: this.form.transacted_at || undefined,
          description: this.form.description || undefined
        }

        await api.post('/transactions', payload)

        Notify.create({
          type: 'positive',
          message: 'Transaksi berhasil disimpan'
        })

        this.form.amount = null
        this.form.description = ''
        this.form.transacted_at = ''

        await this.refreshBalances()
        this.loadTransactions()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menyimpan transaksi')
      } finally {
        this.loading = false
      }
    },

    async submitTransfer () {
      if (!this.transferForm.from_account_id || !this.transferForm.to_account_id) {
        Notify.create({
          type: 'warning',
          message: 'Pilih akun sumber dan tujuan'
        })
        return
      }

      if (this.transferForm.from_account_id === this.transferForm.to_account_id) {
        Notify.create({
          type: 'warning',
          message: 'Akun sumber dan tujuan tidak boleh sama'
        })
        return
      }

      const amt = Number(this.transferForm.amount || 0)
      if (amt <= 0) {
        Notify.create({
          type: 'warning',
          message: 'Nominal transfer harus lebih dari 0'
        })
        return
      }

      // VALIDASI: sumber transfer rekening/cash dengan saldo 0 => blok
      const ok = await this.validateSaldoSumber(this.transferForm.from_account_id, amt, 'transfer')
      if (!ok) return

      this.loading = true
      try {
        const payload = {
          from_account_id: this.transferForm.from_account_id,
          to_account_id: this.transferForm.to_account_id,
          amount: amt,
          scope: this.transferForm.scope,
          transacted_at: this.transferForm.transacted_at || undefined,
          description: this.transferForm.description || undefined
        }

        await api.post('/transactions/transfer', payload)

        Notify.create({
          type: 'positive',
          message: 'Transfer berhasil disimpan'
        })

        this.transferForm.amount = null
        this.transferForm.description = ''
        this.transferForm.transacted_at = ''

        await this.refreshBalances()
        this.loadTransactions()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menyimpan transfer')
      } finally {
        this.loading = false
      }
    },

    openEdit (row) {
      if (row.transaction_type === 'transfer') {
        Notify.create({
          type: 'warning',
          message: 'Transfer tidak bisa diedit. Silakan hapus lalu buat ulang.'
        })
        return
      }

      this.editId = row.id
      this.editForm = {
        account_id: row.account_id,
        direction: row.direction,
        scope: row.scope,
        category_id: row.category_id,
        amount: row.amount,
        transacted_at: this.toDatetimeLocal(row.transacted_at),
        description: row.description || ''
      }
      this.editDialog = true
    },

    async submitEdit () {
      if (!this.editId) return

      if (!this.editForm.account_id || !this.editForm.amount || !this.editForm.category_id) {
        Notify.create({
          type: 'warning',
          message: 'Akun, kategori, dan nominal wajib diisi'
        })
        return
      }

      const amt = Number(this.editForm.amount || 0)
      if (amt <= 0) {
        Notify.create({
          type: 'warning',
          message: 'Nominal harus lebih dari 0'
        })
        return
      }

      // VALIDASI: saat edit pengeluaran juga dicek
      if (this.editForm.direction === 'expense') {
        const ok = await this.validateSaldoSumber(this.editForm.account_id, amt, 'pengeluaran')
        if (!ok) return
      }

      this.loading = true
      try {
        const payload = {
          account_id: this.editForm.account_id,
          direction: this.editForm.direction,
          scope: this.editForm.scope,
          category_id: this.editForm.category_id,
          amount: amt,
          transacted_at: this.editForm.transacted_at || undefined,
          description: this.editForm.description || undefined
        }

        await api.put(`/transactions/${this.editId}`, payload)

        Notify.create({
          type: 'positive',
          message: 'Transaksi berhasil diperbarui'
        })

        this.editDialog = false
        this.editId = null

        await this.refreshBalances()
        this.loadTransactions()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memperbarui transaksi')
      } finally {
        this.loading = false
      }
    },

    async deleteTransaction (row) {
      this.loading = true
      try {
        await api.delete(`/transactions/${row.id}`)
        Notify.create({
          type: 'positive',
          message: 'Transaksi berhasil dihapus'
        })
        await this.refreshBalances()
        this.loadTransactions()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menghapus transaksi')
      } finally {
        this.loading = false
      }
    },

    refreshAll () {
      this.loadMasterData()
      this.loadTransactions()
    },

    handleError (err, fallbackMessage) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
        Notify.create({
          type: 'negative',
          message: 'Sesi habis, silakan login lagi'
        })
        this.$router.push({ name: 'login' })
        return
      }

      const msg = err?.response?.data?.message || fallbackMessage || 'Terjadi kesalahan'
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

    scopeLabel (scope) {
      if (scope === 'family') return 'Keluarga'
      if (scope === 'personal') return 'Pribadi'
      return scope || '-'
    },

    directionLabel (direction, transactionType) {
      if (transactionType === 'transfer' || direction === 'transfer') return 'Transfer'
      if (direction === 'income') return 'Pemasukan'
      if (direction === 'expense') return 'Pengeluaran'
      return direction || '-'
    },

    toDatetimeLocal (val) {
      if (!val) return ''
      const d = new Date(val)
      if (Number.isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${day}T${h}:${min}`
    },

    defaultDescription (tx) {
      if (!tx) return ''
      if (tx.transaction_type === 'transfer') {
        return 'Transfer antar akun'
      }
      return this.directionLabel(tx.direction)
    }
  }
}
</script>

<style scoped>
.rounded-card {
  border-radius: 18px;
}

.tx-filter-field :deep(.q-field__control) {
  border-radius: 12px;
}

.tx-reset-btn {
  font-weight: 700;
}

.tx-item {
  padding-top: 10px;
  padding-bottom: 10px;
}

.tx-title {
  line-height: 1.2;
}

.tx-sub {
  line-height: 1.15;
}

.tx-right {
  min-width: 132px;
}
</style>

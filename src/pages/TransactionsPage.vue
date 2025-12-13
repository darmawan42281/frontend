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
          :loading="loadingList"
          @click="loadTransactions"
        />
      </div>
    </div>

    <!-- Tabs: Transaksi / Transfer -->
    <q-card class="q-mb-md rounded-card">
      <q-tabs
        v-model="activeTab"
        dense
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
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.account_id"
                  :options="accountOptions"
                  label="Akun"
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-6 col-md-3">
                <q-select
                  v-model="form.direction"
                  :options="directionOptions"
                  label="Tipe"
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-6 col-md-3">
                <q-select
                  v-model="form.scope"
                  :options="scopeOptions"
                  label="Scope"
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.category_id"
                  :options="categoryOptions"
                  label="Kategori"
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="loading || categoryOptions.length === 0"
                />
              </div>

              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.amount"
                  type="number"
                  label="Nominal"
                  outlined
                  dense
                  :disable="loading"
                >
                  <template #prepend>
                    <q-icon name="payments" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.transacted_at"
                  type="datetime-local"
                  label="Tanggal & jam"
                  outlined
                  dense
                  :disable="loading"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.description"
                  type="textarea"
                  label="Catatan (opsional)"
                  outlined
                  autogrow
                  :disable="loading"
                />
              </div>

              <div class="col-12">
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  label="Simpan Transaksi"
                  :loading="loading"
                />
              </div>
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
                  label="Dari akun"
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="transferForm.to_account_id"
                  :options="accountOptions"
                  label="Ke akun"
                  outlined
                  dense
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
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="transferForm.amount"
                  type="number"
                  label="Nominal transfer"
                  outlined
                  dense
                  :disable="loading"
                >
                  <template #prepend>
                    <q-icon name="payments" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="transferForm.transacted_at"
                  type="datetime-local"
                  label="Tanggal & jam"
                  outlined
                  dense
                  :disable="loading"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="transferForm.description"
                  label="Catatan (opsional)"
                  outlined
                  dense
                  :disable="loading"
                />
              </div>

              <div class="col-12">
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  label="Simpan Transfer"
                  :loading="loading"
                />
              </div>
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Filter & Daftar Transaksi -->
    <q-card class="rounded-card">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <div class="col">
            <div class="text-subtitle1">Riwayat Transaksi</div>
            <div class="text-caption text-grey-7">
              Filter transaksi berdasarkan akun, tipe, scope, dan tanggal
            </div>
          </div>
        </div>

        <!-- Filter -->
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.account_id"
              :options="[{ label: 'Semua akun', value: null }, ...accountOptions]"
              label="Akun"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>

          <div class="col-6 col-md-2">
            <q-select
              v-model="filters.direction"
              :options="[
                { label: 'Semua', value: null },
                ...directionOptions
              ]"
              label="Tipe"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>

          <div class="col-6 col-md-2">
            <q-select
              v-model="filters.scope"
              :options="[
                { label: 'Semua', value: null },
                ...scopeOptions
              ]"
              label="Scope"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>

          <div class="col-6 col-md-2">
            <q-input
              v-model="filters.date_from"
              type="date"
              label="Dari tanggal"
              outlined
              dense
            />
          </div>

          <div class="col-6 col-md-2">
            <q-input
              v-model="filters.date_to"
              type="date"
              label="Sampai tanggal"
              outlined
              dense
            />
          </div>

          <div class="col-12 col-md-3 q-mt-sm q-mt-md-none">
            <div class="row items-center">
              <div class="col">
                <q-select
                  v-model="filters.category_id"
                  :options="[{ label: 'Semua kategori', value: null }, ...categoryFilterOptions]"
                  label="Kategori"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <div class="col-auto q-pl-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="filter_alt"
                  :loading="loadingList"
                  @click="loadTransactions"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  label="Reset"
                  @click="resetFilters"
                />
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-sm" />

        <!-- List transaksi -->
        <q-list v-if="transactions.length" separator>
          <q-item v-for="tx in transactions" :key="tx.id">
            <q-item-section avatar>
              <q-avatar
                size="36px"
                :color="avatarColor(tx)"
                text-color="white"
              >
                <q-icon :name="avatarIcon(tx)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>
                {{ tx.description || defaultDescription(tx) }}
              </q-item-label>
              <q-item-label caption>
                {{ accountName(tx) }} •
                {{ categoryName(tx) }} •
                {{ formatDate(tx.transacted_at) }}
              </q-item-label>
              <q-item-label caption>
                {{ directionLabel(tx.direction) }} •
                {{ scopeLabel(tx.scope) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <div class="text-right">
                <div
                  class="text-weight-bold"
                  :class="tx.direction === 'income' ? 'text-positive' : 'text-negative'"
                >
                  {{ formatCurrency(tx.amount) }}
                </div>
                <div class="q-mt-xs">
                  <q-btn
                    v-if="canEdit(tx)"
                    dense
                    flat
                    round
                    icon="edit"
                    @click="openEdit(tx)"
                  />
                  <q-btn
                    v-if="canDelete(tx)"
                    dense
                    flat
                    round
                    icon="delete"
                    color="negative"
                    @click="confirmDelete(tx)"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-grey text-center q-my-md">
          Belum ada transaksi untuk filter ini.
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog EDIT transaksi -->
    <q-dialog v-model="editDialog">
      <q-card class="rounded-card" style="min-width: 320px; max-width: 480px;">
        <q-card-section>
          <div class="text-subtitle1">
            Edit Transaksi
          </div>
          <div class="text-caption text-grey-7">
            Hanya transaksi normal yang tidak terhubung ke tagihan/transfer yang bisa diedit
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="editForm.account_id"
            :options="accountOptions"
            label="Akun"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            v-model="editForm.direction"
            :options="directionOptions"
            label="Tipe"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            v-model="editForm.scope"
            :options="scopeOptions"
            label="Scope"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            v-model="editForm.category_id"
            :options="editCategoryOptions"
            label="Kategori"
            outlined
            dense
            emit-value
            map-options
          />
          <q-input
            v-model.number="editForm.amount"
            type="number"
            label="Nominal"
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="payments" />
            </template>
          </q-input>
          <q-input
            v-model="editForm.transacted_at"
            type="datetime-local"
            label="Tanggal & jam"
            outlined
            dense
          />
          <q-input
            v-model="editForm.description"
            type="textarea"
            label="Catatan"
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Batal"
            v-close-popup
            :disable="editLoading"
          />
          <q-btn
            label="Simpan"
            color="primary"
            :loading="editLoading"
            @click="submitEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog DELETE transaksi -->
    <q-dialog v-model="deleteDialog">
      <q-card class="rounded-card" style="min-width: 320px;">
        <q-card-section>
          <div class="text-subtitle1">Hapus Transaksi</div>
          <div class="text-body2 q-mt-sm">
            Yakin ingin menghapus transaksi
            <b>{{ selectedTx?.description || defaultDescription(selectedTx) }}</b>?
            <br>
            Hanya transaksi normal yang tidak terhubung ke tagihan/transfer yang bisa dihapus.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Batal"
            v-close-popup
            :disable="deleteLoading"
          />
          <q-btn
            label="Hapus"
            color="negative"
            :loading="deleteLoading"
            @click="deleteTransaction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { Notify } from 'quasar'

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
      directionOptions: [
        { label: 'Pengeluaran', value: 'expense' },
        { label: 'Pemasukan', value: 'income' }
      ],
      scopeOptions: [
        { label: 'Keluarga', value: 'family' },
        { label: 'Pribadi', value: 'personal' }
      ],

      // edit / delete
      editDialog: false,
      editLoading: false,
      editForm: {
        id: null,
        account_id: null,
        direction: 'expense',
        scope: 'family',
        category_id: null,
        amount: null,
        transacted_at: '',
        description: ''
      },
      deleteDialog: false,
      deleteLoading: false,
      selectedTx: null
    }
  },
  computed: {
    categoryOptions () {
      const list = this.form.direction === 'income'
        ? this.categoriesIncome
        : this.categoriesExpense

      return list.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
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
    editCategoryOptions () {
      const dir = this.editForm.direction
      const list = dir === 'income'
        ? this.categoriesIncome
        : this.categoriesExpense

      return list.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
    }
  },
  created () {
    this.loadMasterData()
    this.loadTransactions()
  },
  methods: {
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

        const txRes = await api.get('/transactions', { params })
        this.transactions = txRes.data.data || txRes.data || []
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat transaksi')
      } finally {
        this.loadingList = false
      }
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

    async submitTransaction () {
      if (!this.form.account_id || !this.form.amount || !this.form.category_id) {
        Notify.create({
          type: 'warning',
          message: 'Akun, kategori, dan nominal wajib diisi'
        })
        return
      }

      this.loading = true
      try {
        const payload = {
          account_id: this.form.account_id,
          direction: this.form.direction,
          scope: this.form.scope,
          category_id: this.form.category_id,
          amount: this.form.amount,
          transacted_at: this.form.transacted_at || undefined,
          description: this.form.description || undefined
        }

        await api.post('/transactions', payload)

        Notify.create({
          type: 'positive',
          message: 'Transaksi berhasil disimpan'
        })

        // reset sebagian form
        this.form.amount = null
        this.form.description = ''
        this.form.transacted_at = ''

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

      if (!this.transferForm.amount || this.transferForm.amount <= 0) {
        Notify.create({
          type: 'warning',
          message: 'Nominal transfer harus lebih dari 0'
        })
        return
      }

      this.loading = true
      try {
        const payload = {
          from_account_id: this.transferForm.from_account_id,
          to_account_id: this.transferForm.to_account_id,
          amount: this.transferForm.amount,
          scope: this.transferForm.scope,
          transacted_at: this.transferForm.transacted_at || undefined,
          description: this.transferForm.description || undefined
        }

        await api.post('/transactions/transfer', payload)

        Notify.create({
          type: 'positive',
          message: 'Transfer berhasil disimpan'
        })

        // reset sebagian
        this.transferForm.amount = null
        this.transferForm.description = ''
        this.transferForm.transacted_at = ''

        this.loadTransactions()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menyimpan transfer')
      } finally {
        this.loading = false
      }
    },

    // ==== EDIT / DELETE ====

    canEdit (tx) {
      return tx && tx.transaction_type === 'normal' && !tx.bill_id && !tx.transfer_group_id
    },

    canDelete (tx) {
      return this.canEdit(tx)
    },

    openEdit (tx) {
      if (!this.canEdit(tx)) {
        Notify.create({
          type: 'warning',
          message: 'Hanya transaksi normal yang tidak terhubung ke tagihan/transfer yang bisa diedit'
        })
        return
      }

      this.editForm = {
        id: tx.id,
        account_id: tx.account_id,
        direction: tx.direction,
        scope: tx.scope || 'family',
        category_id: tx.category_id,
        amount: tx.amount,
        transacted_at: this.toDateTimeLocal(tx.transacted_at),
        description: tx.description || ''
      }

      this.editDialog = true
    },

    async submitEdit () {
      if (!this.editForm.account_id || !this.editForm.amount || !this.editForm.category_id) {
        Notify.create({
          type: 'warning',
          message: 'Akun, kategori, dan nominal wajib diisi'
        })
        return
      }

      this.editLoading = true
      try {
        const payload = {
          account_id: this.editForm.account_id,
          direction: this.editForm.direction,
          scope: this.editForm.scope,
          category_id: this.editForm.category_id,
          amount: this.editForm.amount,
          transacted_at: this.editForm.transacted_at || undefined,
          description: this.editForm.description || undefined
        }

        await api.put(`/transactions/${this.editForm.id}`, payload)

        Notify.create({
          type: 'positive',
          message: 'Transaksi berhasil diupdate'
        })

        this.editDialog = false
        this.loadTransactions()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal mengupdate transaksi')
      } finally {
        this.editLoading = false
      }
    },

    confirmDelete (tx) {
      if (!this.canDelete(tx)) {
        Notify.create({
          type: 'warning',
          message: 'Hanya transaksi normal yang tidak terhubung ke tagihan/transfer yang bisa dihapus'
        })
        return
      }

      this.selectedTx = tx
      this.deleteDialog = true
    },

    async deleteTransaction () {
      if (!this.selectedTx) return

      this.deleteLoading = true
      try {
        await api.delete(`/transactions/${this.selectedTx.id}`)

        Notify.create({
          type: 'positive',
          message: 'Transaksi berhasil dihapus'
        })

        this.deleteDialog = false
        this.selectedTx = null
        this.loadTransactions()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menghapus transaksi')
      } finally {
        this.deleteLoading = false
      }
    },

    // ==== UTIL ====

    handleError (err, fallbackMessage) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
        Notify.create({
          type: 'negative',
          message: 'Sesi habis, silakan login lagi'
        })
        this.$router.push({ name: 'login' })
      } else {
        const msg = err?.response?.data?.message || fallbackMessage
        Notify.create({
          type: 'negative',
          message: msg
        })
      }
    },

    accountName (tx) {
      const acc = this.accountsById[tx.account_id]
      return acc ? acc.name : `Akun #${tx.account_id}`
    },

    categoryName (tx) {
      if (!tx.category_id) return 'Tanpa kategori'
      const cat = this.categoriesById[tx.category_id]
      return cat ? cat.name : `Kategori #${tx.category_id}`
    },

    directionLabel (direction) {
      if (direction === 'income') return 'Pemasukan'
      if (direction === 'expense') return 'Pengeluaran'
      return direction || '-'
    },

    scopeLabel (scope) {
      if (scope === 'family') return 'Keluarga'
      if (scope === 'personal') return 'Pribadi'
      return 'Tidak ditentukan'
    },

    avatarColor (tx) {
      if (tx.transaction_type === 'transfer') return 'primary'
      return tx.direction === 'income' ? 'positive' : 'negative'
    },

    avatarIcon (tx) {
      if (tx.transaction_type === 'transfer') return 'swap_horiz'
      return tx.direction === 'income' ? 'arrow_downward' : 'arrow_upward'
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
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    toDateTimeLocal (value) {
      if (!value) return ''
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) {
        // fallback: kalau dari server sudah format "YYYY-MM-DD HH:MM:SS"
        return String(value).replace(' ', 'T').slice(0, 16)
      }
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
  border-radius: 20px;
}
</style>

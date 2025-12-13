<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Tagihan Keluarga</div>
        <div class="text-caption text-grey-7">
          Pantau, tambah, dan bayar tagihan keluarga per bulan
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          flat
          dense
          round
          icon="add"
          class="q-mr-sm"
          @click="openCreateDialog"
        />
        <q-btn
          flat
          dense
          round
          icon="refresh"
          :loading="loading"
          @click="loadBills"
        />
      </div>
    </div>

    <!-- Filter status -->
    <q-card class="q-mb-md rounded-card">
      <q-card-section>
        <div class="row items-center q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <div class="text-subtitle1">Filter Status</div>
            <div class="text-caption text-grey-7">
              Tampilkan tagihan berdasarkan status
            </div>
          </div>
          <div class="col-12 col-md-6">
            <q-btn-toggle
              v-model="filter"
              spread
              no-caps
              dense
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="[
                { label: 'Semua', value: 'all' },
                { label: 'Belum dibayar', value: 'unpaid' },
                { label: 'Sebagian', value: 'partial' },
                { label: 'Lunas', value: 'paid' },
                { label: 'Terlambat', value: 'overdue' }
              ]"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filter periode -->
    <q-card class="q-mb-md rounded-card">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-3">
            <q-input
              v-model.number="currentYear"
              type="number"
              label="Tahun"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model.number="currentMonth"
              :options="monthOptions"
              label="Bulan"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-3 flex items-end">
            <q-btn
              unelevated
              color="primary"
              label="Terapkan"
              :loading="loading"
              @click="loadBills"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Daftar tagihan -->
    <q-card class="rounded-card">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <div class="col">
            <div class="text-subtitle1">
              Tagihan Bulan {{ currentMonth }} / {{ currentYear }}
            </div>
            <div class="text-caption text-grey-7">
              Klik tombol bayar untuk mencatat pembayaran sebagai transaksi
            </div>
          </div>
        </div>

        <q-separator class="q-my-sm" />

        <q-list v-if="filteredBills.length" separator>
          <q-item
            v-for="bill in filteredBills"
            :key="bill.id"
            class="q-py-sm"
          >
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ bill.title }}
              </q-item-label>
              <q-item-label caption class="q-mt-xs">
                Jatuh tempo:
                <span :class="bill.status === 'overdue' ? 'text-negative' : ''">
                  {{ formatDate(bill.due_date) }}
                </span>
              </q-item-label>
              <q-item-label caption>
                Status:
                <q-chip
                  dense
                  :color="statusColor(bill.status)"
                  text-color="white"
                  class="q-ml-xs"
                >
                  {{ statusLabel(bill.status) }}
                </q-chip>
                <span class="q-ml-sm">
                  Dibayar: {{ formatCurrency(bill.paid_amount || 0) }} /
                  {{ formatCurrency(bill.amount) }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <div class="text-weight-bold q-mb-xs">
                {{ formatCurrency(bill.amount) }}
              </div>
              <div>
                <q-btn
                  v-if="bill.status !== 'paid'"
                  unelevated
                  size="sm"
                  color="primary"
                  label="Bayar"
                  @click="openPayDialog(bill)"
                />
                <q-chip
                  v-else
                  dense
                  color="positive"
                  text-color="white"
                  icon="check"
                >
                  Lunas
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-grey text-center q-my-md">
          Belum ada tagihan untuk periode ini.
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog bayar tagihan -->
    <q-dialog v-model="payDialog">
      <q-card class="rounded-card" style="min-width: 320px; max-width: 420px;">
        <q-card-section>
          <div class="text-subtitle1">
            Bayar Tagihan
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            {{ selectedBill?.title }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-md">
          <q-input
            v-model="displayAmount"
            type="number"
            label="Nominal dibayar"
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="payments" />
            </template>
          </q-input>

          <q-select
            v-model="payForm.account_id"
            :options="accountOptions"
            label="Bayar dari akun"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-model="payForm.category_id"
            :options="categoryOptions"
            label="Kategori pengeluaran"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-model="payForm.scope"
            :options="scopeOptions"
            label="Scope"
            outlined
            dense
            emit-value
            map-options
          />

          <q-input
            v-model="payForm.transacted_at"
            type="datetime-local"
            label="Tanggal & jam bayar"
            outlined
            dense
          />

          <q-input
            v-model="payForm.description"
            type="textarea"
            label="Catatan (opsional)"
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Batal"
            v-close-popup
            :disable="payLoading"
          />
          <q-btn
            label="Bayar"
            color="primary"
            :loading="payLoading"
            @click="submitPay"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog tambah tagihan -->
    <q-dialog v-model="createDialog">
      <q-card class="rounded-card" style="min-width: 320px; max-width: 420px;">
        <q-card-section>
          <div class="text-subtitle1">
            Tambah Tagihan
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Tagihan manual seperti listrik, internet, dll
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="createForm.title"
            label="Nama tagihan"
            outlined
            dense
          />
          <q-input
            v-model="createForm.due_date"
            type="date"
            label="Jatuh tempo"
            outlined
            dense
          />
          <q-input
            v-model.number="createForm.amount"
            type="number"
            label="Nominal"
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="payments" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Batal"
            v-close-popup
            :disable="createLoading"
          />
          <q-btn
            label="Simpan"
            color="primary"
            :loading="createLoading"
            @click="submitCreate"
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
  name: 'BillsPage',
  data () {
    const now = new Date()
    return {
      loading: false,
      bills: [],
      filter: 'all',
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,

      accounts: [],
      accountOptions: [],
      categoriesExpense: [],
      categoryOptions: [],

      payDialog: false,
      payLoading: false,
      selectedBill: null,
      payForm: {
        account_id: null,
        category_id: null,
        scope: 'family',
        transacted_at: '',
        description: ''
      },
      displayAmount: null,

      createDialog: false,
      createLoading: false,
      createForm: {
        title: '',
        due_date: '',
        amount: null
      },

      scopeOptions: [
        { label: 'Keluarga', value: 'family' },
        { label: 'Pribadi', value: 'personal' }
      ],
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
    filteredBills () {
      if (this.filter === 'all') {
        return this.bills
      }
      return this.bills.filter(b => b.status === this.filter)
    }
  },
  created () {
    this.loadBills()
    this.loadAccounts()
    this.loadCategories()
  },
  methods: {
    async loadBills () {
      this.loading = true
      try {
        const params = {
          year: this.currentYear,
          month: this.currentMonth
        }
        const { data } = await api.get('/bills', { params })
        this.bills = data.data || data || []
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat tagihan')
      } finally {
        this.loading = false
      }
    },

    async loadAccounts () {
      try {
        const { data } = await api.get('/accounts')
        const accounts = data.data || data || []
        this.accounts = accounts
        this.accountOptions = accounts.map(acc => ({
          label: acc.name,
          value: acc.id
        }))

        if (!this.payForm.account_id && this.accountOptions.length > 0) {
          this.payForm.account_id = this.accountOptions[0].value
        }
      } catch (err) {
        console.error(err)
        // gagal load akun tidak fatal
      }
    },

    async loadCategories () {
      try {
        const { data } = await api.get('/categories', { params: { type: 'expense' } })
        this.categoriesExpense = data.data || data || []
        this.categoryOptions = this.categoriesExpense.map(c => ({
          label: c.name,
          value: c.id
        }))

        if (!this.payForm.category_id && this.categoryOptions.length > 0) {
          this.payForm.category_id = this.categoryOptions[0].value
        }
      } catch (err) {
        console.error(err)
        // gagal load kategori tidak fatal
      }
    },

    openPayDialog (bill) {
      this.selectedBill = bill
      this.payDialog = true

      const remaining = (bill.amount || 0) - (bill.paid_amount || 0)
      this.displayAmount = remaining > 0 ? remaining : bill.amount

      const now = new Date()
      const iso = now.toISOString().slice(0, 16) // yyyy-MM-ddTHH:mm
      this.payForm.transacted_at = iso

      if (this.accountOptions.length > 0 && !this.payForm.account_id) {
        this.payForm.account_id = this.accountOptions[0].value
      }
      if (this.categoryOptions.length > 0 && !this.payForm.category_id) {
        this.payForm.category_id = this.categoryOptions[0].value
      }
    },

    async submitPay () {
      if (!this.selectedBill) return

      if (!this.payForm.account_id || !this.payForm.category_id) {
        Notify.create({
          type: 'warning',
          message: 'Akun dan kategori wajib diisi'
        })
        return
      }

      const amount = Number(this.displayAmount || 0)
      if (amount <= 0) {
        Notify.create({
          type: 'warning',
          message: 'Nominal pembayaran harus lebih dari 0'
        })
        return
      }

      this.payLoading = true
      try {
        const payload = {
          account_id: this.payForm.account_id,
          category_id: this.payForm.category_id,
          scope: this.payForm.scope,
          amount,
          transacted_at: this.payForm.transacted_at || undefined,
          description: this.payForm.description || undefined
        }

        await api.post(`/bills/${this.selectedBill.id}/pay`, payload)

        Notify.create({
          type: 'positive',
          message: 'Pembayaran tagihan berhasil dicatat'
        })

        this.payDialog = false
        this.payForm.description = ''
        this.loadBills()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal membayar tagihan')
      } finally {
        this.payLoading = false
      }
    },

    openCreateDialog () {
      this.createForm = {
        title: '',
        due_date: '',
        amount: null
      }
      this.createDialog = true
    },

    async submitCreate () {
      if (!this.createForm.title || !this.createForm.due_date || !this.createForm.amount) {
        Notify.create({
          type: 'warning',
          message: 'Nama, jatuh tempo, dan nominal wajib diisi'
        })
        return
      }

      this.createLoading = true
      try {
        const payload = {
          title: this.createForm.title,
          due_date: this.createForm.due_date,
          amount: this.createForm.amount
        }

        await api.post('/bills', payload)

        Notify.create({
          type: 'positive',
          message: 'Tagihan berhasil ditambahkan'
        })

        this.createDialog = false
        this.loadBills()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menambahkan tagihan')
      } finally {
        this.createLoading = false
      }
    },

    statusLabel (status) {
      if (status === 'unpaid') return 'Belum dibayar'
      if (status === 'partial') return 'Sebagian'
      if (status === 'paid') return 'Lunas'
      if (status === 'overdue') return 'Terlambat'
      return status || '-'
    },

    statusColor (status) {
      if (status === 'unpaid') return 'orange'
      if (status === 'partial') return 'primary'
      if (status === 'paid') return 'positive'
      if (status === 'overdue') return 'negative'
      return 'grey'
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

    formatDateTime (value) {
      if (!value) return '-'
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return value
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate() + 1).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${day} ${h}:${min}`
    },

    handleError (err, fallbackMessage) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
        Notify.create({
          type: 'negative',
          message: 'Sesi habis, silakan login lagi'
        })
        this.$router.push({ name: 'login' })
      } else {
        const msg = err.response?.data?.message || fallbackMessage
        Notify.create({
          type: 'negative',
          message: msg
        })
      }
    }
  }
}
</script>

<style scoped>
.rounded-card {
  border-radius: 20px;
}
</style>

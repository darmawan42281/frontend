<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Akun Keuangan</div>
        <div class="text-caption text-grey-7">
          Kelola rekening bank, cash, e-wallet, kartu kredit, dan paylater
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          unelevated
          dense
          icon="add"
          label="Tambah Akun"
          class="q-mr-sm"
          @click="openCreate"
        />
        <q-btn
          flat
          dense
          round
          icon="refresh"
          :loading="loading"
          @click="loadAll"
        />
      </div>
    </div>

    <!-- Daftar akun -->
    <q-card class="rounded-card">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <div class="col">
            <div class="text-subtitle1">Daftar Akun</div>
            <div class="text-caption text-grey-7">
              Klik ikon pensil untuk edit, ikon tempat sampah untuk hapus
            </div>
          </div>
        </div>

        <q-separator class="q-my-xs" />

        <q-list v-if="accounts.length" separator>
          <q-item
            v-for="acc in accounts"
            :key="acc.id"
          >
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ acc.name }}
                <q-badge
                  v-if="!acc.is_active"
                  outline
                  color="grey"
                  class="q-ml-xs"
                >
                  Non-aktif
                </q-badge>
              </q-item-label>
              <q-item-label caption>
                {{ typeLabel(acc.type) }}
                <span
                  v-if="acc.credit_limit && (acc.type === 'credit_card' || acc.type === 'paylater')"
                >
                  • Limit: {{ formatCurrency(acc.credit_limit) }}
                </span>
                <span v-if="acc.billing_day && acc.due_day">
                  • Tagihan tgl {{ acc.billing_day }}, jatuh tempo tgl {{ acc.due_day }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-right">
                <div class="text-weight-bold">
                  {{ formatCurrency(balanceOf(acc.id)) }}
                </div>
                <div class="q-mt-xs">
                  <q-btn
                    dense
                    flat
                    round
                    icon="edit"
                    @click="openEdit(acc)"
                  />
                  <q-btn
                    dense
                    flat
                    round
                    icon="delete"
                    color="negative"
                    @click="confirmDelete(acc)"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-grey text-center q-my-md">
          Belum ada akun. Tambahkan akun pertama kamu.
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog tambah / edit akun -->
    <q-dialog v-model="formDialog">
      <q-card class="rounded-card" style="min-width: 320px; max-width: 480px;">
        <q-card-section>
          <div class="text-subtitle1">
            {{ formMode === 'create' ? 'Tambah Akun' : 'Edit Akun' }}
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Pilih tipe akun: cash, bank, e-wallet, kartu kredit, atau paylater
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nama akun"
            outlined
            dense
          />
          <q-select
            v-model="form.type"
            :options="typeOptions"
            label="Tipe akun"
            outlined
            dense
            emit-value
            map-options
          />
          <q-input
            v-model="form.currency"
            label="Mata uang"
            outlined
            dense
            hint="Contoh: IDR, USD"
          />

          <q-input
            v-model.number="form.credit_limit"
            type="number"
            label="Limit (khusus kartu kredit / paylater, opsional)"
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="credit_card" />
            </template>
          </q-input>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model.number="form.billing_day"
                type="number"
                label="Tgl cetak tagihan"
                outlined
                dense
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="form.due_day"
                type="number"
                label="Tgl jatuh tempo"
                outlined
                dense
              />
            </div>
          </div>

          <q-toggle
            v-model="form.is_active"
            label="Akun aktif"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Batal"
            v-close-popup
            :disable="saving"
          />
          <q-btn
            :label="formMode === 'create' ? 'Simpan' : 'Update'"
            color="primary"
            :loading="saving"
            @click="submitForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog konfirmasi hapus -->
    <q-dialog v-model="deleteDialog">
      <q-card class="rounded-card" style="min-width: 320px;">
        <q-card-section>
          <div class="text-subtitle1">Hapus Akun</div>
          <div class="text-body2 q-mt-sm">
            Yakin ingin menghapus akun
            <b>{{ selectedAccount?.name }}</b>?
            <br>
            Kalau akun sudah punya transaksi, sistem akan menolak penghapusan.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Batal"
            v-close-popup
            :disable="deleting"
          />
          <q-btn
            label="Hapus"
            color="negative"
            :loading="deleting"
            @click="deleteAccount"
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
  name: 'AccountsPage',
  data () {
    return {
      loading: false,
      saving: false,
      deleting: false,

      accounts: [],
      balancesById: {},

      formDialog: false,
      formMode: 'create', // 'create' | 'edit'
      form: {
        id: null,
        name: '',
        type: 'bank',
        currency: 'IDR',
        credit_limit: null,
        billing_day: null,
        due_day: null,
        is_active: true
      },

      deleteDialog: false,
      selectedAccount: null,

      typeOptions: [
        { label: 'Cash', value: 'cash' },
        { label: 'Rekening Bank', value: 'bank' },
        { label: 'E-Wallet', value: 'ewallet' },
        { label: 'Kartu Kredit', value: 'credit_card' },
        { label: 'Paylater', value: 'paylater' }
      ]
    }
  },
  created () {
    this.loadAll()
  },
  methods: {
    async loadAll () {
      this.loading = true
      try {
        await Promise.all([
          this.loadAccounts(),
          this.loadBalances()
        ])
      } finally {
        this.loading = false
      }
    },

    async loadAccounts () {
      const { data } = await api.get('/accounts')
      this.accounts = data.data || data || []
    },

    async loadBalances () {
      try {
        const { data } = await api.get('/dashboard/summary')
        const accounts = data.accounts || []
        const map = {}
        accounts.forEach(a => {
          map[a.id] = a.balance
        })
        this.balancesById = map
      } catch (err) {
        // kalau summary gagal, jangan matikan halaman, cukup saldo = 0
        console.error(err)
      }
    },

    balanceOf (id) {
      return this.balancesById[id] ?? 0
    },

    openCreate () {
      this.formMode = 'create'
      this.formDialog = true
      this.form = {
        id: null,
        name: '',
        type: 'bank',
        currency: 'IDR',
        credit_limit: null,
        billing_day: null,
        due_day: null,
        is_active: true
      }
    },

    openEdit (acc) {
      this.formMode = 'edit'
      this.formDialog = true
      this.form = {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        currency: acc.currency || 'IDR',
        credit_limit: acc.credit_limit,
        billing_day: acc.billing_day,
        due_day: acc.due_day,
        is_active: Boolean(acc.is_active)
      }
    },

    async submitForm () {
      if (!this.form.name || !this.form.type) {
        Notify.create({
          type: 'warning',
          message: 'Nama akun dan tipe akun wajib diisi'
        })
        return
      }

      this.saving = true
      try {
        const payload = {
          name: this.form.name,
          type: this.form.type,
          currency: this.form.currency || 'IDR',
          credit_limit: this.form.credit_limit || null,
          billing_day: this.form.billing_day || null,
          due_day: this.form.due_day || null,
          is_active: this.form.is_active
        }

        if (this.formMode === 'create') {
          await api.post('/accounts', payload)
          Notify.create({
            type: 'positive',
            message: 'Akun berhasil ditambahkan'
          })
        } else {
          await api.put(`/accounts/${this.form.id}`, payload)
          Notify.create({
            type: 'positive',
            message: 'Akun berhasil diupdate'
          })
        }

        this.formDialog = false
        await this.loadAll()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menyimpan akun')
      } finally {
        this.saving = false
      }
    },

    confirmDelete (acc) {
      this.selectedAccount = acc
      this.deleteDialog = true
    },

    async deleteAccount () {
      if (!this.selectedAccount) return

      this.deleting = true
      try {
        await api.delete(`/accounts/${this.selectedAccount.id}`)

        Notify.create({
          type: 'positive',
          message: 'Akun berhasil dihapus'
        })

        this.deleteDialog = false
        this.selectedAccount = null
        await this.loadAll()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menghapus akun')
      } finally {
        this.deleting = false
      }
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
        return
      }

      const msg = err.response?.data?.message || fallbackMessage
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

    typeLabel (type) {
      if (type === 'cash') return 'Cash'
      if (type === 'bank') return 'Rekening Bank'
      if (type === 'ewallet') return 'E-Wallet'
      if (type === 'credit_card') return 'Kartu Kredit'
      if (type === 'paylater') return 'Paylater'
      return type || '-'
    }
  }
}
</script>

<style scoped>
.rounded-card {
  border-radius: 20px;
}
</style>

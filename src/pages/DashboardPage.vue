<template>
  <q-page class="bg-grey-2">

    <!-- ====== BAGIAN ATAS (HEADER + RINGKASAN + CTA) STICKY ====== -->
    <div class="dashboard-sticky-container">
      <!-- HEADER BIRU -->
      <div class="dashboard-header-bg q-px-md q-pt-md q-pb-lg">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-h6 text-white">
              Keuangan Keluarga
            </div>
            <div class="text-caption text-blue-1">
              Atur keuangan kapan pun dan di mana pun
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              dense
              round
              icon="logout"
              color="white"
              @click="logout"
            />
          </div>
        </div>

        <!-- Mini tab di header (Home / Support / Akun) hanya tampilan -->
        <div class="row q-mt-md">
          <div class="col-auto">
            <q-chip dense square color="white" text-color="primary" icon="home">
              Home
            </q-chip>
          </div>
          <div class="col-auto">
            <q-chip dense square color="transparent" text-color="white" outline>
              Support
            </q-chip>
          </div>
          <div class="col-auto">
            <q-chip dense square color="transparent" text-color="white" outline>
              Akun
            </q-chip>
          </div>
        </div>
      </div>

      <!-- KARTU RINGKASAN PUTIH -->
      <div class="q-px-md">
        <q-card class="summary-card q-pa-md">
          <div class="row q-mb-xs items-center">
            <div class="col text-caption text-grey-7">
              Pemasukan
            </div>
            <div class="col-auto text-body2 text-positive text-weight-medium">
              {{ formatCurrency(summary.income) }}
            </div>
          </div>
          <div class="row q-mb-xs items-center">
            <div class="col text-caption text-grey-7">
              Pengeluaran
            </div>
            <div class="col-auto text-body2 text-negative text-weight-medium">
              {{ formatCurrency(summary.expense) }}
            </div>
          </div>
          <div class="row items-center">
            <div class="col text-caption text-grey-7">
              Saldo kas/bank
            </div>
            <div class="col-auto text-body2 text-weight-medium text-primary">
              {{ formatCurrency(cashBankBalance) }}
            </div>
          </div>

          <div class="row items-center q-mt-xs">
            <div class="col text-caption text-grey-7">
              Hutang CC/Paylater
            </div>
            <div class="col-auto text-body2 text-weight-medium text-negative">
              {{ formatCurrency(ccPaylaterDebt) }}
            </div>
          </div>
        </q-card>
      </div>

      <!-- TOMBOL BESAR (CTA) – ukurannya sama -->
      <div class="q-px-md q-pt-sm q-pb-md">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn
              unelevated
              color="primary"
              class="full-width cta-btn cta-btn--small-label"
              icon="edit"
              label="Catat Keuangan"
              @click="go('transactions')"
            />
          </div>
          <div class="col-6">
            <q-btn
              unelevated
              color="orange"
              class="full-width cta-btn"
              icon="insights"
              label="Laporan"
              @click="go('reports')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ====== KONTEN YANG BISA DISCROLL DI BAWAHNYA ====== -->
    <div class="q-pa-md q-pt-sm">
      <!-- MENU UTAMA (ICON GRID) -->
      <q-card class="rounded-card q-mb-md">
        <q-card-section>
          <div class="text-subtitle1">
            Menu Utama
          </div>
          <div class="text-caption text-muted">
            Akses cepat ke fitur utama aplikasi
          </div>

          <div class="row q-col-gutter-md q-mt-sm justify-around">
            <div
              v-for="item in mainMenu"
              :key="item.route"
              class="col-3 col-sm-2 flex flex-center q-mb-md"
            >
              <div class="column items-center">
                <q-btn
                  round
                  flat
                  class="menu-circle-btn"
                  :icon="item.icon"
                  :style="{ backgroundColor: item.bgColor, color: item.iconColor }"
                  @click="go(item.route)"
                />
                <div class="text-caption text-center q-mt-xs">
                  {{ item.label }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- SALDO AKUN -->
      <q-card class="rounded-card q-mb-md">
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <div class="col">
              <div class="text-subtitle1">
                Saldo Akun
              </div>
              <div class="text-caption text-muted">
                Ringkasan rekening, cash, kartu kredit & paylater
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                dense
                round
                icon="settings"
                @click="go('accounts')"
              />
            </div>
          </div>

          <q-separator class="q-mb-sm" />

          <q-list v-if="accounts.length" separator>
            <q-item
              v-for="acc in accounts"
              :key="acc.id"
            >
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ acc.name }}
                </q-item-label>
                <q-item-label caption class="account-type-label text-muted">
                  {{ typeLabel(acc.type) }}
                  <span v-if="acc.owner_name"> • {{ acc.owner_name }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <div
                  class="text-weight-bold"
                  :class="acc.balance >= 0 ? 'text-positive' : 'text-negative'"
                >
                  {{ formatCurrency(acc.balance) }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-caption text-muted text-center q-my-md">
            Belum ada akun. Tambahkan akun di menu Akun.
          </div>

          <div class="text-right text-caption q-mt-sm">
            Total kas/bank: <b>{{ formatCurrency(cashBankBalance) }}</b>
          </div>
          <div class="text-right text-caption text-grey-7">
            Hutang CC/Paylater: <b class="text-negative">{{ formatCurrency(ccPaylaterDebt) }}</b>
          </div>
          <div class="text-right text-caption text-grey-7">
            Total semua akun (termasuk kartu kredit/paylater): <b>{{ formatCurrency(totalBalanceAll) }}</b>
          </div>

        </q-card-section>
      </q-card>

      <!-- RINGKASAN BULAN INI -->
      <q-card class="rounded-card q-mb-md">
        <q-card-section>
          <div class="row items-center q-mb-xs">
            <div class="col">
              <div class="text-subtitle1">
                Ringkasan Bulan Ini
              </div>
              <div class="text-caption text-muted">
                Pemasukan & pengeluaran keluarga (tidak termasuk transfer)
              </div>
            </div>
          </div>

          <q-separator class="q-mb-sm" />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-caption text-muted">
                Pemasukan
              </div>
              <div class="text-subtitle1 text-positive">
                {{ formatCurrency(summary.income) }}
              </div>
            </div>
            <div class="col-6">
              <div class="text-caption text-muted">
                Pengeluaran
              </div>
              <div class="text-subtitle1 text-negative">
                {{ formatCurrency(summary.expense) }}
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12">
              <div class="text-caption text-muted">
                Net
              </div>
              <div
                class="text-subtitle1"
                :class="summary.net >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ formatCurrency(summary.net) }}
              </div>
            </div>
          </div>

          <div class="q-mt-md">
            <q-btn
              flat
              dense
              color="primary"
              label="Lihat detail di Laporan"
              icon-right="chevron_right"
              @click="go('reports')"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- GRAFIK PIE & CASHFLOW -->
      <q-card class="rounded-card q-mt-md">
        <q-card-section>
          <div class="text-subtitle1">
            Grafik Pengeluaran & Cash Flow
          </div>
          <div class="text-caption text-muted">
            Distribusi pengeluaran per kategori besar dan arus kas harian bulan ini
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- PIE PENGELUARAN -->
            <div class="col-12 col-md-5 q-mb-md">
              <div class="text-caption text-muted q-mb-xs">
                Pie Pengeluaran per Kategori Besar
              </div>
              <div style="height: 220px;">
                <canvas ref="expensePieCanvas"></canvas>
              </div>
              <div
                v-if="!chartSummary || !chartSummary.expense_by_parent || !chartSummary.expense_by_parent.length"
                class="text-caption text-muted q-mt-xs"
              >
                Belum ada data pengeluaran bulan ini.
              </div>
            </div>

            <!-- CASHFLOW HARIAN -->
            <div class="col-12 col-md-7">
              <div class="text-caption text-muted q-mb-xs">
                Cash Flow Harian (Pemasukan vs Pengeluaran)
              </div>
              <div style="height: 220px;">
                <canvas ref="cashflowCanvas"></canvas>
              </div>
              <div
                v-if="!cashflowData.length"
                class="text-caption text-muted q-mt-xs"
              >
                Belum ada data cash flow bulan ini.
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import Chart from 'chart.js/auto'

export default {
  name: 'DashboardPage',
  data () {
    const now = new Date()
    return {
      loading: false,
      period: {
        year: now.getFullYear(),
        month: now.getMonth() + 1
      },
      summary: {
        income: 0,
        expense: 0,
        net: 0
      },
      accounts: [],
      totalBalanceLiquid: 0,
      totalBalanceAll: 0,
      cashBankBalanceValue: null,
      ccPaylaterDebtValue: null,
      // tiap menu punya warna soft sendiri
      mainMenu: [
        {
          route: 'transactions',
          label: 'Transaksi',
          icon: 'receipt_long',
          bgColor: '#e3f2fd',
          iconColor: '#1565c0'
        },
        {
          route: 'bills',
          label: 'Tagihan',
          icon: 'request_quote',
          bgColor: '#fff3e0',
          iconColor: '#ef6c00'
        },
        {
          route: 'accounts',
          label: 'Akun',
          icon: 'account_balance_wallet',
          bgColor: '#e8f5e9',
          iconColor: '#2e7d32'
        },
        {
          route: 'categories',
          label: 'Kategori',
          icon: 'category',
          bgColor: '#fce4ec',
          iconColor: '#ad1457'
        },
        {
          route: 'reports',
          label: 'Laporan',
          icon: 'insights',
          bgColor: '#f3e5f5',
          iconColor: '#6a1b9a'
        },
        {
          route: 'users',
          label: 'Pengguna',
          icon: 'group',
          bgColor: '#e0f7fa',
          iconColor: '#00838f'
        }
      ],
      chartSummary: null,
      cashflowData: [],
      expenseChart: null,
      cashflowChart: null
    }
  },
  created () {
    this.loadSummary()
    this.loadCharts()
  },
  computed: {
    // sesuai revisi blueprint: saldo kas/bank (tanpa ewallet)
    cashBankBalance () {
      if (this.cashBankBalanceValue !== null && this.cashBankBalanceValue !== undefined) {
        return Number(this.cashBankBalanceValue || 0)
      }
      const allowed = ['bank', 'cash']
      return (this.accounts || []).reduce((sum, a) => {
        if (!allowed.includes(a.type)) return sum
        return sum + Number(a.balance || 0)
      }, 0)
    },

    // hutang kartu kredit/paylater (nilai positif)
    ccPaylaterDebt () {
      if (this.ccPaylaterDebtValue !== null && this.ccPaylaterDebtValue !== undefined) {
        return Number(this.ccPaylaterDebtValue || 0)
      }
      const debtTypes = ['credit_card', 'paylater']
      const bal = (this.accounts || []).reduce((sum, a) => {
        if (!debtTypes.includes(a.type)) return sum
        return sum + Number(a.balance || 0)
      }, 0)
      return bal < 0 ? Math.abs(bal) : 0
    }
  },

  beforeUnmount () {
    if (this.expenseChart) {
      this.expenseChart.destroy()
    }
    if (this.cashflowChart) {
      this.cashflowChart.destroy()
    }
  },
  methods: {
    async loadSummary () {
      this.loading = true
      try {
        const params = {
          year: this.period.year,
          month: this.period.month
        }
        const { data } = await api.get('/dashboard/summary', { params })

        this.accounts = data.accounts || []
        this.totalBalanceLiquid = Number(data.total_balance || 0)
        this.totalBalanceAll = Number(data.total_balance_all || 0)
        this.cashBankBalanceValue = (data.cash_bank_balance !== undefined) ? Number(data.cash_bank_balance || 0) : null
        this.ccPaylaterDebtValue = (data.cc_paylater_debt !== undefined)
          ? Number(data.cc_paylater_debt || 0)
          : Number(data?.liabilities?.outstanding || 0)
        this.period.year = data.period?.year || this.period.year
        this.period.month = data.period?.month || this.period.month
        this.summary = data.summary || this.summary
      } catch (err) {
        console.error(err)
        if (err?.response?.status === 401) {
          localStorage.removeItem('token')
          delete api.defaults.headers.common.Authorization
          Notify.create({
            type: 'negative',
            message: 'Sesi habis, silakan login lagi'
          })
          this.$router.push({ name: 'login' })
        } else {
          Notify.create({
            type: 'negative',
            message: 'Gagal memuat ringkasan dashboard'
          })
        }
      } finally {
        this.loading = false
      }
    },

    async loadCharts () {
      try {
        const params = {
          year: this.period.year,
          month: this.period.month
        }

        const [summaryRes, cashflowRes] = await Promise.all([
          api.get('/reports/monthly-summary', { params }),
          api.get('/reports/cashflow', { params })
        ])

        this.chartSummary = summaryRes.data
        this.cashflowData = cashflowRes.data?.days || []

        this.$nextTick(() => {
          this.buildExpensePie()
          this.buildCashflowChart()
        })
      } catch (err) {
        console.error(err)
      }
    },

    buildExpensePie () {
      if (!this.$refs.expensePieCanvas) return
      if (this.expenseChart) {
        this.expenseChart.destroy()
        this.expenseChart = null
      }

      const items = this.chartSummary?.expense_by_parent || []
      if (!items.length) return

      const ctx = this.$refs.expensePieCanvas.getContext('2d')

      this.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: items.map(i => i.name),
          datasets: [
            {
              data: items.map(i => i.amount),
              backgroundColor: [
                '#1E88E5',
                '#43A047',
                '#FB8C00',
                '#E53935',
                '#8E24AA',
                '#00ACC1',
                '#FDD835',
                '#757575'
              ]
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true
              }
            }
          }
        }
      })
    },

    buildCashflowChart () {
      if (!this.$refs.cashflowCanvas) return
      if (this.cashflowChart) {
        this.cashflowChart.destroy()
        this.cashflowChart = null
      }

      const items = this.cashflowData || []
      if (!items.length) return

      const labels = items.map(d => d.date.slice(8, 10))
      const incomeData = items.map(d => d.income)
      const expenseData = items.map(d => d.expense)

      const ctx = this.$refs.cashflowCanvas.getContext('2d')

      this.cashflowChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Pemasukan',
              data: incomeData,
              borderColor: '#43A047',
              backgroundColor: 'rgba(67,160,71,0.15)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Pengeluaran',
              data: expenseData,
              borderColor: '#E53935',
              backgroundColor: 'rgba(229,57,53,0.15)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Tanggal'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Nominal (Rp)'
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    },

    async logout () {
      try {
        await api.post('/logout')
      } catch (e) {
        console.error('Logout error (ignored):', e)
      }

      localStorage.removeItem('token')
      delete api.defaults.headers.common.Authorization

      Notify.create({
        type: 'positive',
        message: 'Berhasil logout'
      })

      this.$router.push({ name: 'login' })
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
    },

    go (name) {
      this.$router.push({ name })
    }
  }
}
</script>

<style scoped>
.rounded-card {
  border-radius: 18px;
}

/* HEADER BIRU */
.dashboard-header-bg {
  background: linear-gradient(135deg, #0288d1, #00b0ff);
  border-radius: 0 0 24px 24px;
}

/* CONTAINER MERAH: HEADER + RINGKASAN + CTA → STICKY */
.dashboard-sticky-container {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #e9eff5;
}

/* KARTU RINGKASAN PUTIH */
.summary-card {
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  margin-top: -24px;
}

/* TOMBOL CTA BULAT PANJANG */
.cta-btn {
  border-radius: 999px;
}

/* kecilkan tulisan label tombol CTA tertentu (tanpa mengubah ukuran tombol) */
.cta-btn--small-label :deep(.q-btn__content .block) {
  font-size: 12px;
  line-height: 1.1;
}

@media (max-width: 360px) {
  .cta-btn--small-label :deep(.q-btn__content .block) {
    font-size: 11px;
  }
}

/* TOMBOL MENU BULAT – warna diatur dari :style */
.menu-circle-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
}

.account-type-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>

<template>
  <q-page class="flex flex-center bg-grey-2">
    <div class="login-wrapper">
      <!-- Hero / ilustrasi -->
      <div class="login-hero">
        <div class="hero-graphic">
          <q-icon name="account_balance_wallet" size="56px" class="text-white" />
        </div>
        <div class="hero-text">
          <div class="text-subtitle2 text-white">
            Selamat datang
          </div>
          <div class="text-h6 text-weight-bold text-white q-mt-xs">
            Keuangan Keluarga
          </div>
          <div class="text-caption text-white q-mt-xs">
            Pantau uang keluarga dalam satu aplikasi
          </div>
        </div>
      </div>

      <!-- Card form login -->
      <q-card class="login-card">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            Masuk ke akun
          </div>
          <div class="text-caption text-grey-7 q-mb-md">
            Gunakan email & password yang sudah dibuat di sistem
          </div>

          <q-form @submit.prevent="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.email"
              type="email"
              label="Email"
              outlined
              dense
              :disable="loading"
              prefix-icon="email"
            >
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              type="password"
              label="Password"
              outlined
              dense
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
            </q-input>

            <q-btn
              label="Login"
              type="submit"
              color="primary"
              :loading="loading"
              unelevated
              class="full-width q-mt-sm"
              size="md"
              rounded
            />
          </q-form>
        </q-card-section>
      </q-card>

      <div class="text-caption text-grey-7 q-mt-md text-center">
        Aplikasi keuangan untuk keluarga kecilmu 💚
      </div>
    </div>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  name: 'LoginPage',
  data () {
    return {
      loading: false,
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async onSubmit () {
      this.loading = true
      try {
        const { data } = await api.post('/login', {
          email: this.form.email,
          password: this.form.password
        })

        localStorage.setItem('token', data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`

        Notify.create({
          type: 'positive',
          message: 'Login berhasil'
        })

        this.$router.push({ name: 'dashboard' })
      } catch (err) {
        console.error(err)
        const msg = err.response?.data?.message || 'Gagal login'
        Notify.create({
          type: 'negative',
          message: msg
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  max-width: 420px;
  padding: 24px 16px 32px;
}

.login-hero {
  background: linear-gradient(135deg, #00b4d8, #0077b6);
  border-radius: 24px;
  padding: 20px 20px 14px;
  margin-bottom: 18px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.login-hero::after {
  content: '';
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  top: -120px;
  right: -80px;
}

.hero-graphic {
  width: 76px;
  height: 76px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  z-index: 1;
}

.hero-text {
  z-index: 1;
}

.login-card {
  border-radius: 22px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.18);
}
</style>

<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Pengguna</div>
        <div class="text-caption text-grey-7">
          Kelola anggota keluarga yang bisa login ke aplikasi
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          unelevated
          dense
          icon="add"
          label="Tambah Pengguna"
          class="q-mr-sm"
          @click="openCreate"
        />
        <q-btn
          flat
          dense
          round
          icon="refresh"
          :loading="loading"
          @click="loadMembers"
        />
      </div>
    </div>

    <!-- List pengguna -->
    <q-card class="rounded-card">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <div class="col">
            <div class="text-subtitle1">Daftar Pengguna Keluarga</div>
            <div class="text-caption text-grey-7">
              Hanya owner yang bisa menambah / mengubah / menghapus pengguna
            </div>
          </div>
        </div>

        <q-separator class="q-my-xs" />

        <q-list v-if="members.length" separator>
          <q-item
            v-for="m in members"
            :key="m.id"
          >
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ m.name }}
              </q-item-label>
              <q-item-label caption>
                {{ m.email }}
              </q-item-label>
              <q-item-label caption>
                <q-chip
                  dense
                  :color="m.role === 'owner' ? 'primary' : 'grey-8'"
                  text-color="white"
                  class="q-mt-xs"
                >
                  {{ roleLabel(m.role) }}
                </q-chip>
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <div class="text-right">
                <q-btn
                  dense
                  flat
                  round
                  icon="edit"
                  @click="openEdit(m)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click="confirmDelete(m)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-grey text-center q-my-md">
          Belum ada data pengguna (atau Anda tidak punya akses).
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog tambah / edit -->
    <q-dialog v-model="formDialog">
      <q-card class="rounded-card" style="min-width: 320px; max-width: 480px;">
        <q-card-section>
          <div class="text-subtitle1">
            {{ formMode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna' }}
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Email akan dipakai untuk login. Role owner bisa mengelola pengguna dan data keluarga.
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nama"
            outlined
            dense
          />
          <q-input
            v-model="form.email"
            label="Email"
            outlined
            dense
            type="email"
          />
          <q-select
            v-model="form.role"
            :options="roleOptions"
            label="Role"
            outlined
            dense
            emit-value
            map-options
          />

          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            :label="formMode === 'create' ? 'Password' : 'Password baru (opsional)'"
            outlined
            dense
            :hint="formMode === 'create' ? 'Minimal 6 karakter' : 'Kosongkan jika tidak ingin mengganti password'"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
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

    <!-- Dialog hapus -->
    <q-dialog v-model="deleteDialog">
      <q-card class="rounded-card" style="min-width: 320px;">
        <q-card-section>
          <div class="text-subtitle1">Hapus Pengguna</div>
          <div class="text-body2 q-mt-sm">
            Yakin ingin menghapus pengguna
            <b>{{ selectedMember?.name }}</b> ({{ selectedMember?.email }})?
            <br>
            Tidak bisa menghapus diri sendiri atau owner terakhir.
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
            @click="deleteMember"
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
  name: 'UsersPage',
  data () {
    return {
      loading: false,
      members: [],

      formDialog: false,
      formMode: 'create', // create | edit
      form: {
        id: null,
        name: '',
        email: '',
        role: 'member',
        password: ''
      },
      showPassword: false,
      saving: false,

      deleteDialog: false,
      deleting: false,
      selectedMember: null,

      roleOptions: [
        { label: 'Owner', value: 'owner' },
        { label: 'Member', value: 'member' }
      ]
    }
  },
  created () {
    this.loadMembers()
  },
  methods: {
    async loadMembers () {
      this.loading = true
      try {
        const { data } = await api.get('/family-users')
        this.members = data?.data || data || []
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal memuat pengguna')
      } finally {
        this.loading = false
      }
    },

    openCreate () {
      this.formMode = 'create'
      this.formDialog = true
      this.form = {
        id: null,
        name: '',
        email: '',
        role: 'member',
        password: ''
      }
      this.showPassword = false
    },

    openEdit (member) {
      this.formMode = 'edit'
      this.formDialog = true
      this.form = {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role || 'member',
        password: ''
      }
      this.showPassword = false
    },

    async submitForm () {
      if (!this.form.name || !this.form.email) {
        Notify.create({ type: 'warning', message: 'Nama dan email wajib diisi' })
        return
      }

      if (this.formMode === 'create' && !this.form.password) {
        Notify.create({ type: 'warning', message: 'Password wajib diisi untuk pengguna baru' })
        return
      }

      // kalau user isi password saat edit/create, minimal 6 (sesuai hint UI)
      if (this.form.password && this.form.password.length < 6) {
        Notify.create({ type: 'warning', message: 'Password minimal 6 karakter' })
        return
      }

      this.saving = true
      try {
        const payload = {
          name: this.form.name,
          email: this.form.email,
          role: this.form.role
        }

        // FIX: jika ada password, kirim juga password_confirmation
        if (this.formMode === 'create' || this.form.password) {
          payload.password = this.form.password
          payload.password_confirmation = this.form.password
        }

        if (this.formMode === 'create') {
          await api.post('/family-users', payload)
          Notify.create({ type: 'positive', message: 'Pengguna berhasil ditambahkan' })
        } else {
          await api.put(`/family-users/${this.form.id}`, payload)
          Notify.create({ type: 'positive', message: 'Pengguna berhasil diupdate' })
        }

        this.formDialog = false
        await this.loadMembers()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menyimpan pengguna')
      } finally {
        this.saving = false
      }
    },

    confirmDelete (member) {
      this.selectedMember = member
      this.deleteDialog = true
    },

    async deleteMember () {
      if (!this.selectedMember) return

      this.deleting = true
      try {
        await api.delete(`/family-users/${this.selectedMember.id}`)

        Notify.create({ type: 'positive', message: 'Pengguna berhasil dihapus' })

        this.deleteDialog = false
        this.selectedMember = null
        await this.loadMembers()
      } catch (err) {
        console.error(err)
        this.handleError(err, 'Gagal menghapus pengguna')
      } finally {
        this.deleting = false
      }
    },

    handleError (err, fallbackMessage) {
      const status = err?.response?.status

      if (status === 401) {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
        Notify.create({ type: 'negative', message: 'Sesi habis, silakan login lagi' })
        this.$router.push({ name: 'login' })
        return
      }

      if (status === 403) {
        const msg = err?.response?.data?.message || 'Hanya owner yang boleh mengelola pengguna.'
        Notify.create({ type: 'warning', message: msg })
        this.$router.push({ name: 'dashboard' })
        return
      }

      const data = err?.response?.data
      let msg = data?.message

      // FIX: tampilkan validasi Laravel (errors: {field: [...]})
      if (!msg && data?.errors) {
        const messages = []
        Object.values(data.errors).forEach(v => {
          if (Array.isArray(v)) messages.push(...v)
        })
        msg = messages.join(' • ')
      }

      Notify.create({
        type: 'negative',
        message: msg || fallbackMessage
      })
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

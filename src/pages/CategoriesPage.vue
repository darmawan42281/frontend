<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Kategori</div>
        <div class="text-caption text-grey-7">
          Kelola kategori pemasukan, pengeluaran & transfer
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          unelevated
          icon="add"
          label="Tambah"
          @click="openCreate"
        />
      </div>
    </div>

    <!-- Filter -->
    <q-card class="rounded-card q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="col-auto text-caption text-grey-7">
            Filter jenis kategori
          </div>
          <div class="col-auto">
            <q-btn-toggle
              v-model="filterType"
              dense
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="filterOptions"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- List kategori -->
    <q-card class="rounded-card">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <div class="col">
            <div class="text-subtitle1">
              Daftar Kategori
            </div>
            <div class="text-caption text-grey-7">
              Klik ikon pensil untuk edit, atau tong sampah untuk hapus
            </div>
          </div>
        </div>

        <q-separator class="q-mb-sm" />

        <q-inner-loading :showing="loading">
          <q-spinner-dots size="40px" color="primary" />
        </q-inner-loading>

        <q-list v-if="!loading && filteredCategories.length" separator>
          <q-item
            v-for="cat in filteredCategories"
            :key="cat.id"
            class="q-py-xs"
          >
            <q-item-section>
              <q-item-label class="text-body2 text-weight-medium">
                {{ cat.name }}
              </q-item-label>
              <q-item-label caption>
                {{ typeLabel(cat.type) }}
                <span v-if="cat.parent_id">
                  • Sub dari {{ parentName(cat.parent_id) }}
                </span>
                <span v-if="cat.is_system" class="text-blue-grey-6">
                  • Kategori sistem
                </span>
                <span v-else-if="!cat.is_active" class="text-negative">
                  • Non-aktif
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="!cat.is_system">
              <q-btn
                flat
                round
                dense
                icon="edit"
                @click="openEdit(cat)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDelete(cat)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div
          v-else-if="!loading"
          class="text-caption text-grey-6 text-center q-my-lg"
        >
          Belum ada kategori.
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog form kategori -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card style="min-width: 320px; max-width: 420px;">
        <q-card-section>
          <div class="text-subtitle1">
            {{ isEdit ? 'Edit Kategori' : 'Tambah Kategori' }}
          </div>
          <div class="text-caption text-grey-7">
            Isi nama & jenis kategori
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nama kategori"
            outlined
            dense
            :disable="saving"
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            label="Jenis"
            outlined
            dense
            :disable="saving"
          />

          <q-select
            v-model="form.parent_id"
            :options="parentOptions"
            label="Kategori induk (opsional)"
            outlined
            dense
            clearable
            :hint="parentOptions.length === 0 ? 'Belum ada kategori induk untuk jenis ini' : ''"
            :disable="saving || parentOptions.length === 0"
          />

          <q-toggle
            v-model="form.is_active"
            label="Aktif"
            :disable="saving"
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
            unelevated
            color="primary"
            :label="isEdit ? 'Simpan perubahan' : 'Simpan'"
            :loading="saving"
            @click="submitForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog konfirmasi hapus -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-subtitle1">Hapus kategori?</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Kategori <b>{{ deleteTarget?.name }}</b> akan dihapus permanen.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn
            flat
            color="negative"
            label="Hapus"
            :loading="deleting"
            @click="deleteCategory"
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
  name: 'CategoriesPage',
  data () {
    return {
      loading: false,
      saving: false,
      deleting: false,
      categories: [],
      filterType: 'all',

      showFormDialog: false,
      isEdit: false,
      form: {
        id: null,
        name: '',
        type: 'expense',
        parent_id: null,
        is_active: true
      },

      showDeleteDialog: false,
      deleteTarget: null,

      filterOptions: [
        { label: 'Semua', value: 'all' },
        { label: 'Pemasukan', value: 'income' },
        { label: 'Pengeluaran', value: 'expense' },
        { label: 'Transfer', value: 'transfer' }
      ],
      typeOptions: [
        { label: 'Pemasukan', value: 'income' },
        { label: 'Pengeluaran', value: 'expense' },
        { label: 'Transfer', value: 'transfer' }
      ]
    }
  },
  computed: {
    filteredCategories () {
      if (this.filterType === 'all') {
        return this.categories
      }
      return this.categories.filter(c => c.type === this.filterType)
    },

    parentOptions () {
      // kategori induk = kategori dengan type sama dan bukan diri sendiri
      return this.categories
        .filter(c => c.type === this.form.type && c.id !== this.form.id)
        .map(c => ({
          label: c.name,
          value: c.id
        }))
    }
  },
  created () {
    this.loadCategories()
  },
  methods: {
    async loadCategories () {
      this.loading = true
      try {
        const { data } = await api.get('/categories')
        this.categories = data.data || []
      } catch (e) {
        console.error(e)
        Notify.create({
          type: 'negative',
          message: 'Gagal memuat kategori'
        })
      } finally {
        this.loading = false
      }
    },

    openCreate () {
      this.isEdit = false
      this.form = {
        id: null,
        name: '',
        type: 'expense',
        parent_id: null,
        is_active: true
      }
      this.showFormDialog = true
    },

    openEdit (cat) {
      this.isEdit = true
      this.form = {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        parent_id: cat.parent_id,
        is_active: !!cat.is_active
      }
      this.showFormDialog = true
    },

    async submitForm () {
      if (!this.form.name || !this.form.type) {
        Notify.create({
          type: 'warning',
          message: 'Nama & jenis kategori wajib diisi'
        })
        return
      }

      this.saving = true
      try {
        const payload = {
          name: this.form.name,
          type: this.form.type,
          parent_id: this.form.parent_id,
          is_active: this.form.is_active
        }

        if (this.isEdit && this.form.id) {
          await api.put(`/categories/${this.form.id}`, payload)
          Notify.create({
            type: 'positive',
            message: 'Kategori berhasil diperbarui'
          })
        } else {
          await api.post('/categories', payload)
          Notify.create({
            type: 'positive',
            message: 'Kategori berhasil ditambahkan'
          })
        }

        this.showFormDialog = false
        await this.loadCategories()
      } catch (e) {
        console.error(e)
        Notify.create({
          type: 'negative',
          message: 'Gagal menyimpan kategori'
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete (cat) {
      this.deleteTarget = cat
      this.showDeleteDialog = true
    },

    async deleteCategory () {
      if (!this.deleteTarget) return

      this.deleting = true
      try {
        await api.delete(`/categories/${this.deleteTarget.id}`)
        Notify.create({
          type: 'positive',
          message: 'Kategori berhasil dihapus'
        })
        this.showDeleteDialog = false
        this.deleteTarget = null
        await this.loadCategories()
      } catch (e) {
        console.error(e)
        Notify.create({
          type: 'negative',
          message: e.response?.data?.message || 'Gagal menghapus kategori'
        })
      } finally {
        this.deleting = false
      }
    },

    typeLabel (type) {
      if (type === 'income') return 'Pemasukan'
      if (type === 'expense') return 'Pengeluaran'
      if (type === 'transfer') return 'Transfer'
      return type
    },

    parentName (parentId) {
      const parent = this.categories.find(c => c.id === parentId)
      return parent ? parent.name : '-'
    }
  }
}
</script>

<style scoped>
.rounded-card {
  border-radius: 18px;
}
</style>

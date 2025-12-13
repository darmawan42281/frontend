import { boot } from 'quasar/wrappers'
import axios from 'axios'

// SESUAIKAN: alamat backend Laravel-mu
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api'
})

// kalau ada token di localStorage, set ke header Authorization
const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export default boot(({ app }) => {
  // supaya bisa diakses di semua component
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }

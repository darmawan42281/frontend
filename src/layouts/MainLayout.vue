<template>
  <q-layout view="lHh Lpr lFf">
    <!-- TANPA NAVBAR / HEADER -->
    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>

    <!-- BOTTOM NAV: hanya tab Beranda -->
    <q-footer
      v-if="showBottomNav"
      bordered
      class="bg-white"
    >
      <q-tabs
        v-model="tab"
        dense
        align="justify"
        indicator-color="primary"
        active-color="primary"
        class="text-blue-grey-8 mobile-bottom-tabs"
      >
        <q-tab
          name="dashboard"
          icon="home"
          label="Beranda"
          @click="go('dashboard')"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
      tab: 'dashboard'
    }
  },
  computed: {
    // login page: tanpa bottom nav
    showBottomNav () {
      return this.$route.name !== 'login'
    }
  },
  watch: {
    // apapun halamannya, tab bottom selalu "dashboard"
    '$route.name': {
      immediate: true,
      handler () {
        this.tab = 'dashboard'
      }
    }
  },
  methods: {
    go (name) {
      if (this.$route.name !== name) {
        this.$router.push({ name })
      }
    }
  }
}
</script>

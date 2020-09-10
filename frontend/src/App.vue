<template>
  <v-app class="white">
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  name: "App",
  created() {
    const token = localStorage.getItem("id_token");
    if (typeof token === "string") {
      this.$http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
};
</script>

<style lang="scss">
* {
  font-family: "Roboto", sans-serif;
}
</style>

<template>
  <v-snackbar buttom v-model="show" :timeout="timeout" :color="isError ? 'error' : ''">
    {{ text }}
    <v-btn flat :color="isError ? 'white' : 'cyan lighten-1'" @click.native="close" icon>
      <v-icon>clear</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
const TIMEOUT = 5000;

export default {
  name: 'Snackbar',
  data: () => ({
    show: false,
    timeout: TIMEOUT,
    text: '',
    isError: false,
  }),
  methods: {
    open(message, error, timeout) {
      const displaying = this.show;
      this.close();
      this.timeout = timeout || TIMEOUT;
      this.isError = error;
      this.text = message;
      if (displaying) {
        setTimeout(() => {
          this.show = true;
        }, 800);
      } else {
        this.show = true;
      }
    },
    close() {
      this.show = false;
    },
  },
};
</script>

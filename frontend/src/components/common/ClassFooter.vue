<template>
  <v-footer height="80" color="black" absolute inset flexed>
    <v-layout justify-center>
      <v-flex py-3 xs2>
        <v-layout justify-space-between>
          <!--footerbtn-->
          <toggle-btn
            :btn-title="submit.btnSkip.btnTitle"
            :btn-color="submit.btnSkip.btnColor"
            :btn-outline="submit.btnSkip.btnOutline"
            :btn-size-small="false"
            @getBtn="$router.go(-1)"
          />
          <toggle-btn
            :btn-title="submit.btnSubmit.btnTitle"
            :btn-color="submit.btnSubmit.btnColor"
            :btn-text-white="submit.btnSubmit.btnTextWhite"
            :btn-size-small="false"
            @getBtn="$router.go(-1)"
          />
        </v-layout>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
import ToggleBtn from '@/components/common/ToggleBtn';

export default {
  name: 'calssfooter',
  components: {
    ToggleBtn,
  },
  data() {
    return {
      submit: {
        btnSkip: {
          btnTitle: 'Skip',
          btnColor: 'cyan lighten-2',
          btnOutline: true,
        },
        btnSubmit: {
          btnTitle: 'Submit',
          btnColor: 'cyan lighten-2',
          btnTextWhite: true,
        },
      },
    };
  },
};
</script>

<style></style>

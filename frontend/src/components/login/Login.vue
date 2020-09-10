<template>
  <div class="product-landing-container signin-page">
    <div class="logo">
      <img class="icon-logo" src="../../assets/logo.svg" alt="TG3D Studio" />
    </div>
    <div class="content pb-5 mb-5" @keyup.enter="submitFrom">
      <div class="form-head">
        <div class="product-name">
          <img class="icon-scanatic" src="../../assets/scanatic.svg" alt="Scanatic" />for Fashion
        </div>
        <div class="tagline">Digitally Empowering Fashion</div>
      </div>
      <form class="form">
        <div class="field">
          <v-text-field
            type="text"
            v-model="user.account"
            autofocus
            :error="loginError"
            :placeholder="$t('account')"
            id="account"
          />
        </div>
        <div class="field">
          <v-text-field
            color="white"
            autocomplete="off"
            :error="loginError"
            :placeholder="$t('password')"
            :type="passwordRevealed ? 'text' : 'password'"
            v-model="user.password"
            id="password"
          />
          <span
            class="icon-reveal"
            :class="{ active: passwordRevealed }"
            @click="revealPassword"
          ></span>
        </div>
        <div class="actions signin-btn-container">
          <v-btn class="white--text" light color="#00BCD4" @click="submitFrom">{{
            $t('login')
          }}</v-btn>
        </div>
      </form>
    </div>

    <div class="footer">{{ $t('suggest_browser') }}</div>
  </div>
</template>

<script>
export default {
  created() {
    this.$http.defaults.headers.common['Authorization'] = null;
    localStorage.removeItem('id_token');
  },
  data() {
    return {
      user: {
        account: '',
        password: '',
      },
      passwordRevealed: false,
      loginError: false,
    };
  },
  methods: {
    revealPassword() {
      this.passwordRevealed = !this.passwordRevealed;
    },
    async submitFrom() {
      this.loginError = false;
      try {
        const { data } = await this.$http.post('/api/v1/login', this.user);
        localStorage.setItem('id_token', data.token);
        this.$http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        this.$router.push({ path: '/' });
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status >= 400 && status < 500) {
          this.loginError = true;
        } else {
          this.$snackbar.alert(e.message);
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.product-landing-container {
  height: 100vh;
  min-height: 750px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  background: url('../../assets/landing-bg.jpg') black no-repeat;
  position: relative;
  background-size: cover;
  font-family: 'Roboto', serif;
  .icon-logo {
    width: 74.8px;
    height: 110px;
    outline: none;
    cursor: initial;
  }

  .content {
    color: white;
    max-width: 558px;
    width: 90%;
    .primary-color-link {
      text-decoration: underline;
    }
  }

  .form-head {
    padding: 0 20px;
  }

  .product-name {
    font-size: 36px;
    font-weight: 300;
    display: flex;
  }

  .icon-scanatic {
    max-width: 201px;
    max-height: 39px;
    width: 100%;
    margin-right: 10px;
  }

  .tagline {
    text-align: right;
    font-size: 18px;
    font-weight: 100;
    font-style: italic;
  }

  .alert-warning {
    margin: 0 20px;
  }

  .form {
    margin: 20px auto;
    padding: 20px 0;
    border-radius: 14px;
    background-color: rgba(255, 255, 255, 0.11);
    .tg3d-input > input {
      border-bottom-color: white;
      color: white;
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
    .md-button {
      text-transform: none;
    }
  }

  .field {
    margin: 20px;
    position: relative;
    /deep/ .v-input {
      &.error--text {
        .v-input__slot {
          &::before {
            border-color: #ff5252;
          }
          &:hover {
            &::before {
              border-color: #ff5252;
            }
          }
        }
      }
      .v-input__slot {
        &::before {
          border-color: white;
        }
        &:hover {
          &::before {
            border-color: white;
          }
        }
      }
      input {
        color: white;
        /*border-bottom-color: white;*/
        &::placeholder {
          color: white;
          opacity: 0.5;
        }
      }
    }
  }

  .icon-reveal {
    display: inline-block;
    position: absolute;
    width: 18px;
    height: 16px;
    top: 18px;
    right: 5px;
    cursor: pointer;
    outline: none;
    background: url('../../assets/ic-reveal.svg') no-repeat center;
    &:hover,
    &:active {
      background-image: url('../../assets/ic-reveal-h.svg');
    }
    &.active {
      background-image: url('../../assets/ic-reveal-off.svg');
      &:hover,
      &:active {
        background-image: url('../../assets/ic-reveal-off-h.svg');
      }
    }
  }

  .activation {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    color: #1ac5d4;
    .or {
      text-transform: uppercase;
      margin-bottom: 15px;
    }
  }

  .footer {
    font-size: 12px;
    font-weight: 300;
    color: #fff;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    width: 80%;
  }
}

@media screen and (max-width: 400px) {
  .product-landing-container {
    .product-name {
      font-size: 28px;
    }

    .icon-scanatic {
      width: 161px;
      height: 31px;
    }
    md-checkbox {
      .md-label {
        line-height: 18px;
      }
    }
  }
}

@media screen and (min-width: 800px) {
  .product-landing-container {
    .form {
      padding: 20px;
    }
    .field,
    .alert-warning {
      margin: 20px 50px;
    }
    .activation {
      .or {
        margin-bottom: 30px;
      }
    }
    .alert-warning {
      margin-top: 10px;
    }
  }
}

.form-container {
  width: 100%;
}

.signin-msg-title {
  max-width: 640px;
  margin: 0 auto 47px auto;
  text-align: center;
  font-size: 1.375em;
  font-weight: 300;
  color: 000;
}

.signin-msg {
  max-width: 640px;
  margin: 20px auto 47px auto;
  text-align: center;
  font-size: 1em;
  font-weight: 300;
  color: #4cb6c0;
}

.signin-form-container {
  max-width: 494px;
  margin: 0 auto;
}

.signin-btn-container {
  margin-top: 60px;
  width: 100%;
  text-align: center;
  .v-btn {
    font-size: 1em;
    min-width: 142px;
    min-height: 32px;
    border-radius: 0;
    height: 32px;
    line-height: 32px;
  }
}

.activate-barcode-img {
  margin: 0px auto;
  text-align: center;
}

.have-account-link > a {
  text-decoration: none;
  border-bottom: 2px solid #000;
  color: #000 !important;
}

.activate-subtitle {
  color: #767676;
  margin-bottom: 15px;
  font-size: 1em;
  font-weight: 300;
}

.activate-preset-value {
  color: #000;
  font-size: 1em;
  font-weight: 300;
}

.store-setting-shadow {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 100;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0px 6px;
}

.high-light-border {
  border-radius: 8px;
  border: 8px solid #1ac5d4;
}

.store-setting-hint {
  margin: 0px auto;
  text-align: center;
  color: #1ac5d4;
  font-size: 1.25em;
  font-weight: 300;
}

.privacy-msg-container {
  max-width: 460px;
  margin: 40px auto;
  font-size: 12px;
  color: #b3b3b1;
  line-height: 1.4;
}

.reset-password-hint {
  color: #767676;
  font-size: 1em;
  font-weight: 300;
}

/* override margin settings in sign-in page */
.signin-page {
}
.signin-page .signin-msg-title {
  margin: 0px auto;
}
.signin-page .logo-container {
  margin: 0px;
}
.signin-page .signin-form-container {
}
.signin-page .signin-btn-container {
  margin-top: 0px;
}

/* override margin settings in prepare.html.erb */
.prepare-page .signin-msg-title {
  margin: 0px auto;
}
.prepare-page .logo-container {
  margin: 0px;
}
@media screen and (min-width: 330px) and (max-width: 649px) {
  .prepare-page .msg-1,
  .prepare-page .msg-2 {
    font-size: 12px;
  }
}
@media screen and (max-width: 329px) {
  .prepare-page .msg-1,
  .prepare-page .msg-2 {
    font-size: 12px;
  }
}
</style>

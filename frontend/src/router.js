import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/home/Home';
import Login from '@/components/login/Login';
import CheckBox from '@/components/common/CheckBox';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '*',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/checkbox',
      name: 'checkbox',
      component: CheckBox,
    },
  ],
});

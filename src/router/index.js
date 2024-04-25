import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import NotFound from '../views/NotFound.vue'
import MainBox from '../views/MainBox.vue'
import Home from '../views/home/Home.vue'
import Statictise from '../views/statictise/Statictise.vue'
import Expenditure from '../views/statictise/Expenditure.vue' 
import Asset from '../views/statictise/Asset.vue' 


const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/mainbox',
    name: 'MainBox',
    component: MainBox,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
      {
        path: '/statictise',
        name: 'Statictise',
        component: Statictise
      },
      {
        path: '/expenditure',
        name: 'Expenditure',
        component: Expenditure
      },
      {
        path: '/asset',
        name: 'Asset',
        component: Asset
      } 
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
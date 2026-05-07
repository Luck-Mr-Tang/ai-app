import { createRouter } from 'uni-mini-router'
import { userRouternext } from './Routeinterception'
console.log('路由加载中...', ROUTES)

const router = createRouter({
    routes: [...ROUTES] // 路由表信息
})

userRouternext(router) //使用路由拦截

export default router

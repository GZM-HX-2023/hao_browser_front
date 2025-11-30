import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: MainLayout,
        redirect: '/browser-list',
        children: [
            {
                path: '/browser-list',
                name: 'BrowserList',
                component: () => import('@/views/BrowserList.vue'),
                meta: { title: '环境管理' }
            },
            {
                path: '/browser/create',
                name: 'CreateBrowser',
                component: () => import('@/views/CreateBrowser.vue'),
                meta: { title: '新建浏览器' }
            },
            {
                path: '/proxy',
                name: 'ProxyManagement',
                component: () => import('@/views/ProxyManagement.vue'),
                meta: { title: '代理管理' }
            },
            {
                path: '/rpa',
                name: 'RpaEditor',
                component: () => import('@/views/RpaEditor.vue'),
                meta: { title: 'RPA编辑器' }
            },
            {
                path: '/groups',
                name: 'GroupManagement',
                component: () => import('@/views/GroupManagement.vue'),
                meta: { title: '分组配置' }
            },
            {
                path: '/recycle-bin',
                name: 'RecycleBin',
                component: () => import('@/views/RecycleBin.vue'),
                meta: { title: '回收站' }
            },
            {
                path: '/settings',
                name: 'Settings',
                component: () => import('@/views/Settings.vue'),
                meta: { title: '系统设置' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, _from, next) => {
    document.title = (to.meta.title as string) || '指纹浏览器'
    next()
})

export default router

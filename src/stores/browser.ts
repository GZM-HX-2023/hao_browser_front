import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BrowserProfile } from '@/types'
import { getBrowserList, startBrowser, stopBrowser, deleteBrowser } from '@/api/browser'

export const useBrowserStore = defineStore('browser', () => {
    const browsers = ref<BrowserProfile[]>([])
    const loading = ref(false)

    // 加载浏览器列表
    async function loadBrowsers() {
        loading.value = true
        try {
            const res = await getBrowserList()
            browsers.value = res.data
        } finally {
            loading.value = false
        }
    }

    // 启动浏览器
    async function start(id: number) {
        await startBrowser(id)
        await loadBrowsers()
    }

    // 停止浏览器
    async function stop(id: number) {
        await stopBrowser(id)
        await loadBrowsers()
    }

    // 删除浏览器
    async function remove(id: number) {
        await deleteBrowser(id)
        await loadBrowsers()
    }

    // 根据ID获取浏览器
    function getBrowserById(id: number) {
        return browsers.value.find(b => b.id === id)
    }

    return {
        browsers,
        loading,
        loadBrowsers,
        start,
        stop,
        remove,
        getBrowserById
    }
})

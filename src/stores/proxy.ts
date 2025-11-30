import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProxyConfig } from '@/types'
import { getProxyList, testProxy } from '@/api/proxy'

export const useProxyStore = defineStore('proxy', () => {
    const proxies = ref<ProxyConfig[]>([])
    const loading = ref(false)

    // 加载代理列表
    async function loadProxies() {
        loading.value = true
        try {
            const res = await getProxyList()
            proxies.value = res.data
        } finally {
            loading.value = false
        }
    }

    // 测试代理
    async function test(id: number) {
        const res = await testProxy(id)
        await loadProxies() // 重新加载以更新状态
        return res.data
    }

    // 根据ID获取代理
    function getProxyById(id: number) {
        return proxies.value.find(p => p.id === id)
    }

    return {
        proxies,
        loading,
        loadProxies,
        test,
        getProxyById
    }
})

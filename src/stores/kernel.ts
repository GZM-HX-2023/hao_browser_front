import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BrowserKernel } from '@/types'
import { getEnabledKernelList, getDefaultKernel } from '@/api/kernel'

export const useKernelStore = defineStore('kernel', () => {
    const kernels = ref<BrowserKernel[]>([])
    const defaultKernel = ref<BrowserKernel | null>(null)
    const loading = ref(false)

    // 加载内核列表
    async function loadKernels() {
        loading.value = true
        try {
            const res = await getEnabledKernelList()
            kernels.value = res.data
        } finally {
            loading.value = false
        }
    }

    // 加载默认内核
    async function loadDefaultKernel() {
        try {
            const res = await getDefaultKernel()
            defaultKernel.value = res.data
        } catch (error) {
            console.error('获取默认内核失败:', error)
        }
    }

    // 根据ID获取内核
    function getKernelById(id: number) {
        return kernels.value.find(k => k.id === id)
    }

    return {
        kernels,
        defaultKernel,
        loading,
        loadKernels,
        loadDefaultKernel,
        getKernelById
    }
})

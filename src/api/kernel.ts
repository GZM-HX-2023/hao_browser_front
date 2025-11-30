import request from '@/utils/request'
import type { BrowserKernel, ApiResponse } from '@/types'

// 创建浏览器内核
export function createKernel(data: Partial<BrowserKernel>) {
    return request.post<any, ApiResponse<BrowserKernel>>('/kernel/create', data)
}

// 获取内核列表
export function getKernelList() {
    return request.get<any, ApiResponse<BrowserKernel[]>>('/kernel/list')
}

// 获取启用的内核列表
export function getEnabledKernelList() {
    return request.get<any, ApiResponse<BrowserKernel[]>>('/kernel/list/enabled')
}

// 获取默认内核
export function getDefaultKernel() {
    return request.get<any, ApiResponse<BrowserKernel>>('/kernel/default')
}

// 获取内核详情
export function getKernel(id: number) {
    return request.get<any, ApiResponse<BrowserKernel>>(`/kernel/${id}`)
}

// 更新内核
export function updateKernel(id: number, data: Partial<BrowserKernel>) {
    return request.put<any, ApiResponse<BrowserKernel>>(`/kernel/${id}`, data)
}

// 删除内核
export function deleteKernel(id: number) {
    return request.delete<any, ApiResponse<null>>(`/kernel/${id}`)
}

// 设置默认内核
export function setDefaultKernel(id: number) {
    return request.post<any, ApiResponse<null>>(`/kernel/${id}/set-default`)
}

// 生成User-Agent
export function generateUserAgent(id: number, os: string = 'Windows') {
    return request.get<any, ApiResponse<string>>(`/kernel/${id}/generate-ua`, {
        params: { os }
    })
}

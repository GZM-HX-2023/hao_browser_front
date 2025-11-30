import request from '@/utils/request'
import type { BrowserProfile, ApiResponse } from '@/types'

// 创建浏览器
export function createBrowser(data: Partial<BrowserProfile>) {
    return request.post<any, ApiResponse<BrowserProfile>>('/browser/create', data)
}

// 获取浏览器列表
export function getBrowserList() {
    return request.get<any, ApiResponse<BrowserProfile[]>>('/browser/list')
}

// 获取浏览器详情
export function getBrowser(id: number) {
    return request.get<any, ApiResponse<BrowserProfile>>(`/browser/${id}`)
}

// 更新浏览器
export function updateBrowser(id: number, data: Partial<BrowserProfile>) {
    return request.put<any, ApiResponse<BrowserProfile>>(`/browser/${id}`, data)
}

// 删除浏览器
export function deleteBrowser(id: number) {
    return request.delete<any, ApiResponse<null>>(`/browser/${id}`)
}

// 启动浏览器
export function startBrowser(id: number) {
    return request.post<any, ApiResponse<null>>(`/browser/${id}/start`)
}

// 停止浏览器
export function stopBrowser(id: number) {
    return request.post<any, ApiResponse<null>>(`/browser/${id}/stop`)
}

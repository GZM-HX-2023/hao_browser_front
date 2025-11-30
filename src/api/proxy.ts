import request from '@/utils/request'
import type { ProxyConfig, ApiResponse } from '@/types'

// 添加代理
export function addProxy(data: Partial<ProxyConfig>) {
    return request.post<any, ApiResponse<ProxyConfig>>('/proxy/add', data)
}

// 获取代理列表
export function getProxyList() {
    return request.get<any, ApiResponse<ProxyConfig[]>>('/proxy/list')
}

// 获取代理详情
export function getProxy(id: number) {
    return request.get<any, ApiResponse<ProxyConfig>>(`/proxy/${id}`)
}

// 更新代理
export function updateProxy(id: number, data: Partial<ProxyConfig>) {
    return request.put<any, ApiResponse<ProxyConfig>>(`/proxy/${id}`, data)
}

// 删除代理
export function deleteProxy(id: number) {
    return request.delete<any, ApiResponse<null>>(`/proxy/${id}`)
}

// 测试代理
export function testProxy(id: number) {
    return request.post<any, ApiResponse<boolean>>(`/proxy/${id}/test`)
}

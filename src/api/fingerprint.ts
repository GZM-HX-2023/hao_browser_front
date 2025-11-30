import request from '@/utils/request'
import type { FingerprintData, ApiResponse } from '@/types'

// 生成完整指纹
export function generateFingerprint() {
    return request.post<any, ApiResponse<FingerprintData>>('/fingerprint/generate')
}

// 生成WebGL配置
export function generateWebGL() {
    return request.post<any, ApiResponse<{ vendor: string; renderer: string }>>('/fingerprint/generate/webgl')
}

// 生成User-Agent
export function generateUserAgent() {
    return request.post<any, ApiResponse<string>>('/fingerprint/generate/user-agent')
}

// 生成屏幕分辨率
export function generateResolution() {
    return request.post<any, ApiResponse<{ width: number; height: number }>>('/fingerprint/generate/resolution')
}

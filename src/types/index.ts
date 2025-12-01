// 浏览器配置类型
export interface BrowserProfile {
    id?: number
    name: string
    remark?: string

    // 浏览器内核
    browserKernel?: BrowserKernel
    kernelId?: number

    // 基础设置
    userAgent?: string
    screenWidth?: number
    screenHeight?: number
    timezone?: string
    language?: string

    // 指纹配置
    webrtcMode?: string
    timezoneMode?: string
    customTimezone?: string
    geolocationMode?: string
    languageMode?: string
    customLanguage?: string
    uiLanguageMode?: string
    customUiLanguage?: string
    resolutionMode?: string
    fontMode?: string

    canvasMode?: string
    canvasNoise?: string
    webglMode?: string
    webglVendor?: string
    webglRenderer?: string
    audioMode?: string
    audioNoise?: string
    fonts?: string

    clientRectsMode?: string
    clientRectsNoise?: string
    speechVoicesMode?: string
    webGpuMode?: string
    mediaDevicesMode?: string

    cpuCores?: number
    memoryGb?: number
    deviceName?: string
    macAddress?: string

    // 高级配置
    userDataDir?: string
    launchArgs?: string
    headless?: boolean
    doNotTrack?: string
    portScanProtection?: string
    hardwareAcceleration?: string
    disableTlsFeatures?: string

    // 代理
    proxyId?: number
    proxyConfig?: ProxyConfig

    // Cookie管理
    cookies?: Cookie[]

    // 账号平台
    platform?: string
    accountTags?: string
    bookmarks?: string

    // 状态
    status?: string
    processId?: number
    cdpPort?: number

    createdAt?: string
    updatedAt?: string
}

// Cookie类型定义
export interface Cookie {
    name: string
    value: string
    domain: string
    path?: string
    httpOnly?: boolean
    secure?: boolean
    session?: boolean
    expires?: number
    sameSite?: 'strict' | 'lax' | 'no_restriction' | 'unspecified'
}

// 浏览器内核类型
export interface BrowserKernel {
    id?: number
    name: string
    displayName: string
    chromeVersion: number
    binaryPath?: string
    userAgentTemplate?: string
    isDefault?: boolean
    enabled?: boolean
    remark?: string
    createdAt?: string
}

// 代理配置类型
export interface ProxyConfig {
    id?: number
    name?: string
    proxyType: string
    host?: string
    port?: number
    username?: string
    password?: string
    country?: string
    city?: string
    ipAddress?: string
    status?: string
    remark?: string
    createdAt?: string
}

// 代理测试结果类型
export interface ProxyTestResult {
    success: boolean
    ip?: string
    country?: string
    region?: string
    latency?: number
    error?: string
    location?: string
}

// API响应类型
export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}

// 指纹生成类型
export interface FingerprintData {
    userAgent: string
    screenWidth: number
    screenHeight: number
    timezone: string
    language: string
    webglVendor: string
    webglRenderer: string
    canvasNoise: string
    audioNoise: string
    cpuCores: number
    memoryGb: number
    deviceName: string
    macAddress: string
    [key: string]: any
}

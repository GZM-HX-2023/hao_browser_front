import type { Cookie } from '@/types'

/**
 * Cookie解析工具类
 * 支持JSON、Netscape、Name=Value三种格式
 */

/**
 * 解析Cookie文本
 * 自动检测格式并解析
 */
export function parseCookies(text: string): Cookie[] {
    if (!text || !text.trim()) {
        return []
    }

    const trimmed = text.trim()

    // 检测JSON格式
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        return parseJSON(trimmed)
    }

    // 检测Netscape格式（以#开头或包含多个tab分隔字段）
    if (trimmed.includes('\t') || trimmed.startsWith('#')) {
        return parseNetscape(trimmed)
    }

    // 否则按Name=Value格式解析
    return parseNameValue(trimmed)
}

/**
 * 解析JSON格式Cookie
 * 支持单个对象或数组
 */
export function parseJSON(jsonText: string): Cookie[] {
    try {
        const parsed = JSON.parse(jsonText)
        const cookieArray = Array.isArray(parsed) ? parsed : [parsed]

        return cookieArray.map(item => ({
            name: item.name || '',
            value: item.value || '',
            domain: item.domain || '',
            path: item.path || '/',
            httpOnly: item.httpOnly ?? false,
            secure: item.secure ?? false,
            session: item.session ?? true,
            expires: item.expires,
            sameSite: normalizeSameSite(item.sameSite)
        })).filter(cookie => cookie.name && cookie.domain)
    } catch (error) {
        console.error('JSON解析失败:', error)
        return []
    }
}

/**
 * 解析Netscape格式Cookie
 * 格式: domain flag path secure expiration name value
 */
export function parseNetscape(netscapeText: string): Cookie[] {
    const cookies: Cookie[] = []
    const lines = netscapeText.split('\n')

    for (const line of lines) {
        const trimmed = line.trim()

        // 跳过注释和空行
        if (!trimmed || trimmed.startsWith('#')) {
            continue
        }

        const parts = trimmed.split('\t')
        if (parts.length < 7) {
            continue
        }

        const [domain, , path, secure, expiration, name, value] = parts

        cookies.push({
            name: name.trim(),
            value: value.trim(),
            domain: domain.trim(),
            path: path.trim() || '/',
            httpOnly: false, // Netscape格式不包含此信息
            secure: secure.toLowerCase() === 'true',
            session: expiration === '0',
            expires: expiration !== '0' ? parseInt(expiration) : undefined,
            sameSite: 'unspecified'
        })
    }

    return cookies
}

/**
 * 解析Name=Value格式Cookie
 * 支持多种分隔符: 换行、分号、逗号
 */
export function parseNameValue(nameValueText: string): Cookie[] {
    const cookies: Cookie[] = []

    // 按多种分隔符分割
    const pairs = nameValueText.split(/[;\n,]/)

    for (const pair of pairs) {
        const trimmed = pair.trim()
        if (!trimmed) continue

        const equalIndex = trimmed.indexOf('=')
        if (equalIndex === -1) continue

        const name = trimmed.substring(0, equalIndex).trim()
        const value = trimmed.substring(equalIndex + 1).trim()

        if (name) {
            cookies.push({
                name,
                value,
                domain: '', // 需要用户补充
                path: '/',
                httpOnly: false,
                secure: false,
                session: true,
                sameSite: 'unspecified'
            })
        }
    }

    return cookies
}

/**
 * 验证Cookie对象
 */
export function validateCookie(cookie: Partial<Cookie>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!cookie.name || cookie.name.trim() === '') {
        errors.push('Cookie名称不能为空')
    }

    if (!cookie.domain || cookie.domain.trim() === '') {
        errors.push('Domain不能为空')
    }

    // 验证domain格式
    if (cookie.domain && !isValidDomain(cookie.domain)) {
        errors.push('Domain格式不正确')
    }

    // 验证expires如果存在
    if (cookie.expires !== undefined && cookie.expires < 0) {
        errors.push('过期时间不能为负数')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * 验证domain格式
 */
function isValidDomain(domain: string): boolean {
    // 支持以.开头的domain
    const cleanDomain = domain.startsWith('.') ? domain.substring(1) : domain

    // 简单的domain验证
    const domainRegex = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
    return domainRegex.test(cleanDomain) || cleanDomain === 'localhost'
}

/**
 * 标准化sameSite值
 */
function normalizeSameSite(value: any): Cookie['sameSite'] {
    if (!value) return 'unspecified'

    const normalized = String(value).toLowerCase()

    if (normalized === 'strict') return 'strict'
    if (normalized === 'lax') return 'lax'
    if (normalized === 'no_restriction' || normalized === 'none') return 'no_restriction'

    return 'unspecified'
}

/**
 * 将Cookie转换为JSON字符串
 */
export function cookiesToJSON(cookies: Cookie[]): string {
    return JSON.stringify(cookies, null, 2)
}

/**
 * 合并Cookie数组
 * 相同name+domain的cookie会被新cookie覆盖
 */
export function mergeCookies(existing: Cookie[], newCookies: Cookie[]): Cookie[] {
    const merged = [...existing]

    for (const newCookie of newCookies) {
        const index = merged.findIndex(
            c => c.name === newCookie.name && c.domain === newCookie.domain && c.path === newCookie.path
        )

        if (index !== -1) {
            // 覆盖现有cookie
            merged[index] = newCookie
        } else {
            // 添加新cookie
            merged.push(newCookie)
        }
    }

    return merged
}

/**
 * 格式化过期时间为可读字符串
 */
export function formatExpires(expires?: number): string {
    if (!expires) return 'Session'

    const date = new Date(expires * 1000)
    return date.toLocaleString('zh-CN')
}

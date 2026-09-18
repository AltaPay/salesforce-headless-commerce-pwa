
/**
 * Converts an IPv4 or IPv6 address to a BigInt for bitwise CIDR comparison.
 */
function ipToInt(ip) {
    if (ip.includes('.') && !ip.includes(':')) {
        return ip.split('.').reduce((acc, octet) => (acc << 8n) + BigInt(octet), 0n)
    }

    const [head, tail] = ip.split('::')
    const headParts = head ? head.split(':') : []
    const tailParts = tail ? tail.split(':') : []
    const missing = 8 - headParts.length - tailParts.length
    const groups = [...headParts, ...Array(Math.max(missing, 0)).fill('0'), ...tailParts]

    return groups.reduce((acc, group) => (acc << 16n) + BigInt(parseInt(group || '0', 16)), 0n)
}

function isIPFamilyMatch(a, b) {
    return a.includes(':') === b.includes(':')
}

function isIPInCIDR(ip, cidr) {
    const [range, prefixStr] = cidr.split('/')
    if (!isIPFamilyMatch(ip, range)) return false

    const bits = range.includes(':') ? 128 : 32
    const prefix = parseInt(prefixStr, 10)
    const mask =
        prefix <= 0 ? 0n : (~0n << BigInt(bits - prefix)) & ((1n << BigInt(bits)) - 1n)

    return (ipToInt(ip) & mask) === (ipToInt(range) & mask)
}

/**
 * Checks whether `clientIP` matches any entry in `allowedEntries` - each
 * entry is either an exact IP or a CIDR range (`x.x.x.x/n` or IPv6 equivalent).
 */
export function isKnownIP(clientIP, allowedEntries) {
    return allowedEntries.some((entry) => {
        try {
            return entry.includes('/') ? isIPInCIDR(clientIP, entry) : clientIP === entry
        } catch {
            // Malformed entry or unparseable client IP - treat as non-matching.
            return false
        }
    })
}

/**
 * Extracts the caller's IP from the request.
 */
export function getClientIP(req) {
    const forwardedFor = req.headers['x-forwarded-for']
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.socket && req.socket.remoteAddress

    if (ip && ip.startsWith('::ffff:') && ip.includes('.')) {
        return ip.slice(7)
    }
    return ip
}

export function isRequestFromKnownIP(req, allowedEntries) {
    const clientIP = getClientIP(req)
    return Boolean(clientIP) && isKnownIP(clientIP, allowedEntries)
}

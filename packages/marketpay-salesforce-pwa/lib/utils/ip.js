/**
 * Generic IP-address helpers used to allowlist known webhook callers.
 */

/**
 * Converts an IPv4 or IPv6 address to a BigInt for bitwise CIDR comparison.
 * Strips the `::ffff:` prefix Node uses for IPv4-mapped IPv6 addresses so
 * `::ffff:185.203.232.129` compares equal to the plain IPv4 form.
 */
function ipToBigInt(ip) {
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

function isIpFamilyMatch(a, b) {
    return a.includes(':') === b.includes(':')
}

function isInCidr(ip, cidr) {
    const [range, prefixStr] = cidr.split('/')
    if (!isIpFamilyMatch(ip, range)) return false

    const bits = range.includes(':') ? 128 : 32
    const prefix = parseInt(prefixStr, 10)
    const mask =
        prefix <= 0 ? 0n : (~0n << BigInt(bits - prefix)) & ((1n << BigInt(bits)) - 1n)

    return (ipToBigInt(ip) & mask) === (ipToBigInt(range) & mask)
}

/**
 * Checks whether `clientIp` matches any entry in `allowedEntries` - each
 * entry is either an exact IP or a CIDR range (`x.x.x.x/n` or IPv6 equivalent).
 */
export function isKnownIp(clientIp, allowedEntries) {
    return allowedEntries.some((entry) => {
        try {
            return entry.includes('/') ? isInCidr(clientIp, entry) : clientIp === entry
        } catch {
            // Malformed entry or unparseable client IP - treat as non-matching.
            return false
        }
    })
}

/**
 * Extracts the caller's IP from the request.
 *
 * Normalizes IPv4-mapped IPv6 addresses (`::ffff:1.2.3.4`, as Node reports
 * IPv4 clients on a dual-stack socket) to plain IPv4 up front, so every
 * downstream comparison - CIDR or exact match - works on one consistent form.
 */
export function getClientIp(req) {
    const forwardedFor = req.headers['x-forwarded-for']
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.socket && req.socket.remoteAddress

    if (ip && ip.startsWith('::ffff:') && ip.includes('.')) {
        return ip.slice(7)
    }
    return ip
}

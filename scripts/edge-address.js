function resolveEdgeAddressInput(input) {
    const value = String(input == null ? '' : input).trim();
    const searchResult = () => ({
        type: 'search',
        url: 'https://bing.com/search?q=' + encodeURIComponent(value)
    });

    if (!value) return { type: 'empty', url: '' };
    if (value === 'mainpage.html') return { type: 'navigate', url: value };

    // HOST:PORT resembles a URI scheme, so let the host validation below
    // distinguish it before rejecting ftp:, javascript:, data:, and peers.
    const isHostWithPort = /^[^/?#:\s]+:\d+(?:[/?#]|$)/.test(value);
    const schemeMatch = value.match(/^([a-z][a-z0-9+.-]*):/i);
    if (schemeMatch && !isHostWithPort) {
        const scheme = schemeMatch[1].toLowerCase();
        if ((scheme !== 'http' && scheme !== 'https') || !/^https?:\/\//i.test(value)) {
            return searchResult();
        }
    }

    const hasHttpScheme = /^https?:\/\//i.test(value);
    const candidate = hasHttpScheme ? value : 'http://' + value;

    try {
        const parsed = new URL(candidate);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
            return searchResult();
        }

        if (!hasHttpScheme) {
            const authority = value.split(/[/?#]/, 1)[0];
            const isBracketedIPv6 = /^\[[0-9a-f:.]+\](?::\d+)?$/i.test(authority);
            const hostAndPort = authority.match(/^([^:]+)(?::(\d+))?$/);
            let isSupportedHost = isBracketedIPv6;

            if (hostAndPort) {
                const rawHost = hostAndPort[1];
                const hostname = parsed.hostname.toLowerCase();
                const labels = hostname.split('.');
                const isLocalhost = rawHost.toLowerCase() === 'localhost';
                const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(rawHost)
                    && rawHost.split('.').every(part => Number(part) <= 255);
                const isDomain = rawHost.includes('.')
                    && labels.length > 1
                    && labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))
                    && /[a-z]/i.test(labels[labels.length - 1]);
                isSupportedHost = isLocalhost || isIPv4 || isDomain;
            }

            if (!isSupportedHost) return searchResult();
        }

        return { type: 'navigate', url: candidate };
    }
    catch {
        return searchResult();
    }
}

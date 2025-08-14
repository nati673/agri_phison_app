export const redirectToSubdomain = (subdomain, path = '/') => {
  const { protocol, hostname, port } = window.location;

  // Extract base domain (handles localhost, 127.0.0.1, or custom domains)
  const hostParts = hostname.split('.');
  let baseDomain;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    baseDomain = hostname;
  } else {
    baseDomain = hostParts.slice(-2).join('.'); // example: myapp.com
  }

  const portPart = port ? `:${port}` : '';
  const url = `${protocol}//${subdomain}.${baseDomain}${portPart}${path}`;

  window.location.href = url;
};

// utils/subdomain.js
export function hasSubdomain() {
  const host = window.location.hostname;
  const parts = host.split('.');

  if (host.includes('localhost')) {
    return parts.length === 2;
  }

  return parts.length > 2;
}

export const getSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname.split('.')[0];
};
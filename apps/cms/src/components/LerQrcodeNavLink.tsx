'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function LerQrcodeNavLink() {
  const pathname = usePathname()
  const active = pathname?.endsWith('/ler-qrcode')

  return (
    <Link
      className={active ? 'nav__link active' : 'nav__link'}
      href="/admin/ler-qrcode"
      id="nav-ler-qrcode"
      prefetch={false}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        textDecoration: 'none',
        color: 'var(--theme-elevation-800)',
        fontWeight: active ? 700 : 500,
        background: active ? 'var(--theme-elevation-100)' : 'transparent',
        borderRadius: 4,
        margin: '4px 0',
      }}
    >
      <span className="nav__link-label">Ler QR Code</span>
    </Link>
  )
}

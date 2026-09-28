import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { LerQrcodeClient } from './LerQrcodeClient'

export function LerQrcodeView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    locale,
    permissions,
    req: {
      i18n,
      payload,
      user,
    },
    visibleEntities,
  } = initPageResult

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user || undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <LerQrcodeClient />
      </Gutter>
    </DefaultTemplate>
  )
}

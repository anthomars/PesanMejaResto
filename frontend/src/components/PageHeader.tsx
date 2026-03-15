import type { ReactElement } from 'react'
import { Stack, Typography } from '@mui/material'

type PageHeaderProps = {
  title: string
  description: string
  action?: ReactElement | null
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'flex-end' }}
      spacing={2}
    >
      <Stack spacing={1}>
        <Typography variant="overline" color="primary.main" fontWeight={700}>
          Operasional
        </Typography>
        <Typography variant="h3">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
      {action ?? null}
    </Stack>
  )
}

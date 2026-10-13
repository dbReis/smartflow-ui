import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from '../api/health'

export function ApiStatus() {
  const { isPending, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: false,
    refetchInterval: 30_000,
  })

  if (isPending) {
    return <Indicator dotClass="bg-neutral-300" label="Checking API…" />
  }
  if (isError) {
    return (
      <Indicator
        dotClass="bg-red-500"
        label="API offline"
        title={error.message}
      />
    )
  }
  return <Indicator dotClass="bg-emerald-500" label="API online" />
}

interface IndicatorProps {
  dotClass: string
  label: string
  title?: string
}

function Indicator({ dotClass, label, title }: IndicatorProps) {
  return (
    <span
      role="status"
      title={title}
      className="inline-flex items-center gap-2 text-sm text-neutral-500"
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  )
}

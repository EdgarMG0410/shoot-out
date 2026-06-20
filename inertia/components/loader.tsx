import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import Lottie from 'lottie-react'

/**
 * Branded route-transition loader — shows the FORMA logo Lottie as a full-screen
 * overlay while an Inertia visit is in flight (only past ~250ms, so instant
 * navigations and quick form posts don't flash it).
 */
export function Loader() {
  const [active, setActive] = useState(false)
  const [data, setData] = useState<object | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let alive = true
    fetch('/logo-lottie.json')
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const offStart = router.on('start', () => {
      timer.current = window.setTimeout(() => setActive(true), 250)
    })
    const offFinish = router.on('finish', () => {
      window.clearTimeout(timer.current)
      setActive(false)
    })
    return () => {
      offStart()
      offFinish()
      window.clearTimeout(timer.current)
    }
  }, [])

  if (!active || !data) return null

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-bone-1/80 backdrop-blur-sm">
      <Lottie animationData={data} loop autoplay className="size-28" />
    </div>
  )
}

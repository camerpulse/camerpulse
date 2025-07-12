import { useCallback } from 'react'

interface VibrationOptions {
  duration?: number | number[]
  enabled?: boolean
}

export const useVibration = (options: VibrationOptions = {}) => {
  const { duration = 10, enabled = true } = options

  const vibrate = useCallback((customDuration?: number | number[]) => {
    if (!enabled || !navigator.vibrate) return

    const vibrationDuration = customDuration || duration
    navigator.vibrate(vibrationDuration)
  }, [duration, enabled])

  const vibrateSuccess = useCallback(() => {
    vibrate([100, 50, 100])
  }, [vibrate])

  const vibrateError = useCallback(() => {
    vibrate([200, 100, 200, 100, 200])
  }, [vibrate])

  const vibrateClick = useCallback(() => {
    vibrate(20)
  }, [vibrate])

  const vibrateLongPress = useCallback(() => {
    vibrate(50)
  }, [vibrate])

  return {
    vibrate,
    vibrateSuccess,
    vibrateError,
    vibrateClick,
    vibrateLongPress,
    isSupported: !!navigator.vibrate
  }
}
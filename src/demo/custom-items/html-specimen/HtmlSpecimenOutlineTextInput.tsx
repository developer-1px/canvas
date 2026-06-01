import {
  useEffect,
  useRef,
} from 'react'

export function HtmlSpecimenOutlineTextInput({
  onCancel,
  onChange,
  onCommit,
  value,
}: {
  onCancel: () => void
  onChange: (value: string) => void
  onCommit: (value: string, reason: 'blur' | 'keyboard') => void
  value: string
}) {
  const ref = useRef<HTMLInputElement | null>(null)
  const settledRef = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  const commit = (nextValue: string, reason: 'blur' | 'keyboard') => {
    if (settledRef.current) {
      return
    }

    settledRef.current = true
    onCommit(nextValue, reason)
  }

  const cancel = () => {
    if (settledRef.current) {
      return
    }

    settledRef.current = true
    onCancel()
  }

  return (
    <input
      ref={ref}
      className="html-specimen-outline-input"
      onBlur={(event) => commit(event.currentTarget.value, 'blur')}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          commit(event.currentTarget.value, 'keyboard')
          event.preventDefault()
          event.stopPropagation()
        }

        if (event.key === 'Escape') {
          cancel()
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      spellCheck={false}
      type="text"
      value={value}
    />
  )
}

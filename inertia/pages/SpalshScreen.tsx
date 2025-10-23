import { useEffect, useRef } from 'react'
import '../css/splash.css'
import { usePage } from '@inertiajs/react'

export default function SplashScreen() {
  const textRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { props } = usePage() as any

  useEffect(() => {
    if (textRef.current) {
      splitText(textRef.current)
    }

    // Trigger animasi akhir setelah semua animasi selesai
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add('splash-exit')
      }
    }, 4000) // 4 detik setelah component mount

    return () => clearTimeout(timer)
  }, [])

  const splitText = (element: HTMLElement) => {
    const text = element.textContent?.trim() || ''
    const words = text.split(/\s+/)

    element.innerHTML = ''

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span')
      wordSpan.className = 'split-text-word'

      const chars = word.split('')
      chars.forEach((char, charIndex) => {
        const charSpan = document.createElement('span')
        charSpan.className = 'split-text-char'
        charSpan.textContent = char

        // Calculate delay secara dinamis
        const delay = 1.4 + charIndex * 0.05 + wordIndex * 0.3
        charSpan.style.animationDelay = `${delay}s`

        wordSpan.appendChild(charSpan)
      })

      element.appendChild(wordSpan)

      // Tambah space antara kata
      if (wordIndex < words.length - 1) {
        element.appendChild(document.createTextNode('\u00A0'))
      }
    })
  }

  return (
    <div ref={containerRef} className="w-full h-screen bg-black fixed z-50 splash-container">
      {/* SVG Mask untuk efek tertarik ke atas */}
      <svg className="splash-mask" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <mask id="splashMask">
            <rect width="100" height="100" fill="white" />
            <circle className="splash-mask-circle" cx="50" cy="50" r="0" fill="black">
              <animate
                attributeName="r"
                from="0"
                to="100"
                dur="1s"
                begin="4s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            </circle>
          </mask>
        </defs>
      </svg>

      <img src={props.logo ?? '/public/images/logo.png'} className="logo-containers"></img>
      <div ref={textRef} className="split-text-container">
        {props.website_name ?? 'Welcome'}
      </div>
    </div>
  )
}

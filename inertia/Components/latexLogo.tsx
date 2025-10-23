import React, { useEffect, useRef, useState } from 'react'

/**
 * math_shortcuts.tsx
 *
 * - Export: MATH_SHORTCUTS (100 items)
 * - Each item: { name, latex, char: <LatexSvg latex="..."/> }
 *
 * LatexSvg:
 * - Loads MathJax (CDN) once on first use
 * - Uses MathJax.tex2svgPromise to convert latex -> inline SVG
 * - Normalizes SVG to width="1em" height="1em" and fill="currentColor"
 * - Safe for React + Vite, follows Tailwind text color via currentColor
 *
 * NOTE:
 * - If you prefer to use an npm package (mathjax-full) instead of CDN,
 *   replace loadMathJax() with an import from 'mathjax-full' and adapt.
 */

// -- LatexSvg component -----------------------------------------------------
type LatexSvgProps = {
  latex: string
  display?: boolean // display mode (block) or inline
  className?: string
}

let mathJaxLoadingPromise: Promise<any> | null = null

async function loadMathJax(): Promise<any> {
  if (typeof window === 'undefined') return null
  if ((window as any).MathJax) return (window as any).MathJax
  if (mathJaxLoadingPromise) return mathJaxLoadingPromise

  mathJaxLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
    script.async = true
    script.onload = () => {
      // MathJax global ready
      const MJ = (window as any).MathJax
      if (!MJ) {
        reject(new Error('MathJax failed to load'))
        return
      }
      // Ensure svg font caches use em-based sizing; mostly default works.
      resolve(MJ)
    }
    script.onerror = (e) => reject(e)
    document.head.appendChild(script)
  })

  return mathJaxLoadingPromise
}

/**
 * LatexSvg - renders LaTeX into inline SVG at runtime using MathJax v3 (tex-svg)
 * - output is sanitized by MathJax
 * - sets width/height to 1em & fill/currentColor for tailwind adaptive color
 */
export function LatexSvg({ latex, display = false, className }: LatexSvgProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const MJ = await loadMathJax()
        if (!mounted) return
        // tex2svgPromise returns a DocumentFragment with <svg> element inside
        // Use display mode config
        const options = {
          display: display,
        }
        // MathJax global might be loaded with different variable name, but cdn sets window.MathJax
        const node = await (MJ as any).tex2svgPromise(latex, options)
        if (!mounted) return
        const svg =
          node && node.firstElementChild ? (node.firstElementChild as SVGSVGElement) : null
        if (!svg) {
          setError('No SVG generated')
          return
        }

        // Normalize SVG attributes to follow currentColor and sizing
        try {
          // set width/height to 1em for consistent inline sizing
          svg.setAttribute('width', '1em')
          svg.setAttribute('height', '1em')
          // ensure fill uses currentColor; MathJax might inline styles on <g> or <path>.
          // We'll set 'color' on svg to 'currentColor' and rely on CSS inheritance.
          svg.setAttribute('color', 'currentColor')
          // remove any hardcoded fill colors if present (best-effort)
          svg.querySelectorAll('[fill]').forEach((el) => {
            // only remove fill if it's not 'none'
            const v = el.getAttribute('fill')
            if (v && v.toLowerCase() !== 'none') {
              el.setAttribute('fill', 'currentColor')
            }
          })
          // remove inline style color if present
          svg.removeAttribute('style')
        } catch (e) {
          // ignore normalization errors
        }

        if (containerRef.current) {
          // inject sanitized svg outerHTML
          containerRef.current.innerHTML = ''
          containerRef.current.appendChild(svg)
        }
      } catch (e: any) {
        console.error('LatexSvg error:', e)
        if (mounted) setError(String(e?.message || e))
      }
    })()

    return () => {
      mounted = false
    }
  }, [latex, display])

  if (error) {
    // fallback: show raw latex in monospace small text
    return (
      <code className={className} style={{ fontSize: '0.9em' }}>
        {latex}
      </code>
    )
  }

  return <span ref={containerRef} className={className} aria-hidden="true" />
}

// File: math_shortcuts.tsx
// Kumpulan 100 simbol matematika dan fisika untuk React
// Format: { name, latex, char: <LatexSvg latex={...} /> }

export const MATH_SHORTCUTS = [
  {
    category: 'Arithmetic',
    items: [
      { name: 'Plus', latex: '+', char: <LatexSvg latex={'+'} /> },
      { name: 'Minus', latex: '-', char: <LatexSvg latex={'-'} /> },
      { name: 'Times', latex: '\\times', char: <LatexSvg latex={'\\times'} /> },
      { name: 'Division', latex: '\\div', char: <LatexSvg latex={'\\div'} /> },
      { name: 'Dot', latex: '\\cdot', char: <LatexSvg latex={'\\cdot'} /> },
      { name: 'PlusMinus', latex: '\\pm', char: <LatexSvg latex={'\\pm'} /> },
      { name: 'MinusPlus', latex: '\\mp', char: <LatexSvg latex={'\\mp'} /> },
      { name: 'Equal', latex: '=', char: <LatexSvg latex={'='} /> },
      { name: 'Not Equal', latex: '\\neq', char: <LatexSvg latex={'\\neq'} /> },
      { name: 'Approximately', latex: '\\approx', char: <LatexSvg latex={'\\approx'} /> },
    ],
  },
  {
    category: 'Algebra',
    items: [
      { name: 'Square Root', latex: '\\sqrt{x}', char: <LatexSvg latex={'\\sqrt{x}'} /> },
      { name: 'Nth Root', latex: '\\sqrt[n]{x}', char: <LatexSvg latex={'\\sqrt[n]{x}'} /> },
      { name: 'Exponent', latex: 'x^{n}', char: <LatexSvg latex={'x^{n}'} /> },
      { name: 'Subscript', latex: 'x_{i}', char: <LatexSvg latex={'x_{i}'} /> },
      { name: 'Fraction', latex: '\\frac{a}{b}', char: <LatexSvg latex={'\\frac{a}{b}'} /> },
      { name: 'Absolute', latex: '|x|', char: <LatexSvg latex={'|x|'} /> },
      { name: 'Norm', latex: '\\lVert x \\rVert', char: <LatexSvg latex={'\\lVert x \\rVert'} /> },
      {
        name: 'Matrix',
        latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
        char: <LatexSvg latex={'\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}'} />,
      },
      { name: 'Determinant', latex: '\\det A', char: <LatexSvg latex={'\\det A'} /> },
      {
        name: 'Trace',
        latex: '\\operatorname{tr} A',
        char: <LatexSvg latex={'\\operatorname{tr} A'} />,
      },
    ],
  },
  {
    category: 'Calculus',
    items: [
      { name: 'Derivative', latex: '\\frac{dy}{dx}', char: <LatexSvg latex={'\\frac{dy}{dx}'} /> },
      {
        name: 'Partial Derivative',
        latex: '\\frac{\\partial f}{\\partial x}',
        char: <LatexSvg latex={'\\frac{\\partial f}{\\partial x}'} />,
      },
      { name: 'Integral', latex: '\\int', char: <LatexSvg latex={'\\int'} /> },
      { name: 'Double Integral', latex: '\\iint', char: <LatexSvg latex={'\\iint'} /> },
      { name: 'Triple Integral', latex: '\\iiint', char: <LatexSvg latex={'\\iiint'} /> },
      { name: 'Contour Integral', latex: '\\oint', char: <LatexSvg latex={'\\oint'} /> },
      { name: 'Gradient', latex: '\\nabla f', char: <LatexSvg latex={'\\nabla f'} /> },
      { name: 'Divergence', latex: '\\nabla \\cdot', char: <LatexSvg latex={'\\nabla \\cdot'} /> },
      { name: 'Curl', latex: '\\nabla \\times', char: <LatexSvg latex={'\\nabla \\times'} /> },
      { name: 'Limit', latex: '\\lim_{x \\to 0}', char: <LatexSvg latex={'\\lim_{x \\to 0}'} /> },
    ],
  },
  {
    category: 'Trigonometry',
    items: [
      { name: 'Sine', latex: '\\sin x', char: <LatexSvg latex={'\\sin x'} /> },
      { name: 'Cosine', latex: '\\cos x', char: <LatexSvg latex={'\\cos x'} /> },
      { name: 'Tangent', latex: '\\tan x', char: <LatexSvg latex={'\\tan x'} /> },
      { name: 'Cotangent', latex: '\\cot x', char: <LatexSvg latex={'\\cot x'} /> },
      { name: 'Secant', latex: '\\sec x', char: <LatexSvg latex={'\\sec x'} /> },
      { name: 'Cosecant', latex: '\\csc x', char: <LatexSvg latex={'\\csc x'} /> },
      { name: 'Arcsine', latex: '\\arcsin x', char: <LatexSvg latex={'\\arcsin x'} /> },
      { name: 'Arccosine', latex: '\\arccos x', char: <LatexSvg latex={'\\arccos x'} /> },
      { name: 'Arctangent', latex: '\\arctan x', char: <LatexSvg latex={'\\arctan x'} /> },
      { name: 'Angle', latex: '\\angle', char: <LatexSvg latex={'\\angle'} /> },
    ],
  },
  {
    category: 'Set Theory & Logic',
    items: [
      { name: 'For All', latex: '\\forall', char: <LatexSvg latex={'\\forall'} /> },
      { name: 'Exists', latex: '\\exists', char: <LatexSvg latex={'\\exists'} /> },
      { name: 'Element Of', latex: '\\in', char: <LatexSvg latex={'\\in'} /> },
      { name: 'Not Element Of', latex: '\\notin', char: <LatexSvg latex={'\\notin'} /> },
      { name: 'Subset', latex: '\\subset', char: <LatexSvg latex={'\\subset'} /> },
      { name: 'Superset', latex: '\\supset', char: <LatexSvg latex={'\\supset'} /> },
      { name: 'Union', latex: '\\cup', char: <LatexSvg latex={'\\cup'} /> },
      { name: 'Intersection', latex: '\\cap', char: <LatexSvg latex={'\\cap'} /> },
      { name: 'Empty Set', latex: '\\emptyset', char: <LatexSvg latex={'\\emptyset'} /> },
      { name: 'Logical And', latex: '\\land', char: <LatexSvg latex={'\\land'} /> },
      { name: 'Logical Or', latex: '\\lor', char: <LatexSvg latex={'\\lor'} /> },
      { name: 'Not', latex: '\\lnot', char: <LatexSvg latex={'\\lnot'} /> },
      { name: 'Implies', latex: '\\Rightarrow', char: <LatexSvg latex={'\\Rightarrow'} /> },
      {
        name: 'If and Only If',
        latex: '\\Leftrightarrow',
        char: <LatexSvg latex={'\\Leftrightarrow'} />,
      },
      { name: 'Therefore', latex: '\\therefore', char: <LatexSvg latex={'\\therefore'} /> },
      { name: 'Because', latex: '\\because', char: <LatexSvg latex={'\\because'} /> },
    ],
  },
  {
    category: 'Geometry & Vectors',
    items: [
      { name: 'Vector', latex: '\\vec{v}', char: <LatexSvg latex={'\\vec{v}'} /> },
      {
        name: 'Dot Product',
        latex: '\\vec{a} \\cdot \\vec{b}',
        char: <LatexSvg latex={'\\vec{a} \\cdot \\vec{b}'} />,
      },
      {
        name: 'Cross Product',
        latex: '\\vec{a} \\times \\vec{b}',
        char: <LatexSvg latex={'\\vec{a} \\times \\vec{b}'} />,
      },
      { name: 'Perpendicular', latex: '\\perp', char: <LatexSvg latex={'\\perp'} /> },
      { name: 'Parallel', latex: '\\parallel', char: <LatexSvg latex={'\\parallel'} /> },
      {
        name: 'Line Segment',
        latex: '\\overline{AB}',
        char: <LatexSvg latex={'\\overline{AB}'} />,
      },
      { name: 'Triangle', latex: '\\triangle', char: <LatexSvg latex={'\\triangle'} /> },
      { name: 'Angle ABC', latex: '\\angle ABC', char: <LatexSvg latex={'\\angle ABC'} /> },
      { name: 'Circle', latex: '\\bigcirc', char: <LatexSvg latex={'\\bigcirc'} /> },
      { name: 'Radius', latex: 'r', char: <LatexSvg latex={'r'} /> },
    ],
  },
  {
    category: 'Statistics & Probability',
    items: [
      { name: 'Mean', latex: '\\bar{x}', char: <LatexSvg latex={'\\bar{x}'} /> },
      { name: 'Variance', latex: '\\sigma^2', char: <LatexSvg latex={'\\sigma^2'} /> },
      { name: 'Standard Deviation', latex: '\\sigma', char: <LatexSvg latex={'\\sigma'} /> },
      { name: 'Probability', latex: 'P(A)', char: <LatexSvg latex={'P(A)'} /> },
      { name: 'Conditional Probability', latex: 'P(A|B)', char: <LatexSvg latex={'P(A|B)'} /> },
      { name: 'Combination', latex: '\\binom{n}{r}', char: <LatexSvg latex={'\\binom{n}{r}'} /> },
      { name: 'Permutation', latex: 'P(n,r)', char: <LatexSvg latex={'P(n,r)'} /> },
      { name: 'Expected Value', latex: 'E[X]', char: <LatexSvg latex={'E[X]'} /> },
      {
        name: 'Covariance',
        latex: '\\operatorname{Cov}(X,Y)',
        char: <LatexSvg latex={'\\operatorname{Cov}(X,Y)'} />,
      },
      { name: 'Correlation', latex: '\\rho', char: <LatexSvg latex={'\\rho'} /> },
    ],
  },
  {
    category: 'Physics',
    items: [
      { name: 'Force', latex: '\\vec{F}', char: <LatexSvg latex={'\\vec{F}'} /> },
      { name: 'Momentum', latex: '\\vec{p}', char: <LatexSvg latex={'\\vec{p}'} /> },
      { name: 'Energy', latex: 'E', char: <LatexSvg latex={'E'} /> },
      { name: 'Work', latex: 'W = F \\cdot d', char: <LatexSvg latex={'W = F \\cdot d'} /> },
      { name: 'Power', latex: 'P = \\frac{W}{t}', char: <LatexSvg latex={'P = \\frac{W}{t}'} /> },
      {
        name: 'Pressure',
        latex: 'P = \\frac{F}{A}',
        char: <LatexSvg latex={'P = \\frac{F}{A}'} />,
      },
      {
        name: 'Density',
        latex: '\\rho = \\frac{m}{V}',
        char: <LatexSvg latex={'\\rho = \\frac{m}{V}'} />,
      },
      { name: 'Velocity', latex: '\\vec{v}', char: <LatexSvg latex={'\\vec{v}'} /> },
      { name: 'Acceleration', latex: '\\vec{a}', char: <LatexSvg latex={'\\vec{a}'} /> },
      {
        name: 'Newton 2nd Law',
        latex: '\\vec{F} = m\\vec{a}',
        char: <LatexSvg latex={'\\vec{F} = m\\vec{a}'} />,
      },
      {
        name: 'Kinetic Energy',
        latex: 'E_k = \\frac{1}{2}mv^2',
        char: <LatexSvg latex={'E_k = \\frac{1}{2}mv^2'} />,
      },
      { name: 'Potential Energy', latex: 'E_p = mgh', char: <LatexSvg latex={'E_p = mgh'} /> },
      { name: 'Charge', latex: 'q', char: <LatexSvg latex={'q'} /> },
      {
        name: 'Coulomb Law',
        latex: 'F = k\\frac{q_1 q_2}{r^2}',
        char: <LatexSvg latex={'F = k\\frac{q_1 q_2}{r^2}'} />,
      },
      { name: 'Electric Field', latex: '\\vec{E}', char: <LatexSvg latex={'\\vec{E}'} /> },
      { name: 'Magnetic Field', latex: '\\vec{B}', char: <LatexSvg latex={'\\vec{B}'} /> },
      { name: 'Flux', latex: '\\Phi', char: <LatexSvg latex={'\\Phi'} /> },
      { name: 'Ohm Law', latex: 'V = IR', char: <LatexSvg latex={'V = IR'} /> },
      {
        name: 'Wave Equation',
        latex: '\\lambda f = v',
        char: <LatexSvg latex={'\\lambda f = v'} />,
      },
      { name: 'Einstein Mass–Energy', latex: 'E = mc^2', char: <LatexSvg latex={'E = mc^2'} /> },
    ],
  },
]

export default MATH_SHORTCUTS

// components/QuillEditor.tsx
import { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import MATH_SHORTCUTS from './latexLogo'

interface QuillEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  height?: number
  width?: number | string
}

export default function QuillEditor({
  value = '',
  onChange,
  placeholder = 'Write something amazing...',
  height = 500,
  width = '100%',
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showFormulaModal, setShowFormulaModal] = useState(false)

  // Initialize Quill dengan KaTeX
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return

    // Load KaTeX untuk Quill
    window.katex = katex

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder: placeholder,
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'formula'],
            ['clean'],
          ],
          handlers: {
            image: imageHandler,
            formula: () => setShowFormulaModal(true),
          },
        },
        clipboard: {
          matchVisual: false,
        },
      },
      formats: [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'script',
        'list',
        'indent',
        'align',
        'blockquote',
        'code-block',
        'link',
        'image',
        'formula',
      ],
    })

    quillRef.current = quill
    setIsLoaded(true)

    // Set initial value
    if (value) {
      quill.root.innerHTML = value
    }

    // Handle content changes
    quill.on('text-change', () => {
      const content = quill.root.innerHTML
      onChange?.(content)
    })

    return () => {
      if (quillRef.current) {
        quillRef.current = null
      }
    }
  }, [])

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value
    }
  }, [value])

  // Image handler (base64)
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = () => {
      if (input.files && input.files[0]) {
        const file = input.files[0]

        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB')
          return
        }

        const reader = new FileReader()

        reader.onload = (e) => {
          const base64 = e.target?.result as string
          if (base64 && quillRef.current) {
            const range = quillRef.current.getSelection()
            quillRef.current.insertEmbed(range?.index || 0, 'image', base64)
          }
        }

        reader.readAsDataURL(file)
      }
    }
  }

  // Insert formula ke editor
  const insertFormula = (formula: string) => {
    if (formula && quillRef.current) {
      const range = quillRef.current.getSelection()
      const position = range?.index || 0

      try {
        quillRef.current.insertEmbed(position, 'formula', formula)
        setShowFormulaModal(false)
      } catch (error) {
        console.error('Error inserting formula:', error)
        alert('Error inserting formula. Please check your LaTeX syntax.')
      }
    }
  }

  // Formula Modal Component dengan uncontrolled approach tapi state untuk preview
  const FormulaModal = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [modalState, setModalState] = useState({
      selectedCategory: MATH_SHORTCUTS[0].category,
      showCategories: false,
      formulaPreview: '', // State khusus untuk preview
    })

    // Ref untuk formula input (uncontrolled)
    const formulaInputRef = useRef('')

    const insertMathShortcut = (latex: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentValue = formulaInputRef.current

      const selectedText = currentValue.substring(start, end)

      let newLatex = latex
      if (selectedText && latex.includes('{}')) {
        newLatex = latex.replace(/\{\}/g, `{${selectedText}}`)
      } else {
        newLatex = latex.replace(/\{\}/g, '{x}')
      }

      const newValue = currentValue.substring(0, start) + newLatex + currentValue.substring(end)

      // Update ref dan textarea value langsung
      formulaInputRef.current = newValue
      textarea.value = newValue

      // Update preview state
      setModalState((prev) => ({ ...prev, formulaPreview: newValue }))

      // Set cursor position
      const newCursorPos = start + newLatex.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      formulaInputRef.current = e.target.value
      setModalState((prev) => ({ ...prev, formulaPreview: e.target.value }))
    }

    const handleInsertFormula = () => {
      insertFormula(formulaInputRef.current)
      formulaInputRef.current = '' // Reset
      setModalState((prev) => ({ ...prev, formulaPreview: '' }))
      if (textareaRef.current) {
        textareaRef.current.value = ''
      }
    }

    if (!showFormulaModal) return null

    const currentCategory = MATH_SHORTCUTS.find(
      (cat) => cat.category === modalState.selectedCategory
    )

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl h-[85vh] overflow-hidden shadow-2xl w-full max-w-6xl flex">
          {/* Sidebar Categories */}
          <div
            className={`w-64 bg-gray-50 border-r border-gray-200 transition-all ${
              modalState.showCategories ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">Math Categories</h3>
            </div>
            <div className="overflow-y-auto h-full">
              {MATH_SHORTCUTS.map((category, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setModalState((prev) => ({ ...prev, selectedCategory: category.category }))
                  }
                  className={`w-full text-left p-3 border-b border-gray-100 hover:bg-white transition-colors ${
                    modalState.selectedCategory === category.category
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'text-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm">{category.category}</div>
                  <div className="text-xs text-gray-500 mt-1">{category.items.length} items</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setModalState((prev) => ({ ...prev, showCategories: !prev.showCategories }))
                    }
                    className="md:hidden text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <span className="text-2xl">🧮</span>
                      {modalState.selectedCategory}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFormulaModal(false)
                    formulaInputRef.current = ''
                    setModalState((prev) => ({ ...prev, formulaPreview: '' }))
                  }}
                  className="text-white hover:text-blue-200 transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Quick Templates Grid */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Quick Actions ({currentCategory?.items.length}):
                </label>
                <div className="flex flex-wrap gap-3">
                  {currentCategory?.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => insertMathShortcut(item.latex)}
                      className="py-1 px-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center group"
                      type="button"
                      title={`${item.name}: ${item.latex}`}
                    >
                      <div
                        className={`${currentCategory.category == 'Trigonometry' ? 'text-3xl' : 'text-2xl'} font-bold text-gray-700 group-hover:text-blue-600`}
                      >
                        {item.char}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formula Input */}
              <div className="flex flex-col lg:flex-row w-full">
                <div className="mb-4 w-full lg:w-1/2 h-[135px] border border-gray-300 bg-gray-50">
                  <label className="block h-[30px] pl-3 text-sm font-medium text-gray-700">
                    LaTeX Formula:
                  </label>
                  <textarea
                    ref={textareaRef}
                    onChange={handleTextareaChange}
                    placeholder="Type your LaTeX formula here... (e.g., x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a})"
                    className="w-full h-[105px] px-3 py-2 border bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    autoFocus
                  />
                </div>

                {/* Preview */}

                <div className="mb-4 h-[135px] w-full lg:w-1/2 p-4 border border-gray-300 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview:</label>
                  <div className="flex justify-center p-3 bg-white rounded">
                    {modalState.formulaPreview && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: katex.renderToString(modalState.formulaPreview, {
                            displayMode: true,
                            throwOnError: false,
                          }),
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowFormulaModal(false)
                    formulaInputRef.current = ''
                    setModalState((prev) => ({ ...prev, formulaPreview: '' }))
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsertFormula}
                  disabled={!modalState.formulaPreview}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Insert Formula
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`mx-auto ${width === 'full' ? 'w-full' : `max-w-[${width}`}]`}>
      <div ref={editorRef} className={`border border-gray-300 rounded-lg min-h-[${height}px]`} />

      {/* Formula Modal */}
      <FormulaModal />
    </div>
  )
}

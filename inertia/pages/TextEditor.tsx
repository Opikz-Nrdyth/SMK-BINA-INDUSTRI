// pages/QuillNativeDemo.tsx
import { useState } from 'react'
import QuillNativeEditor from '~/Components/TextEditor'

export default function QuillNativeDemo() {
  const [content, setContent] = useState('')

  const handleSave = () => {
    alert('Content saved! Check console for details.')
  }

  const loadSampleContent = () => {
    const sampleContent = `
      <h1>🚀 Native Quill.js Editor</h1>
      
      <p>This is a <strong>fully featured</strong> rich text editor built with native Quill.js:</p>
      
      <ul>
        <li>📷 <strong>Image Upload</strong> (saved as base64)</li>
        <li>🧮 <strong>Math Equations</strong> (30+ shortcuts)</li>
        <li>🎨 <strong>Full Formatting</strong> (bold, italic, colors, fonts, sizes)</li>
        <li>📊 <strong>Lists & Tables</strong></li>
        <li>🔗 <strong>Links & Embeds</strong></li>
        <li>💬 <strong>Code Blocks</strong></li>
        <li>✅ <strong>React 19 Compatible</strong></li>
      </ul>

      <h2>Math Examples:</h2>
      
      <p>Use the math shortcuts above to insert equations like:</p>
      
      <blockquote>
        $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
      </blockquote>

      <h3>Try These Features:</h3>
      <ol>
        <li>Upload images using the image button</li>
        <li>Use math shortcuts for quick equations</li>
        <li>Try different fonts and colors</li>
        <li>Create lists and tables</li>
      </ol>
    `
    setContent(sampleContent)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📝 Native Quill.js Editor</h1>
          <p className="text-lg text-gray-600">
            100% React 19 Compatible • Base64 Images • Full Features
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={loadSampleContent}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            📋 Load Sample
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            💾 Save Content
          </button>
          <button
            onClick={() => setContent('')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <QuillNativeEditor value={content} onChange={setContent} height={30} width="100%" />
        </div>

        {content && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
    </div>
  )
}

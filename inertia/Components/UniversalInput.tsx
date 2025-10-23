import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import Select, { MultiValue } from 'react-select'
import { useDropzone } from 'react-dropzone'
import QuillEditor from './TextEditor'

// Types
export type InputType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'richtext'
  | 'datetime-local'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'range'
  | 'color'
  | 'rating'
  | 'file'
  | 'currency'
  | 'array'
  | 'table-picker'

export interface Option {
  value: string | number
  label: string
}

export interface TableColumn {
  key: string
  label: string
}

export interface UniversalInputProps {
  type: InputType
  name: string
  label?: string
  onError?: string
  value?: any
  onChange: (value: any) => void
  placeholder?: string
  options?: Option[]
  columns?: TableColumn[]
  tableData?: any[]
  multiple?: boolean
  width?: string
  height?: number
  accept?: string
  min?: number
  max?: number
  step?: number
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  className?: string
  dark?: boolean
  uppercase?: boolean
  lowercase?: boolean
  noSpace?: boolean
}

// Helper: Format Rupiah
const formatRupiah = (value: string) => {
  const number = value.replace(/[^,\d]/g, '')
  const split = number.split(',')
  const remainder = split[0].length % 3
  let rupiah = split[0].substr(0, remainder)
  const thousand = split[0].substr(remainder).match(/\d{3}/gi)

  if (thousand) {
    const separator = remainder ? '.' : ''
    rupiah += separator + thousand.join('.')
  }

  rupiah = split[1] ? rupiah + ',' + split[1] : rupiah
  return 'Rp ' + rupiah
}

// Helper: Parse Rupiah
const parseRupiah = (value: string): number => {
  return Number(value.replace(/[^,\d]/g, '').replace(',', '.'))
}

export default function UniversalInput({
  type,
  name,
  label,
  value,
  onError,
  onChange,
  placeholder,
  options = [],
  columns = [],
  tableData = [],
  multiple = false,
  width = '100%',
  height = 30,
  accept,
  min,
  max,
  step,
  required = false,
  disabled = false,
  readonly = false,
  className = '',
  uppercase = false,
  lowercase = false,
  noSpace = false,
}: UniversalInputProps) {
  const [previewFiles, setPreviewFiles] = useState<string[]>([])
  const [viewPass, setViewPass] = useState<boolean>(false)
  const [dark, setDark] = useState(false)
  useEffect(() => {
    setDark(localStorage.theme == 'dark' || false)
  }, [localStorage])

  // File Dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const previews = acceptedFiles.map((file) => URL.createObjectURL(file))
      setPreviewFiles(previews)
      onChange(acceptedFiles)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: accept ? { [accept]: [] } : undefined,
  })

  // Array Input Handler
  const handleArrayAdd = () => {
    const newArray = [...(value || []), '']
    onChange(newArray)
  }

  const handleArrayRemove = (index: number) => {
    const newArray = (value || []).filter((_: any, i: number) => i !== index)
    onChange(newArray)
  }

  const handleArrayChange = (index: number, newValue: string) => {
    const newArray = [...(value || [])]
    newArray[index] = newValue
    onChange(newArray)
  }

  // Currency Handler
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    const formatted = formatRupiah(rawValue)
    onChange(rawValue)
  }

  // Rating Handler
  const handleRatingClick = (rating: number) => {
    onChange(rating)
  }

  // Table Picker Handler
  const handleTableRowSelect = (row: any) => {
    onChange(row)
  }

  // Base Input Class
  const baseInputClass = `w-full px-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${className}`

  const renderInput = () => {
    switch (type) {
      // Basic Inputs
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <input
            type={type}
            name={name}
            readOnly={readonly}
            value={value || ''}
            onChange={(e) => {
              let value = e.target.value
              if (uppercase) {
                value = value.toUpperCase()
              }
              if (lowercase) {
                value = value.toLowerCase()
              }

              if (noSpace) {
                value = value.replaceAll(' ', '-')
              }

              onChange(value)
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={baseInputClass}
          />
        )
      case 'number':
        return (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => {
              const input = e.target.value

              if (/^\d*$/.test(input)) {
                onChange(input)
              }
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={baseInputClass}
          />
        )

      case 'richtext':
        return (
          <QuillEditor
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            height={height}
            width={width}
          />
        )

      case 'password':
        return (
          <div className="relative">
            <input
              type={viewPass ? 'text' : 'password'}
              name={name}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              className={baseInputClass}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-0 text-gray-400 flex items-center h-full"
              onClick={() => {
                setViewPass(!viewPass)
              }}
            >
              {!viewPass ? <i className="fas fa-eye"></i> : <i className="fas fa-eye-slash"></i>}
            </button>
          </div>
        )

      // Textarea
      case 'textarea':
        return (
          <textarea
            name={name}
            readOnly={readonly}
            value={value || ''}
            onChange={(e) => {
              let value = e.target.value
              if (uppercase) {
                value = value.toUpperCase()
              }
              if (lowercase) {
                value = value.toLowerCase()
              }

              if (noSpace) {
                value = value.replaceAll(' ', '-')
              }

              onChange(value)
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={4}
            className={baseInputClass}
          />
        )

      // Currency Indonesia
      case 'currency':
        return (
          <input
            type="text"
            name={name}
            value={formatRupiah(value || '')}
            onChange={handleCurrencyChange}
            placeholder="Rp 0"
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={baseInputClass}
          />
        )

      // Select & Multiselect
      case 'select':
        return (
          <Select
            options={options}
            value={options.find((opt) => opt.value === value) || null}
            onChange={(selected) => onChange(selected?.value || '')}
            placeholder={placeholder}
            isDisabled={disabled}
            styles={{
              input: (base, props) => ({
                ...base,
                color: '#fff',
              }),
              control: (base: any) => ({
                ...base,
                'backgroundColor': dark ? '#1f2937' : '#ffffff',
                'borderColor': dark ? '#374151' : '#d1d5db',
                'color': dark ? '#f3f4f6' : '#111827',
                '&:hover': {
                  borderColor: dark ? '#4b5563' : '#9ca3af',
                },
              }),
              option: (base: any, state: any) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? '#3b82f6'
                  : state.isFocused
                    ? dark
                      ? '#374151'
                      : '#f3f4f6'
                    : dark
                      ? '#1f2937'
                      : '#ffffff',
                color: dark ? '#f3f4f6' : '#111827',
              }),
              singleValue: (base: any) => ({
                ...base,
                color: dark ? '#f3f4f6' : '#111827',
              }),
              multiValue: (base: any) => ({
                ...base,
                backgroundColor: dark ? '#374151' : '#e5e7eb',
              }),
              multiValueLabel: (base: any) => ({
                ...base,
                color: dark ? '#f3f4f6' : '#111827',
              }),
            }}
          />
        )

      case 'multiselect':
        return (
          <Select
            isMulti
            options={options}
            value={options.filter((opt) => value?.includes(opt.value))}
            onChange={(selected: MultiValue<Option>) => onChange(selected.map((opt) => opt.value))}
            placeholder={placeholder}
            isDisabled={disabled}
            styles={{
              input: (base, props) => ({
                ...base,
                color: dark ? '#f3f4f6' : '#111827',
              }),
              control: (base: any) => ({
                ...base,
                'backgroundColor': dark ? '#1f2937' : '#ffffff',
                'borderColor': dark ? '#374151' : '#d1d5db',
                'color': dark ? '#f3f4f6' : '#111827',
                '&:hover': {
                  borderColor: dark ? '#4b5563' : '#9ca3af',
                },
              }),
              option: (base: any, state: any) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? '#3b82f6'
                  : state.isFocused
                    ? dark
                      ? '#374151'
                      : '#f3f4f6'
                    : dark
                      ? '#1f2937'
                      : '#ffffff',
                color: dark ? '#f3f4f6' : '#111827',
              }),
              singleValue: (base: any) => ({
                ...base,
                color: dark ? '#f3f4f6' : '#111827',
              }),
              multiValue: (base: any) => ({
                ...base,
                backgroundColor: dark ? '#374151' : '#e5e7eb',
              }),
              multiValueLabel: (base: any) => ({
                ...base,
                color: dark ? '#f3f4f6' : '#111827',
              }),
            }}
          />
        )

      // Checkbox & Radio
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className={dark ? 'text-white' : 'text-gray-900'}>{placeholder || label}</span>
          </label>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 "
                />
                <span className={dark ? 'text-white' : 'text-gray-900'}>{option.label}</span>
              </label>
            ))}
          </div>
        )

      // Switch Toggle
      case 'switch':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span className={`ml-3 text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>
              {placeholder || label}
            </span>
          </label>
        )

      // Range Slider
      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              name={name}
              value={value || min || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className={`text-center text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>
              {value || min || 0}
            </div>
          </div>
        )

      // Color Picker
      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              name={name}
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-12 p-1 bg-white border border-gray-300 rounded cursor-pointer"
            />
            <span className={`font-mono ${dark ? 'text-white' : 'text-gray-900'}`}>
              {value || '#000000'}
            </span>
          </div>
        )

      // Rating Stars
      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                disabled={disabled}
                className={`text-2xl ${
                  (value || 0) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                } hover:text-yellow-400 disabled:cursor-not-allowed`}
              >
                ★
              </button>
            ))}
          </div>
        )

      // File Upload
      case 'file':
        return (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
              isDragActive
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : dark
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <FiUpload className={`text-2xl ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag & drop files here, or click to select'}
              </p>
            </div>
            {previewFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {previewFiles.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`preview-${index}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewFiles(previewFiles.filter((_, i) => i !== index))
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      // Array Input
      case 'array':
        return (
          <div className="space-y-2">
            {(value || []).map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  disabled={disabled}
                  className={baseInputClass}
                />
                <button
                  type="button"
                  onClick={() => handleArrayRemove(index)}
                  disabled={disabled}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleArrayAdd}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
            >
              <FiPlus /> Add Item
            </button>
          </div>
        )

      // Table Picker
      case 'table-picker':
        return (
          <div className="space-y-2">
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                        >
                          {row[col.key]}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleTableRowSelect(row)}
                          className="px-3 py-1 bg-purple-500 text-white text-xs rounded-md hover:bg-purple-600"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {value && (
              <div className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                Selected: <span className="font-medium">{JSON.stringify(value)}</span>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-sm font-medium text-gray-800 dark:text-white`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {onError}
    </div>
  )
}

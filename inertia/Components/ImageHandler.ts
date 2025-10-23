export class ImageHandler {
  static handleImageUpload(): Promise<string> {
    return new Promise((resolve) => {
      // Create file input element
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.click()

      input.onchange = () => {
        if (input.files && input.files[0]) {
          const file = input.files[0]

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB')
            return
          }

          const reader = new FileReader()

          reader.onload = (e) => {
            // Convert to base64
            const base64 = e.target?.result as string
            resolve(base64)
          }

          reader.onerror = () => {
            alert('Error reading image file')
            resolve('')
          }

          reader.readAsDataURL(file)
        }
      }
    })
  }
}

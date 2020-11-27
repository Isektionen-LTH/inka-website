function removeFile(event) {
    event.preventDefault()
    
    const file = event.target.dataset.file

    const hiddenInput = document.querySelector(`input[type='hidden'][name='media[${file}]']`)
    hiddenInput.value = 'none'
    
    const formGroup = event.target.parentElement.parentElement
    const existingFileContainer = event.target.parentElement

    // Remove button and file link from form group
    formGroup.removeChild(existingFileContainer)

    // Add input for new file
    const fileSelectInput = document.createElement('input')
    fileSelectInput.type = 'file'
    fileSelectInput.name = file

    formGroup.appendChild(fileSelectInput)
}
const nameInput = document.getElementById('nameInput')
const usernameInput = document.getElementById('usernameInput')
const usernameLabel = document.getElementById('usernameLabel')

nameInput.addEventListener('keyup', e => {
    const username = nameInput.value.toLowerCase().replace(/\s/g, '')

    usernameLabel.innerText = username
    usernameInput.value = username
})
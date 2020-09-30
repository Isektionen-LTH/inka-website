// Change password
const changePasswordForm = document.getElementById('changePasswordForm')
changePasswordForm.addEventListener('submit', async e => {
    e.preventDefault()

    const oldPassword = document.getElementById('oldPassword').value
    const newPassword = document.getElementById('newPassword').value
    const newPasswordRepeat = document.getElementById('newPasswordRepeat').value

    // Check if new password is the same twice
    if (newPassword !== newPasswordRepeat) {
        alert('Lösenorden stämmer inte överens')
        return
    }

    // Send password change request
    const response = await fetch('/api/user/changePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
    })

    if (response.ok) {
        alert('Ditt lösenord är nu uppdaterat')
        location.reload()
    }
    else if (response.status === 400) {
        alert('Felaktigt lösenord')
    }
    else {
        alert('Något gick fel, testa att ladda om sidan')
    }
})
changePasswordForm.querySelector('input[name=newPassword]').addEventListener('keyup', e => {
    const zxcvbnScoreMap = {
        0: { color: 'red', text: 'Dåligt' },
        1: { color: 'orange', text: 'Svagt' },
        2: { color: 'yellow', text: 'Okej' },
        3: { color: 'green', text: 'Starkt' },
        4: { color: 'green', text: 'Väldigt starkt' },
    }

    const password = e.target.value
    const result = zxcvbn(password)

    const passwordStrengthWrapper = changePasswordForm.querySelector('#passwordStrengthWrapper')
    const progressBar = passwordStrengthWrapper.querySelector('.progress-bar')
    const passwordStrength = passwordStrengthWrapper.querySelector('p')

    const mappedResult = zxcvbnScoreMap[result.score]
    progressBar.style.width = (100 * (1 + result.score) / 5) + '%'
    progressBar.style.backgroundColor = mappedResult.color
    
    passwordStrength.innerHTML = mappedResult.text
}) 
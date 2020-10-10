const passwordResetForm = document.getElementById('passwordResetForm')
passwordResetForm.addEventListener('submit', async e => {
    e.preventDefault()

    const passwordResetToken = document.getElementById('passwordResetToken').value
    const newPassword = document.getElementById('newPassword').value
    const repeatPassword = document.getElementById('repeatPassword').value

    // Check if new password is the same twice
    if (newPassword !== repeatPassword ) {
        alert('Lösenorden stämmer inte överens')
        return
    }

    // Send password change request
    const response = await fetch('/api/user/changePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ passwordResetToken, newPassword })
    })

    if (response.ok) {
        alert('Ditt lösenord är nu uppdaterat, du omdirigeras nu till inloggningssidan')
        location.href = '/login'
    }
    else if (response.status === 400) {
        alert('Ditt lösenord är för svagt')
    }
    else if (response.status === 401) {
        alert('Länken har gått ut, testa att be om en ny på inloggninssidan')
        location.href = '/login'
    }
    else {
        alert('Något gick fel, testa att ladda om sidan')
    }
})
document.getElementById('newPassword').addEventListener('keyup', e => {
    const zxcvbnScoreMap = {
        0: { color: 'red', text: 'Dåligt' },
        1: { color: 'orange', text: 'Svagt' },
        2: { color: 'yellow', text: 'Okej' },
        3: { color: 'green', text: 'Starkt' },
        4: { color: 'green', text: 'Väldigt starkt' },
    }

    const password = e.target.value
    const result = zxcvbn(password)

    const passwordStrengthWrapper = document.getElementById('passwordStrengthWrapper')
    const progressBar = passwordStrengthWrapper.querySelector('.progress-bar')
    const passwordStrength = passwordStrengthWrapper.querySelector('p')

    const mappedResult = zxcvbnScoreMap[result.score]
    progressBar.style.width = (100 * (1 + result.score) / 5) + '%'
    progressBar.style.backgroundColor = mappedResult.color
    
    passwordStrength.innerHTML = mappedResult.text
}) 
const nodemailer = require('nodemailer')
const pug = require('pug')
const config = require('./config')

const emailTemplatesDir = __dirname + '/views/emails/'

class Mailer {
    /**
     * Get the sender object for the app
     */
    static getSender() {
        return {
            name: config.mailer.senderName,
            address: config.mailer.auth.user
        }
    }

    /**
     * Get the configured transport or a test account if in dev
     */
    static async getTransport() {
        if (config.nodeEnv === 'production') {
            return nodemailer.createTransport(config.mailer)
        }
        else {
            const testAccount = await nodemailer.createTestAccount()
            return nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            })
        }
    }

    /**
     * Send an email and return the success status
     */
    static async sendMail(mail) {
        mail.from = this.getSender()

        const transport = await this.getTransport()
        
        const info = await transport.sendMail(mail)
        const success = info.rejected.length === 0
        
        if (!success) {
            console.error('Email failed to send', info)
        }

        if (config.nodeEnv === 'development') {
            console.log('Sent email: ' + nodemailer.getTestMessageUrl(info))
        }

        return success
    }

    /**
     * Render an html email
     */
    static renderEmail(src, locals) {
        return pug.renderFile(emailTemplatesDir + src + '.pug', locals)
    }

    /**
     * Send an email with information when a business account is created
     */
    static async sendAccountCreated(business) {
        const html = this.renderEmail('business_account_created', { config, business })

        const mail = {
            to: business.contact.email,
            subject: 'Konto skapat på INKAs företagssida',
            html
        }

        // TODO Do something with success status?
        await this.sendMail(mail)
    }

    /**
     * Send an email containing a password reset link
     */
    static async sendPasswordReset(user) {
        const html = this.renderEmail('password_reset_link', { config, user })
        
        const mail = {
            subject: 'Konto skapat på INKAs företagssida',
            html
        }

        if (user.type === 'admin') {
            mail.to = user.username
        }
        else if (user.type === 'business') {
            mail.to = user.contact.email
        }

        await this.sendMail(mail)
    }
}

module.exports = Mailer
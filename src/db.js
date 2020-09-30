const { MongoClient } = require('mongodb')
const Utils = require('./utils')
const config = require('./config')

const userCollection = 'users'


class DB {
  /**
   * Returns a configured client
   */
  static async configuredClient() {
    const client = await (new MongoClient(config.db.connectionString, config.db.connectionOptions)).connect()
    return client
  }

  /**
   * Find user in database by username
   */
  static async findUser(username) {
    const client = await this.configuredClient()
    const db = client.db(config.db.databaseName)
    const users = db.collection(userCollection)
    
    const cursor = users.find({ username }).limit(1)
    const user = await cursor.hasNext() ? await cursor.next() : null

    await client.close()

    return user
  }

  static async createBusiness(businessFields) {
    const client = await this.configuredClient()
    const db = client.db(config.db.databaseName)
    const users = db.collection(userCollection)

    const creatBusinessDefault = {
      username: '',
      password: '',
      type: 'business',
      inka: '',
      info: {
        about: '',
        offers: []
      }
    }

    const business = Utils.mergeDeep(creatBusinessDefault, businessFields)
    await users.insertOne(business)

    await client.close()

    return business
  }

  /**
   * Get admins
   */
  static async getAdmins() {
    const client = await this.configuredClient()
    const db = client.db(config.db.databaseName)
    const users = db.collection(userCollection)

    const cursor = users.find({ type: 'admin' }).sort({ name: 1 })
    const admins = await cursor.toArray()

    await client.close()

    return admins
  }

  /**
   * Update user, merge the updated user object with the existing
   */
  static async updateUser(username, updatedUser) {
    const client = await this.configuredClient()
    const db = client.db(config.db.databaseName)
    const users = db.collection(userCollection)

    await users.updateOne({ username }, { $set: updatedUser })

    await client.close()

    return true
  }


  /**
   * Set new password based on password reset token
   */
  static async setPasswordByToken(token, newPassword) {
    const user = db.find('/users', u => u.passwordResetToken && u.passwordResetToken.value === token)

    if (!user) return false

    const userIndex = db.getIndex('/users', 'username', user.username)

    if (new Date() - user.paswordResetToken.created > config.password.resetTokenMaxAge) {
      // Expire token
      db.push(`/users[${userIndex}]/passwordResetToken`, null, true)
      return false
    }

    // Update the password and token
    db.push(`/users[${userIndex}]/password`, newPassword, true)
    db.push(`/users[${userIndex}]/passwordResetToken`, null, true)
  }

  /**
   * Set new password based on username
   */
  static async setPasswordByUsername(username, newPassword) {
    const client = await this.configuredClient()
    const db = client.db(config.db.databaseName)
    const users = db.collection(userCollection)

    await users.updateOne({ username }, { $set: { password: newPassword} })

    await client.close()
  }

  /**
   * Get a list of all businesses
   */
  static async getBusinesses() {
    const client = await this.configuredClient()
    const db = client.db(config.db.databaseName)
    const users = db.collection(userCollection)

    const cursor = users.find({ type: 'business' }).sort({ name: 1 })
    const businesses = await cursor.toArray()

    await client.close()
    
    return businesses
  }
}

module.exports = DB

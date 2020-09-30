const SENSITIVE_USER_FIELDS = ['_id', 'password', 'passwordResetToken']

class Utils {
  /**
   * Remove keys from object, to protect sensitive data from leaking
   */
  static removeKeys(object, keys) {
    if (!object) return object

    keys.forEach( key => {
      delete object[key]
    })

    return object
  }

  /**
   * Sanitize user object before sending it
   */
  static sanitizeUser(user) {
    return Utils.removeKeys(user, SENSITIVE_USER_FIELDS)
  }

  /**
   * Check if object contains all the keys from target
   */
  static isSibling(object, target) {
    return this.isSubset(object, target) && this.isSubset(target, object)
  }

  /**
   * Make sure that an object is a subset of a parent
   */
  static isSubset(object, parent) {
    for (const key of Object.keys(object)) {
      switch (typeof(parent[key])) {
        case 'undefined': return false
        case 'object':
          if (!Array.isArray(parent[key]) && !this.isSubset(object[key], parent[key])) {
            return false
          }
        default:
          break
      }
    }

    return true
  }

  /**
   * Checks if an item is an object
   */
  static isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  /**
   * Deep merge two objects
   */
  static mergeDeep(target, source) {
    let output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }
}

module.exports = Utils

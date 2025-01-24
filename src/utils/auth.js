import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const TempTokenKey = 'TwoFaTempToken'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getTempToken() {
  return Cookies.get(TempTokenKey)
}

export function setTempToken(token) {
  return Cookies.set(TempTokenKey, token)
}

export function removeTempToken() {
  return Cookies.remove(TempTokenKey)
}

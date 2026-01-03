export function useAuthMock() {
  // Simulate a backend auth API with localStorage and timeouts
  function _fakeNetwork(result, ms = 700) {
    return new Promise((resolve) => setTimeout(() => resolve(result), ms))
  }

  async function login(username, password) {
    // Very simple mock: accept any username/password
    const token = 'mock-token-' + Date.now()
    const user = { id: 1, name: username }
    await _fakeNetwork(true)
    return { token, user }
  }

  async function fetchUser(token) {
    if (!token) return null
    await _fakeNetwork(true, 300)
    return { id: 1, name: 'Demo user' }
  }

  async function changePassword(oldPassword, newPassword) {
    await _fakeNetwork(true, 500)
    if (!oldPassword || !newPassword) throw new Error('Неверные данные')
    // mock always succeeds
    return true
  }

  return { login, fetchUser, changePassword }
}

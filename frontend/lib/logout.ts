export function logoutUser() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("last_session_id")
    window.location.href = "/"
  }
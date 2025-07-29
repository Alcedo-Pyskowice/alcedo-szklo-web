import axiosInstance from '../axios/instance';
import defaultUser from '../utils/default-user';

export async function signIn(email, password) {
  try {
    // Send request
    console.log(email, password);
    const response = await axiosInstance.post("/auth/login", { "user_name": email, "password": password })
    localStorage.setItem('token', JSON.stringify(response.data.data.token));
    localStorage.setItem('user_id', JSON.stringify(response.data.data.user_id));
    localStorage.setItem('name', JSON.stringify(response.data.data.user_symbol));
    return {
      isOk: true,
      data: { user_id: response.data.data.user_id, token: response.data.data.token, name: response.data.data.user_symbol }
    };
  }
  catch {
    return {
      isOk: false,
      message: "Authentication failed"
    };
  }
}

export async function getUser() {
  try {
    // Send request

    return {
      isOk: true,
      data: defaultUser
    };
  }
  catch {
    return {
      isOk: false
    };
  }
}

export function getUserLocal() {
  if (localStorage.getItem("token") && localStorage.getItem("user_id")) {
    return {
      isOk: true,
      data: { user_id: localStorage.getItem("user_id"), token: localStorage.getItem("token"), name: localStorage.getItem("name") }
    }
  }
  return {
    isOk: false
  }
}

export async function createAccount(email, password) {
  try {
    // Send request
    console.log(email, password);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to create account"
    };
  }
}

export async function changePassword(newPassword, token) {
  try {
    // Send request
    await axiosInstance.post((`/users/password/change?token=${token}&password=${newPassword}`))
    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to change password"
    }
  }
}

export async function resetPassword(email) {
  try {
    // Send request
    await axiosInstance.post((`/users/passwordReset?mail=${email}`))
    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to reset password"
    };
  }
}

import axios from "axios"

const API = axios.create({
  baseURL: "http://10.103.190.252:5173/" // your node backend port
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API

import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000
})

//请求拦截器
instance.interceptors.request.use(config => {
  //携带token，请求拦截器
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // console.log(config);
  return config;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});

//响应拦截器
instance.interceptors.response.use(response => {
  // Do something with response data
  console.log("sss:",response);
  if(response.data.code === 401){
    localStorage.clear();
    window.location.href = '/login';

  }
  
  if(response.data.code === 400){
    alert(response.data.message);
  }
  return response.data;
}, error => {
  // Do something with response error
  return Promise.reject(error);
});

export default instance

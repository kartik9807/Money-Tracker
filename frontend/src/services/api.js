import axios from "axios";
const api = axios.create({
    baseURL:`${import.meta.env.VITE_API_BASE_URL}/api/v1`,
    withCredentials:true
})
export default api;

//!“Does fetch reject the promise on HTTP 404/500?” — No.Fetch rejects mainly for network-level failures; 
//! HTTP errors still produce a Response, so you need response.ok/response.status. Axios, by default, rejects non-2xx HTTP responses
//*                HTTP Client
//                       │
//           ┌──────────┴──────────┐
//           │                     │
//         fetch                 Axios
//           │                     │
//    Browser-native          Third-party
//    Very lightweight        More features
//           │                     │
//    Manual handling       Interceptors
//    response.json()       Automatic JSON
//    response.ok           Easier errors
//                          Global config
//                          withCredentials
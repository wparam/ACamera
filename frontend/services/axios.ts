import Axios from "axios";

let urls = {
    test: `${process.env.NEXT_PUBLIC_FRONTEND || 'http://localhost:3000' }`,
    development: `${process.env.NEXT_PUBLIC_FRONTEND || 'http://localhost:3000' }`,
    production: "/" 
}

const api = Axios.create({
    baseURL: urls[process.env.NODE_ENV || 'development'],
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

export default api;

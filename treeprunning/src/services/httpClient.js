import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: {"Access-Control-Allow-Origin": "*" }
});

export default http;

import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:9000',
  timeout: 10000,
  headers: {"Access-Control-Allow-Origin": "*" }
});

export default http;

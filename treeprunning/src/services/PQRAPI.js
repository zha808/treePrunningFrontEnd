import http from "./httpClient";

export async function findAllPqrs() {
  try {
    const response = await http.get('/api/v1/pqrs');
    return response.data;
  } catch (error) {
    console.error('Error fetching PQRs:', error);
  }
}

export async function registerPqr(pqrData) {
  try {
    const response = await http.post('/api/v1/pqrs', pqrData);
    return response.data;
  } catch (error) {
    console.error('Error registering PQR:', error);
  }
}

export async function updatePqr(pqrId, pqrData) {
  try {
    const response = await http.put(`/api/v1/pqrs/${pqrId}`, pqrData);
    return response.data;
  } catch (error) {
    console.error('Error updating PQR:', error);
  }
}

export async function dropPqr(pqrId) {
  try {
    const response = await http.delete(`/api/v1/pqrs/${pqrId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting PQR:', error);
  }
}

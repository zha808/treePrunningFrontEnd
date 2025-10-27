import http from './httpClient';

export async function findStatusById(statusId) {
  try {
    const response = await http.get(`/api/v1/status/${statusId}`);
    console.log(response);
  } catch (error) {
    console.error('Error fetching status by ID:', error);
  }
}

export async function findAllStatus() {
  try {
    const response = await http.get('/api/v1/statuses');
    console.log(response);
  } catch (error) {
    console.error('Error fetching statuses:', error);
  }
}

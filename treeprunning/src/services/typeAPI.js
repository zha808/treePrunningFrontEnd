import http from './httpClient';

export async function findTypeById(statusId) {
  try {
    const response = await http.get(`/api/v1/types${statusId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching status by ID:', error);
  }
}

export async function findAllTypes() {
  try {
    const response = await http.get('/api/v1/types');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching statuses:', error);
  }
}

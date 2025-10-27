import http from './httpClient';

export async function findProgrammingById(statusId) {
  try {
    const response = await http.get(`/api/v1/status/${statusId}`);
    console.log(response);
  } catch (error) {
    console.error('Error fetching status by ID:', error);
  }
}

  export async function findAllProgramming() {
    try {
      const response = await http.get('/api/v1/programmings');
      console.log(response);
    } catch (error) {
      console.error('Error fetching all programmings:', error);
    }
  }


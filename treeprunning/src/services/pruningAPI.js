import http from './httpClient';

export async function findPruningById(pruningId) {
  try {
    const response = await http.get(`/api/v1/pruning/${pruningId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pruning by ID:', error);
  }
}

export async function findPrunings() {
  try {
    const response = await http.get('/api/v1/prunings');
    return response.data;
  } catch (error) {
    console.error('Error fetching prunings:', error);
  }
}

export async function schedulePruning(pruningData) {
  try {
    const response = await http.post('/api/v1/prunings/corrective', pruningData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling pruning:', error);
    return error;
  }
}

export async function dropPruning(pruningId) {
  try {
    const response = await http.delete(`/api/v1/prunings/${pruningId}`);
    return response.data;
  } catch (error) {
    console.error('Error dropping pruning:', error);
  }
}

export async function updatePruning(pruningId, pruningData) {
  try {
    const response = await http.put(`api/v1/pruning/${pruningId}`, pruningData);
    return response.data;
  } catch (error) {
    console.error('Error updating pruning:', error);
  }
}

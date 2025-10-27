import http from './httpClient';

export async function findPruningById(pruningId) {
  try {
    const response = await http.get(`/api/v1/pruning/${pruningId}`);
    console.log(response);
  } catch (error) {
    console.error('Error fetching pruning by ID:', error);
  }
}

export async function findPrunings() {
  try {
    const response = await http.get('/api/v1/prunings');
    console.log(response);
  } catch (error) {
    console.error('Error fetching prunings:', error);
  }
}

export async function schedulePruning(pruningData) {
  try {
    const response = await http.post('/api/v1/prunings', pruningData);
    console.log(response);
  } catch (error) {
    console.error('Error creating pruning:', error);
  }
}

export async function dropPruning(pruningId) {
  try {
    const response = await http.delete(`/api/v1/prunings/${pruningId}`);
    console.log(response);
  } catch (error) {
    console.error('Error dropping pruning:', error);
  }
}

export async function updatePruning(pruningId, pruningData) {
  try {
    const response = await http.put(`api/v1/pruning/${pruningId}`, pruningData);
    console.log(response);
  } catch (error) {
    console.error('Error updating pruning:', error);
  }
}

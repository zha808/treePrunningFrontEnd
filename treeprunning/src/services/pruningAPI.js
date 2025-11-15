import http from './httpClient';

export async function findPruningById(pruningId) {
  try {
    const response = await http.get(`/api/v1/pruning/${pruningId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pruning by ID:', error);
  }
}

export async function findAllPrunings() {
  try {
    const response = await http.get('/api/v1/prunings');
    return response.data;
  } catch (error) {
    return error;
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

export async function schedulePreventivePruning(pruningData) {
  try {
    const response = await http.post('/api/v1/prunings/preventive', pruningData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling preventive pruning:', error);
    return error;
  }
}

export async function cancelPruning(pruningData) {
  try {
    const response = await http.put('/api/v1/prunings/cancel', pruningData);
    return response.data;
  } catch (error) {
    console.error('Error canceling pruning:', error);
    return error;
  }
}

export async function completePruning(pruningData) {
  try {
    const response = await http.put('/api/v1/prunings/complete', pruningData);
    return response.data;
  } catch (error) {
    console.error('Error completing pruning:', error);
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

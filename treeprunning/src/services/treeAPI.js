import http from './httpClient';

export async function findAllTrees() {
  try {
    const response = await http.get('/api/v1/trees');
    return response.data;
  } catch (error) {
    console.error('Error fetching trees:', error);
  }
}

export async function findTreeById(treeId) {
  try {
    const response = await http.get(`/api/v1/trees/${treeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tree by ID:', error);
  }
}

export async function registerTree(treeData) {
  try {
    const response = await http.post('/api/v1/trees', treeData);
    return response.data;
  } catch (error) {
    console.error('Error registering tree:', error);
  }
}

export async function updateTree(treeId, treeData) {
  try {
    const response = await http.put(`/api/v1/trees/${treeId}`, treeData);
    return response.data;
  } catch (error) {
    console.error('Error updating tree:', error);
  }
}

export async function dropTree(treeId) {
  try {
    const response = await http.delete(`/api/v1/trees/${treeId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting tree:', error);
  }
}

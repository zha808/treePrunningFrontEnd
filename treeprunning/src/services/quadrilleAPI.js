import http from './httpClient';

export async function findQuadrilleById(quadrilleId) {
  try {
    const response = await http.get(`/api/v1/quadrilles/${quadrilleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quadrille by ID:', error);
  }
}

export async function findAllQuadrilles() {
  try {
    const response = await http.get('/api/v1/quadrilles');
    return response.data;
  } catch (error) {
    console.error('Error fetching quadrilles:', error);
  }
}

export async function findByFilter(quadrilleFilter) {
  try {
    const response = await http.get('/api/v1/quadrilles', { params: quadrilleFilter });
    return response.data;
  } catch (error) {
    console.error('Error fetching quadrilles:', error);
  }
}

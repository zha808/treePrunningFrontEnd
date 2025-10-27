import http from './httpClient';

export async function findQuadrilleById(quadrilleId) {
  try {
    const response = await http.get(`/api/v1/quadrilles/${quadrilleId}`);
    console.log(response);
  } catch (error) {
    console.error('Error fetching quadrille by ID:', error);
  }
}

export async function findAllQuadrilles() {
  try {
    const response = await http.get('/api/v1/quadrilles');
    console.log(response);
  } catch (error) {
    console.error('Error fetching quadrilles:', error);
  }
}

export async function findByFilter(quadrilleFilter) {
  try {
    const response = await http.get('/api/v1/quadrilles', { params: quadrilleFilter });
    console.log(response);
  } catch (error) {
    console.error('Error fetching quadrilles:', error);
  }
}

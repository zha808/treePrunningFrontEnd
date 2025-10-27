import http from './httpClient';

export async function findAllPersons() {
  try {
    const response = await http.get('/api/v1/users');
    console.log(response);
  } catch (error) {
    console.error('Error fetching persons:', error);
  }
}

export async function registerPerson(personData) {
  try {
    const response = await http.post(`/api/v1/persons`, personData);
    console.log(response);
  } catch (error) {
    console.error('Error registering person:', error);
  }

}

export async function updatePerson(personId, personData) {
  try {
    const response = await http.put(`/api/v1/persons/${personId}`, personData);
    console.log(response);
  } catch (error) {
    console.error('Error updating person:', error);
  }
}

export async function dropPerson(personId) {
  try {
    const response = await http.delete(`/api/v1/persons/${personId}`);
    console.log(response)
  } catch (error) {
    console.error('Error deleting person:', error);
  }
}

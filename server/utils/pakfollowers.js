import axios from 'axios';

const callPakfollowersAPI = async (data, retries = 3) => {
  const url = process.env.PAKFOLLOWERS_API_URL;
  const key = process.env.PAKFOLLOWERS_API_KEY;

  if (!url || !key) {
    throw new Error("Pakfollowers API credentials missing in .env");
  }

  const formData = new URLSearchParams();
  formData.append('key', key);
  for (const [k, v] of Object.entries(data)) {
    formData.append(k, v);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(url, formData.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      return response.data;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Pakfollowers API failed after ${retries} attempts: ${error.message}`);
      }
      await new Promise(res => setTimeout(res, 1000 * attempt)); // exponential backoff
    }
  }
};

export default callPakfollowersAPI;

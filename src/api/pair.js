import axios from 'utils/axios';

export async function GenPairingToken() {
  const { data } = await axios.post(`/pair-device/generate`);

  return data;
}

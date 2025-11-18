// utils/auth.ts
import axios from "axios";

export async function fetchAndStoreToken() {
	//TODO:: Change api to be a functoin in service file
	const authTokenUrl = "https://auth.fhtl.org/get_token";
	try {
		const response = await axios.post(authTokenUrl);
		const token = response.data.access_token;
		sessionStorage.setItem("yourKey", token);
		return token;
	} catch (error) {
		console.error("Error fetching token:", error);
		throw error;
	}
}

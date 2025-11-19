export class ClientCommunicator {
	private readonly SERVER_URL: string;

	constructor(SERVER_URL: string) {
		this.SERVER_URL = SERVER_URL;
	}

	/**
	 * Performs a GET request with optional query parameters.
	 */
	public async doGet<T>(
		endpoint: string,
		queryParams?: Record<string, string>
	): Promise<T> {
		const url = this.getUrl(endpoint, queryParams);

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(
					`[GET ${endpoint}] ${response.status} ${response.statusText}: ${errorBody}`
				);
			}

			return (await response.json()) as T;
		} catch (err) {
			console.error("GET request failed:", err);
			throw err;
		}
	}

	/**
	 * Performs a POST request with a JSON body.
	 */
	public async doPost<REQ, RES>(endpoint: string, body: REQ): Promise<RES> {
		const url = this.getUrl(endpoint);

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(
					`[POST ${endpoint}] ${response.status} ${response.statusText}: ${errorBody}`
				);
			}

			return (await response.json()) as RES;
		} catch (err) {
			console.error("POST request failed:", err);
			throw err;
		}
	}

	/**
	 * Performs a DELETE request with optional query parameters.
	 */
	public async doDelete<T>(
		endpoint: string,
		queryParams?: Record<string, string>
	): Promise<T> {
		const url = this.getUrl(endpoint, queryParams);

		try {
			const response = await fetch(url, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(
					`[DELETE ${endpoint}] ${response.status} ${response.statusText}: ${errorBody}`
				);
			}

			return (await response.json()) as T;
		} catch (err) {
			console.error("DELETE request failed:", err);
			throw err;
		}
	}

	/**
	 * Constructs the full API URL with optional query parameters.
	 */
	private getUrl(
		endpoint: string,
		queryParams?: Record<string, string>
	): string {
		let url = `${this.SERVER_URL}${endpoint}`;

		if (queryParams && Object.keys(queryParams).length > 0) {
			const queryString = new URLSearchParams(queryParams).toString();
			url += `?${queryString}`;
		}

		return url;
	}
}

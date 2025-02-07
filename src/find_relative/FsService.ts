import axios from "axios";

export default class FsService {
    constructor(){}
    static async searchForAncestor(data: any){
        var url = 'https://api.familysearch.org/platform/tree/search?'+"q.surname="+data.lastName;
			if (data.firstName != "") url += '&q.givenName='+data.firstName;
			if (data.birthYear != "") url += "&q.birthLikeDate="+data.birthYear;
			if (data.birthPlace != "") url += "&q.birthLikePlace="+data.birthPlace;
			if (data.deathYear != "") url += "&q.deathLikeDate="+data.deathYear;
			if (data.deathPlace != "") url += "&q.deathLikePlace="+data.deathPlace;

        
            try {
                const response = await axios.get(url, {
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem('yourKey')}`,
                        "Content-Type": 'application/json'
                    }
                });
                console.log("response:", response.data);
                return response.data; // Ensure the data is returned
            } catch (error) {
                console.error("Error grabbing ancestors:", error);
                throw new Error("Error grabbing ancestors"); // Ensure an error is thrown properly
            }
    }
}
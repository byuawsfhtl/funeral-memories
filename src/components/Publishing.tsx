import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export function useFamilySearchResumePublish() {
  const location = useLocation();
  const navigate = useNavigate();

  const [publishResults, setPublishResults] = useState<
    { title: string; success: boolean }[] | null
  >(null);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("fstoken");
    const groupId = localStorage.getItem("groupId");
    const personId = localStorage.getItem("personId");

    if (token && groupId && personId) {
      localStorage.setItem("fstoken", token);
      const service = new FuneralMemoryService();

      (async () => {
        let results;
        try {
          results = await service.publishMemoriesToFamilySearch(
            groupId,
            personId,
            token
          );
          setPublishResults(results);
        } catch (err) {
          console.error("Error publishing:", err);
          setPublishResults([]);
        }

        setIsCleaning(true);

        try {
          await service.deleteGroup(groupId);
          console.log("Group deleted", groupId);
        } catch (err) {
          console.error("Error deleting group:", err);
        } finally {
          localStorage.removeItem("groupId");
          localStorage.removeItem("personId");
          localStorage.removeItem("fstoken");
          localStorage.removeItem("madeGroup");

          setTimeout(() => {
            navigate("/", { replace: true });
          }, 4000); // give user a moment to see cleaning finished
        }
      })();
    }
  }, [location, navigate]);

  return { publishResults, isCleaning };
}

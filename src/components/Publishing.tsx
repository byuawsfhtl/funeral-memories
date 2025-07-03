import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export function useFamilySearchResumePublish() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("fstoken");
    const groupId = localStorage.getItem("groupId");
    const personId = localStorage.getItem("personId");

    if (token && groupId && personId) {
      localStorage.setItem("fstoken", token);
      const service = new FuneralMemoryService();

      (async () => {
        try {
          const results = await service.publishMemoriesToFamilySearch(
            groupId,
            personId,
            token
          );
          results.forEach((r) =>
            console.log(
              `Memory: ${r.title} — ${r.success ? "✅ Success" : "❌ Failed"}`
            )
          );
          alert(
            `Published ${results.filter((r) => r.success).length} memories!`
          );
          await service.deleteGroup(groupId);
          console.log("Group deleted", groupId);
        } catch (err) {
          console.error("Error publishing:", err);
          alert("Failed to publish some or all memories.");
        } finally {
          // Clean up
          localStorage.removeItem("groupId");
          localStorage.removeItem("personId");
          localStorage.removeItem("fstoken");
          localStorage.removeItem("madeGroup");
          navigate(location.pathname, { replace: true }); // remove ?fstoken=... from URL
        }
      })();
    }
  }, [location, navigate]);
}

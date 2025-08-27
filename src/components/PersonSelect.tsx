import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

export default function PersonSelect() {
  const navigate = useNavigate();

  return (
    <main
      className="d-flex justify-content-center align-items-center flex-column container my-5"
      style={{ minHeight: "80vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h1
          className="text-center mb-4"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
        >
          Select Your Relative
        </h1>

        <div className="d-grid gap-3 mt-4">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/findRelative")}
          >
            🔍 Find through FamilySearch
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/addPerson")}
          >
            ✍️ Add Person Manually
          </button>
        </div>
      </div>
    </main>
  );
}

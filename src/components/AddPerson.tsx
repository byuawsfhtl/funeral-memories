import React, {
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import { uploadPersonAndPortrait } from "../../api/uploadPerson";
import { fetchAndStoreToken } from "../../api/auth";
import { useLocation } from "react-router";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function AddPerson() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sex, setSex] = useState<string>("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [marriageDate, setMarriageDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  function toDateOrNull(dateStr: string): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  function dateToPartialDate(
    date: Date | null | undefined
  ): { year?: string; month?: string; day?: string } | null {
    if (!date) return null;
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString(); // JS months 0-based
    const day = date.getUTCDate().toString();
    return { year, month, day };
  }

  function parseDateString(
    dateString: string
  ): { year?: string; month?: string; day?: string } | undefined {
    if (!dateString) return undefined;
    const parts = dateString.split("-");
    if (parts.length < 1) return undefined;

    return {
      year: parts[0] || undefined,
      month: parts[1] || undefined,
      day: parts[2] || undefined,
    };
  }

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search);
      const fstoken = params.get("fstoken");
      if (!fstoken) return;

      // Load values from localStorage into local vars
      const storedName = localStorage.getItem("addName") || "";
      const storedSex = localStorage.getItem("addSex") || "";
      const storedBirthDate = localStorage.getItem("addBirthDate") || "";
      const storedDeathDate = localStorage.getItem("addDeathDate") || "";
      const storedMarriageDate = localStorage.getItem("addMarriageDate") || "";
      const storedBirthPlace = localStorage.getItem("addBirthPlace") || "";
      const base64Photo = localStorage.getItem("addPhotoBase64") || "";
      const fileName = localStorage.getItem("addPhoto") || "";

      // Update React state for UI
      setName(storedName);
      setSex(storedSex);
      setBirthDate(storedBirthDate);
      setDeathDate(storedDeathDate);
      setMarriageDate(storedMarriageDate);
      setBirthPlace(storedBirthPlace);
      if (base64Photo) {
        const file = base64ToFile(base64Photo, fileName);
        setPhoto(file);
        setPreviewUrl(base64Photo);
      }

      let token = await fetchAndStoreToken();

      // Convert date strings to objects
      const birthDateObj = dateToPartialDate(toDateOrNull(storedBirthDate));
      const deathDateObj = dateToPartialDate(toDateOrNull(storedDeathDate));
      const marriageDateObj = dateToPartialDate(
        toDateOrNull(storedMarriageDate)
      );

      // Pass the *local* variables here, NOT the (not updated yet) React state
      const { pid, memoryUrl } = await uploadPersonAndPortrait({
        name: storedName,
        sex: storedSex,
        birthDate: birthDateObj,
        deathDate: deathDateObj,
        marriageDate: marriageDateObj,
        birthPlace: storedBirthPlace,
        photo: base64Photo ? base64ToFile(base64Photo, fileName) : null!,
        token,
        fstoken,
      });

      alert("Person and portrait uploaded successfully! PID: " + pid);

      // Reset states if needed here
      setName("");
      setPhoto(null);
      setPreviewUrl(null);
      setSex("");
      setBirthDate("");
      setDeathDate("");
      setMarriageDate("");
    };

    run();
  }, []);

  function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleBirthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
  };

  const handleBirthPlaceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
  };

  const handleDeathChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeathDate(e.target.value);
  };

  const handleMarriageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMarriageDate(e.target.value);
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setPhoto(file);

      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhoto(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a name.");
      return;
    }
    if (!photo) {
      alert("Please upload a photo.");
      return;
    }
    try {
      setLoading(true);
      //TODO: Add real token"
      //ADD CHECKS
      localStorage.setItem("addName", name);
      localStorage.setItem("addSex", sex);
      localStorage.setItem("addBirthDate", birthDate);
      localStorage.setItem("addBirthPlace", birthPlace);
      localStorage.setItem("addDeathDate", deathDate);
      localStorage.setItem("addMarriageDate", marriageDate);
      localStorage.setItem("addPhoto", photo.name);
      localStorage.setItem("addDeathDate", deathDate);
      // Convert photo (File) to base64 string and store in localStorage
      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const base64Photo = await toBase64(photo);
      localStorage.setItem("addPhotoBase64", base64Photo);

      // To convert base64 string back to a File:
      // (You can use this code wherever you need to restore the File object)

      // Example usage:
      // const restoredFile = base64ToFile(base64Photo, photo.name);

      const redirectUri = `${window.location.origin}${location.pathname}`;
      window.location.href = `https://auth.fhtl.org?redirect=${redirectUri}`;
    } catch (error: any) {
      alert(error.message || "Error uploading person and portrait.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="d-flex flex-grow-1 justify-content-center align-items-center flex-column"
      style={{ padding: "2rem" }}
    >
      <div style={{ width: "100%", maxWidth: 500 }}>
        <h1 className="text-center mb-4">Add a Person</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="personName" className="form-label">
              Name<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="personName"
              className="form-control"
              placeholder="Enter name"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="birthDate" className="form-label">
              Birth Date <span className="text-muted small">(optional)</span>
            </label>
            <input
              type="date"
              id="birthDate"
              className="form-control"
              placeholder="Enter Birth Date"
              value={birthDate}
              onChange={handleBirthChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="birthDate" className="form-label">
              Birth Place <span className="text-muted small">(optional)</span>
            </label>
            <input
              type="text"
              id="birthPlace"
              className="form-control"
              placeholder="Enter Birth Place"
              value={birthPlace}
              onChange={handleBirthPlaceChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="deathDate" className="form-label">
              Death Date <span className="text-muted small">(optional)</span>
            </label>
            <input
              type="date"
              id="deathDate"
              className="form-control"
              placeholder="Enter Death Date"
              value={deathDate}
              onChange={handleDeathChange}
            />
          </div>
          {/* <div className="mb-3">
            <label htmlFor="deathDate" className="form-label">
              Marriage Date <span className="text-muted small">(optional)</span>
            </label>
            <input
              type="date"
              id="marriageDate"
              className="form-control"
              placeholder="Enter Marriage Date"
              value={marriageDate}
              onChange={handleMarriageChange}
            />
          </div> */}
          <div className="mb-3">
            <label htmlFor="personPhoto" className="form-label">
              Add Portrait
            </label>
            <input
              type="file"
              id="personPhoto"
              accept="image/*"
              className="form-control"
              onChange={handlePhotoChange}
              required
              ref={fileInputRef}
            />
          </div>
          {previewUrl && (
            <div
              className="position-relative mt-2"
              style={{ display: "inline-block" }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="img-fluid"
                style={{ maxHeight: "150px", borderRadius: "8px" }}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute"
                style={{
                  top: 0,
                  right: 0,
                  transform: "translate(50%, -50%)",
                  borderRadius: "50%",
                  padding: 0,
                  width: 28,
                  height: 28,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => {
                  setPreviewUrl(null);
                  setPhoto(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Remove photo"
              >
                &times;
              </button>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="sex" className="form-label">
              Sex<span className="text-danger">*</span>
            </label>
            <div
              className="btn-group w-100"
              role="group"
              aria-label="Select sex"
            >
              <input
                type="radio"
                className="btn-check"
                name="sex"
                id="sexMale"
                autoComplete="off"
                value="Male"
                checked={sex === "Male"}
                onChange={() => setSex("Male")}
                required
              />
              <label className="btn btn-outline-primary" htmlFor="sexMale">
                Male
              </label>

              <input
                type="radio"
                className="btn-check"
                name="sex"
                id="sexFemale"
                autoComplete="off"
                value="Female"
                checked={sex === "Female"}
                onChange={() => setSex("Female")}
                required
              />
              <label className="btn btn-outline-primary" htmlFor="sexFemale">
                Female
              </label>
            </div>
          </div>

          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-primary btn-lg">
              Add Person
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

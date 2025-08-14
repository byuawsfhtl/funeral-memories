import React, { useState, useRef, ChangeEvent, FormEvent } from "react";

export default function AddPerson() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sex, setSex] = useState<string>("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleBirthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
  };

  const handleDeathChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeathDate(e.target.value);
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a name.");
      return;
    }
    if (!photo) {
      alert("Please upload a photo.");
      return;

      //post person with whatever info
      //get back PID from response
      //use person portrait api with that id
    }

    // Here you can handle the form submission, e.g., send data to backend
    // For now, just log the inputs
    console.log({ name, photo });

    alert("Person added!");

    // Reset form
    setName("");
    setPhoto(null);
    setPreviewUrl(null);
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
              Birth Date
            </label>
            <input
              type="text"
              id="birthDate"
              className="form-control"
              placeholder="Enter Birth Date"
              value={name}
              onChange={handleBirthChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="deathDate" className="form-label">
              Death Date
            </label>
            <input
              type="text"
              id="deathDate"
              className="form-control"
              placeholder="Enter Death Date"
              value={name}
              onChange={handleDeathChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="personPhoto" className="form-label">
              Upload Photo
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

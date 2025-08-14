import React, { useState, ChangeEvent, FormEvent } from "react";

export default function AddPerson() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sex, setSex] = useState<string>("");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
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
            <label htmlFor="personPhoto" className="form-label">
              Upload Photo<span className="text-danger">*</span>
            </label>
            <input
              type="file"
              id="personPhoto"
              accept="image/*"
              className="form-control"
              onChange={handlePhotoChange}
              required
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
            <div className="mb-3 text-center">
              <p>Preview:</p>
              <img
                src={previewUrl}
                alt="Photo preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                }}
              />
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

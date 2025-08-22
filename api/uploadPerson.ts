// uploadPerson.ts

export interface UploadPersonParams {
  name: string;
  sex: string;
  birthDate?: string;
  deathDate?: string;
  photo: File;
  token: string;
  fstoken: string;
}

export async function uploadPersonAndPortrait({
  name,
  sex,
  birthDate,
  deathDate,
  photo,
  token,
  fstoken,
}: UploadPersonParams): Promise<{ pid: string; memoryUrl: string }> {
  // 1. Format gender and names
  const genderType = sex
    ? `http://gedcomx.org/${sex}`
    : "http://gedcomx.org/Unknown";
  const nameParts = name.trim().split(" ");
  const given = nameParts.slice(0, -1).join(" ") || name;
  const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  const nameForms = [
    {
      fullText: name,
      parts: [
        { type: "http://gedcomx.org/Given", value: given },
        ...(surname
          ? [{ type: "http://gedcomx.org/Surname", value: surname }]
          : []),
      ],
    },
  ];
  // TODO: Format birth/death dates into facts if needed

  const personPayload = {
    persons: [
      {
        living: false,
        gender: {
          type: genderType,
          attribution: { changeMessage: "Added via AddPerson form" },
        },
        names: [
          {
            type: "http://gedcomx.org/BirthName",
            preferred: true,
            attribution: { changeMessage: "Name added via form" },
            nameForms,
          },
        ],
        // facts: [], // Add parsed dates here if you want, but names/gender are most crucial
      },
    ],
  };

  alert("Uploading person...");

  // 2. Create person (POST)
  const personResponse = await fetch(
    "https://api.familysearch.org/platform/tree/persons",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-fs-v1+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(personPayload),
    }
  );
  if (!personResponse.ok) {
    const errorText = await personResponse.text();
    throw new Error(
      `Person upload failed: ${personResponse.statusText} - ${errorText}`
    );
  }

  const pid = personResponse.headers.get("x-entity-id");
  if (!pid) {
    throw new Error("Could not get person ID from response");
  }

  alert("Person uploaded successfully! PID: " + pid);

  // 3. Upload photo to Memories
  // 3. Upload photo to Memories using FormData
  const formData = new FormData();
  formData.append("artifact", photo);
  formData.append("title", "Portrait Photo");
  formData.append("filename", photo.name);

  alert("Uploading portrait...");
  const memoryResponse = await fetch(
    "https://api.familysearch.org/platform/memories/memories",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fstoken}`,
        // DO NOT SET 'Content-Type' for FormData!
      },
      body: formData,
    }
  );

  if (!memoryResponse.ok) {
    throw new Error(`Memory upload failed: ${memoryResponse.statusText}`);
  }
  const memoryUrl =
    memoryResponse.headers.get("content-location") ||
    memoryResponse.headers.get("Content-Location");

  if (!memoryUrl) {
    throw new Error("Could not get memory URL from response");
  }

  alert("Portrait uploaded successfully! Memory URL: " + memoryUrl);
  // 4. Attach memory as portrait
  const portraitPayload = {
    persons: [
      {
        media: [
          {
            description: memoryUrl,
            attribution: {
              changeMessage: "Portrait added from AddPerson form",
            },
          },
        ],
      },
    ],
  };

  alert("Attaching portrait to person...");
  const portraitResponse = await fetch(
    `https://api.familysearch.org/platform/tree/persons/${pid}/portraits`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-gedcomx-v1+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(portraitPayload),
    }
  );
  if (!portraitResponse.ok) {
    throw new Error(`Portrait upload failed: ${portraitResponse.statusText}`);
  }

  if (!memoryResponse.ok) {
    const errorText = await memoryResponse.text();
    throw new Error(
      `Memory upload failed: ${memoryResponse.statusText} - ${errorText}`
    );
  }

  if (!portraitResponse.ok) {
    const errorText = await portraitResponse.text();
    throw new Error(
      `Portrait upload failed: ${portraitResponse.statusText} - ${errorText}`
    );
  }

  return { pid, memoryUrl };
}

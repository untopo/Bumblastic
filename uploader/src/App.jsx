import React, { useState } from "react";

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export default function App() {
  const [image, setImage] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [notes, setNotes] = useState("");
  const [pat, setPat] = useState("");
  const [status, setStatus] = useState("");
  const [yourGitHubUsername, setYourGitHubUsername] = useState("untopo");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Uploading...");
    if (!image || !profileName || !pat) {
      setStatus("Missing required info.");
      return;
    }

    // Date for filenames
    const today = new Date().toISOString().slice(0, 10);
    const slug = toSlug(profileName) + "_" + today;

    // 1. Upload image to /images/
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];

      // Upload image to GitHub
      const imgRes = await fetch(
        `https://api.github.com/repos/${yourGitHubUsername}/Bumblastic/contents/images/${slug}.jpg`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${pat}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `add image for ${profileName}`,
            content: base64Image,
          }),
        }
      );

      if (!imgRes.ok) {
        setStatus("Failed to upload image.");
        return;
      }

      // 2. Upload profile markdown to /profiles/
      const md = `# Profile: ${profileName}

- **Name:** ${profileName}
- **Date of Encounter:** ${today}
- **Profile screenshot:** ![profile](../images/${slug}.jpg)

## My Notes
${notes}
`;

      const mdBase64 = btoa(unescape(encodeURIComponent(md)));
      const mdRes = await fetch(
        `https://api.github.com/repos/${yourGitHubUsername}/Bumblastic/contents/profiles/${slug}.md`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${pat}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `add profile for ${profileName}`,
            content: mdBase64,
          }),
        }
      );

      if (mdRes.ok) {
        setStatus("Done! Files uploaded to your repo.");
      } else {
        setStatus("Failed to upload profile markdown.");
      }
    };

    reader.readAsDataURL(image);
  }

  return (
    <div style={{ maxWidth: 500, margin: "2em auto", fontFamily: "sans-serif" }}>
      <h2>Bumblastic Uploader</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Profile Name:
            <input value={profileName} onChange={e => setProfileName(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Notes:
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
          </label>
        </div>
        <div>
          <label>
            Screenshot:
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} required />
          </label>
        </div>
        <div>
          <label>
            GitHub PAT: 
            <input type="password" value={pat} onChange={e => setPat(e.target.value)} required />
          </label>
          <small>
            <br />Your Personal Access Token (see instructions below). Never share this!
          </small>
        </div>
        <div>
          <label>
            Your GitHub Username:
            <input value={yourGitHubUsername} onChange={e => setYourGitHubUsername(e.target.value)} required />
          </label>
        </div>
        <button type="submit" style={{ marginTop: "1em" }}>Upload</button>
      </form>
      <div style={{ marginTop: "1em", color: status.includes("Fail") ? "red" : "green" }}>{status}</div>
    </div>
  );
}

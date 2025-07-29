import "bootstrap/dist/css/bootstrap.min.css";

export default function Instructions() {
  return (
    <div className="container mt-3 mb-5 pt-0">
      <h1 className="mb-4 text-center">🕊 How to Use Funeral Memories</h1>

      <p>
        Funeral Memories is a shared space for preserving and celebrating the
        life of a loved one. Here’s how to use the app, whether you’re joining
        an existing group or hosting your own.
      </p>

      <hr />

      <h2 className="mt-5">👥 For All Users</h2>

      <h4 className="mt-4">✅ Join a Memory Wall</h4>
      <ul>
        <li>
          Enter a <strong>Group ID</strong> on the homepage to join a wall.
        </li>
        <li>You’ll be taken to that group’s shared Memory Wall.</li>
      </ul>

      <h4 className="mt-4">📝 Add a Memory</h4>
      <ul>
        <li>
          Click <strong>"Add Memory"</strong> to write a message, upload a
          photo, and optionally show your name.
        </li>
        <li>
          Click <strong>"Submit"</strong> to publish it to the wall.
        </li>
      </ul>

      <h4 className="mt-4">✏️ Edit or Delete Your Memory</h4>
      <ul>
        <li>Click on your memory to edit or delete it.</li>
        <li>
          Only the person who created a memory can modify it, unless an admin
          deletes it.
        </li>
      </ul>

      <hr className="my-5" />

      <h2>🔒 For Admins (Hosts)</h2>

      <h4 className="mt-4">🚀 Start a New Group</h4>
      <ul>
        <li>
          Click <strong>"Host a Group"</strong> on the homepage.
        </li>
        <li>
          Enter your <strong>email</strong> and create a{" "}
          <strong>password</strong>.
        </li>
        <li>
          Type in a name in the search bars (only last name required) to search
          through the FamilySearch database to find the person you are having
          the funeral for. Make sure they are marked as deceased in FamilySearch
          or else they won't show up when searched.
        </li>
        <li>
          Select the <strong>person</strong> you're making the wall for and
          confirm — this generates a Group ID and the starting blank memory
          wall.
        </li>
      </ul>

      <h4 className="mt-4">🧱 Manage the Wall</h4>
      <ul>
        <li>
          Admins can delete <strong>any memory</strong> by clicking on the
          memory, and then selecting the <strong>delete</strong> button.
        </li>
      </ul>

      <h4 className="mt-4">📄 Export or Publish Memories</h4>
      <ul>
        <li>
          Click the <strong>three dots (⋮)</strong> next to the Group ID on the
          Memory Wall.
        </li>
        <li>
          Choose to <strong>export as PDF</strong> or{" "}
          <strong>publish to FamilySearch</strong>. If you are wanting to do
          both, export it as a PDF <strong>first</strong>, then publish to
          FamilySearch as it will delete the wall and all corresponding memories
          after publishing.
        </li>
      </ul>

      <h4 className="mt-4">🔐 Admin Access</h4>
      <ul>
        <li>
          Admin privileges are session-based. To rejoin as an admin, go to{" "}
          <strong>Join a Group</strong>, click <strong>Join as Admin</strong>,
          and enter your saved email, password, and Group ID.
        </li>
      </ul>
    </div>
  );
}


export default function Page() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login with GitHub</h1>
      <a href="http://localhost:8000/auth/github/login">
        <button>Login with GitHub</button>
      </a>
    </div>
  );
}

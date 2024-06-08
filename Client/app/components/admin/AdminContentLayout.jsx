export default function Layout({ children }) {
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-4"></div>
          <div className="col-8 pt-5">{children}</div>
        </div>
      </div>
    </>
  );
}

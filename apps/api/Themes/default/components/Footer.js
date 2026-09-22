export default function Footer({children}) {
    return (
        <footer className="footer">
            <div className="container">
                <div className="content has-text-centered">
                    {children}
                </div>
            </div>
        </footer>
    )
}
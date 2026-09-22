export default function Header({children}) {
    return (
        <header className="header">
            <div className="container">
                <div className="content has-text-centered">
                    {children}
                </div>
            </div>
        </header>
    )
}
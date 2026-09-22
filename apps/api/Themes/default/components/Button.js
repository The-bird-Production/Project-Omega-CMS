export default function Button ({label , color, onClick}) {
    return (
        <button onClick={onClick} className={"btn btn-" + color}>
            {label}
        </button>
    )
}